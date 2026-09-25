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
    textContent: '',
    attributes: {},
    classList: createClassList(),
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    getAttribute(name) {
      return this.attributes[name] || '';
    },
  };
}

function createStorage({ throwOnGet = false, throwOnSet = false, seed = {} } = {}) {
  const data = new Map(Object.entries(seed));
  return {
    getItem(key) {
      if (throwOnGet) throw new Error('get blocked');
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      if (throwOnSet) throw new Error('set blocked');
      data.set(key, String(value));
    },
  };
}

function buildContext(storageOptions) {
  const elementMap = new Map();
  elementMap.set('darkModeToggle', createElement());
  elementMap.set('darkModeState', createElement());

  const documentElement = {
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    getAttribute(name) {
      return this.attributes[name] || '';
    },
  };

  return {
    console,
    localStorage: createStorage(storageOptions),
    document: {
      documentElement,
      getElementById(id) {
        if (!elementMap.has(id)) {
          elementMap.set(id, createElement());
        }
        return elementMap.get(id);
      },
      querySelectorAll() {
        return [];
      },
      querySelector() {
        return null;
      },
    },
    __elements: elementMap,
  };
}

function loadThemeSnippet(context) {
  const scriptPath = path.resolve(__dirname, '../../../docs/script.js');
  const source = fs.readFileSync(scriptPath, 'utf8');
  const start = source.indexOf("const darkModeToggle = document.getElementById('darkModeToggle');");
  const end = source.indexOf('async function createPasswordHash');
  if (start < 0 || end < 0 || end <= start) {
    throw new Error('Could not isolate theme preference block from docs/script.js');
  }
  const snippet = `${source.slice(start, end)}\n;globalThis.__themeApi = { getStoredThemePreference, saveThemePreference, syncThemeToggle, applyTheme, THEME_STORAGE_KEY, LIGHT_THEME, DARK_THEME };`;
  vm.createContext(context);
  vm.runInContext(snippet, context, { filename: 'theme-snippet.js' });
  return context.__themeApi;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function testDocsMarkupIncludesThemeToggle() {
  const indexPath = path.resolve(__dirname, '../../../docs/index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  assert(html.includes('id="darkModeToggle"'), 'Expected docs/index.html to include the dark-mode toggle');
  assert(html.includes("nextpath.theme.v1"), 'Expected docs/index.html to preload the stored theme preference');
}

function testAccountCardsUseThemeAwareStyles() {
  const stylesPath = path.resolve(__dirname, '../../../docs/styles.css');
  const css = fs.readFileSync(stylesPath, 'utf8');
  assert(css.includes('.login-account-tile {') && css.includes('background: var(--surface-strong);'), 'Expected login account cards to use theme-aware surface colors');
  assert(css.includes('.account-chip-copy strong,\n.account-chip-copy span {') && css.includes('text-overflow: ellipsis;'), 'Expected account summary text to keep truncation safeguards for long secondary labels');
}

function testApplyThemeUpdatesControlState() {
  const context = buildContext();
  const api = loadThemeSnippet(context);
  const toggle = context.__elements.get('darkModeToggle');
  const state = context.__elements.get('darkModeState');

  api.applyTheme(api.DARK_THEME);

  assert(context.document.documentElement.getAttribute('data-theme') === 'dark', 'Expected applyTheme to set the dark theme on the document root');
  assert(toggle.getAttribute('aria-checked') === 'true', 'Expected applyTheme to mark the switch as on');
  assert(state.textContent === 'On', 'Expected applyTheme to update the visible state label');

  api.applyTheme(api.LIGHT_THEME);

  assert(context.document.documentElement.getAttribute('data-theme') === 'light', 'Expected applyTheme to set the light theme on the document root');
  assert(toggle.getAttribute('aria-checked') === 'false', 'Expected applyTheme to mark the switch as off');
  assert(state.textContent === 'Off', 'Expected applyTheme to restore the off state label');
}

function testThemePreferencePersistence() {
  const context = buildContext();
  const api = loadThemeSnippet(context);

  api.saveThemePreference(api.DARK_THEME);
  assert(context.localStorage.getItem(api.THEME_STORAGE_KEY) === 'dark', 'Expected saveThemePreference to persist the selected theme');
  assert(api.getStoredThemePreference() === 'dark', 'Expected getStoredThemePreference to read a valid saved theme');

  context.localStorage.setItem(api.THEME_STORAGE_KEY, 'sepia');
  assert(api.getStoredThemePreference() === '', 'Expected invalid stored values to be ignored');
}

function testStorageFailuresFallBackSafely() {
  const context = buildContext({ throwOnGet: true, throwOnSet: true });
  const api = loadThemeSnippet(context);

  api.saveThemePreference(api.DARK_THEME);
  assert(api.getStoredThemePreference() === '', 'Expected storage read failures to fall back to no saved preference');
  api.applyTheme(api.DARK_THEME);
  assert(context.document.documentElement.getAttribute('data-theme') === 'dark', 'Expected theme application to keep working even when persistence fails');
}

(() => {
  testDocsMarkupIncludesThemeToggle();
  testAccountCardsUseThemeAwareStyles();
  testApplyThemeUpdatesControlState();
  testThemePreferencePersistence();
  testStorageFailuresFallBackSafely();
  console.log('Frontend theme preference validation passed');
})();
