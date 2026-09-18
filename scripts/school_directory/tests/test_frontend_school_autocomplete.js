#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add: (...items) => items.forEach((item) => set.add(item)),
    remove: (...items) => items.forEach((item) => set.delete(item)),
    contains: (item) => set.has(item),
    toggle: (item, force) => {
      if (typeof force === 'boolean') {
        if (force) set.add(item); else set.delete(item);
        return force;
      }
      if (set.has(item)) {
        set.delete(item);
        return false;
      }
      set.add(item);
      return true;
    },
  };
}

function createElement() {
  return {
    value: '',
    textContent: '',
    innerHTML: '',
    dataset: {},
    required: false,
    classList: createClassList(['hidden-field']),
    attributes: {},
    listeners: {},
    querySelectorAll: () => [],
    contains: () => false,
    parentElement: { contains: () => false },
    addEventListener(type, cb) {
      this.listeners[type] = cb;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
  };
}

function buildContext(fetchImpl) {
  const schoolSearch = createElement();
  const schoolSuggestions = createElement();
  schoolSuggestions.classList = createClassList();
  const schoolAbbreviation = createElement();
  const noSchoolButton = createElement();
  const otherSchool = createElement();
  const schoolDirectoryStatus = createElement();

  const elementMap = {
    schoolSearch,
    schoolSuggestions,
    schoolAbbreviation,
    noSchoolButton,
    otherSchool,
    schoolDirectoryStatus,
  };

  return {
    console,
    fetch: fetchImpl,
    escapeHtml: (value) => String(value),
    document: {
      getElementById(id) {
        return elementMap[id] || null;
      },
      addEventListener() {},
    },
    __elements: elementMap,
  };
}

function loadSchoolSnippet(context) {
  const scriptPath = path.resolve(__dirname, '../../../docs/script.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const start = source.indexOf("const schoolSearch = document.getElementById('schoolSearch');");
  const end = source.indexOf('if (noSchoolButton && otherSchool) {');
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Could not isolate school autocomplete block from docs/script.js');
  }
  const snippet = source.slice(start, end) + '\n;globalThis.__schoolApi = { loadSchoolDirectory, updateSchoolSuggestionsFromQuery };\n';
  vm.createContext(context);
  vm.runInContext(snippet, context, { filename: 'school-snippet.js' });
  return context.__schoolApi;
}

async function testLoadSuccess() {
  const context = buildContext(async () => ({
    ok: true,
    async json() {
      return {
        fixtureMode: false,
        productionReady: true,
        records: [
          { id: 'ccd-public:1', name: 'Lincoln High School', type: 'high-school', city: 'Portland', state: 'OR', searchText: 'lincoln high school portland or' },
        ],
      };
    },
  }));
  const api = loadSchoolSnippet(context);
  await api.loadSchoolDirectory();

  if (!context.__elements.schoolDirectoryStatus.textContent.includes('Official U.S. school directory loaded')) {
    throw new Error('Expected success status after loading directory');
  }
}

async function testFixturePreviewShowsGuidance() {
  const context = buildContext(async () => ({
    ok: true,
    async json() {
      return {
        fixtureMode: true,
        records: [
          { id: 'ccd-public:1', name: 'Lincoln High School', type: 'high-school', city: 'Portland', state: 'OR', searchText: 'lincoln high school portland or' },
        ],
      };
    },
  }));
  const api = loadSchoolSnippet(context);
  await api.loadSchoolDirectory();

  if (!context.__elements.schoolDirectoryStatus.textContent.includes('Development preview directory loaded')) {
    throw new Error('Expected preview guidance when fixture-limited directory data loads');
  }
  if (context.__elements.otherSchool.classList.contains('hidden-field')) {
    throw new Error('Expected manual school input to stay visible for fixture preview data');
  }
}

async function testPartialOfficialDataShowsManualFallback() {
  const context = buildContext(async () => ({
    ok: true,
    async json() {
      return {
        fixtureMode: false,
        productionReady: false,
        records: [
          { id: 'ccd-public:1', name: 'Lincoln High School', type: 'high-school', city: 'Portland', state: 'OR', searchText: 'lincoln high school portland or' },
        ],
      };
    },
  }));
  const api = loadSchoolSnippet(context);
  await api.loadSchoolDirectory();

  if (!context.__elements.schoolDirectoryStatus.textContent.includes('only partially available')) {
    throw new Error('Expected partial-data guidance when productionReady is false');
  }
  if (context.__elements.otherSchool.classList.contains('hidden-field')) {
    throw new Error('Expected manual school input to stay visible for partial official data');
  }
}

async function testLoadFailureShowsManualFallback() {
  const context = buildContext(async () => {
    throw new Error('network');
  });
  const api = loadSchoolSnippet(context);
  await api.loadSchoolDirectory();

  if (!context.__elements.schoolDirectoryStatus.textContent.includes('unavailable')) {
    throw new Error('Expected unavailable status when directory fetch fails');
  }
  if (context.__elements.otherSchool.classList.contains('hidden-field')) {
    throw new Error('Expected manual school input to be shown on directory load failure');
  }
}

(async () => {
  await testLoadSuccess();
  await testFixturePreviewShowsGuidance();
  await testPartialOfficialDataShowsManualFallback();
  await testLoadFailureShowsManualFallback();
  console.log('Frontend school autocomplete validation passed');
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
