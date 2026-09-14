const screens = Array.from(document.querySelectorAll('.screen'));
const stepPills = Array.from(document.querySelectorAll('.step-pill'));
const nextButtons = document.querySelectorAll('.next-btn');
const prevButtons = document.querySelectorAll('.prev-btn');
const ageRange = document.getElementById('ageRange');
const ageValue = document.getElementById('ageValue');
const ageNote = document.getElementById('ageNote');
const ageTag = document.getElementById('ageTag');
const firstNameInput = document.getElementById('firstName');
const emailInput = document.getElementById('emailAddress');
const profileBio = document.getElementById('profileBio');
const accountSummary = document.getElementById('accountSummary');
const accountSummaryButton = document.getElementById('accountSummaryButton');
const accountSettingsButton = document.getElementById('accountSettingsButton');
const accountSummaryAvatar = document.getElementById('accountSummaryAvatar');
const accountSummaryName = document.getElementById('accountSummaryName');
const accountSummaryMeta = document.getElementById('accountSummaryMeta');
const authOnlyElements = Array.from(document.querySelectorAll('[data-auth-only="true"]'));
const peopleContext = document.getElementById('peopleContext');
const peopleEmptyState = document.getElementById('peopleEmptyState');
const peopleMatches = document.getElementById('peopleMatches');
const peoplePlaceholderNote = document.getElementById('peoplePlaceholderNote');
const accountContext = document.getElementById('accountContext');
const settingsOwnerNote = document.getElementById('settingsOwnerNote');
const settingsAge = document.getElementById('settingsAge');
const settingsName = document.getElementById('settingsName');
const settingsEmail = document.getElementById('settingsEmail');
const settingsGoal = document.getElementById('settingsGoal');
const settingsCategory = document.getElementById('settingsCategory');
const settingsSubcategory = document.getElementById('settingsSubcategory');
const settingsSchool = document.getElementById('settingsSchool');
const settingsLocation = document.getElementById('settingsLocation');
const settingsInterests = document.getElementById('settingsInterests');
const settingsBio = document.getElementById('settingsBio');
const saveSettingsButton = document.getElementById('saveSettingsButton');
const accountPosts = document.getElementById('accountPosts');
const joinNowButton = document.getElementById('joinNowButton');
const appNotice = document.getElementById('appNotice');
const stepIndicator = document.querySelector('.step-indicator');
const returningUserStatus = document.getElementById('returningUserStatus');
const returningAccountSelect = document.getElementById('returningAccountSelect');
const returningLoginButton = document.getElementById('returningLoginButton');
const signOutButton = document.getElementById('signOutButton');
const resumeOnboardingButton = document.getElementById('resumeOnboardingButton');

let currentStep = 0;
let selectedGoal = 'A community';
let selectedCategory = 'Loss & Grief';
let selectedSubcategory = '';

const appState = {
  currentAccount: null,
  posts: [],
  storedAccounts: [],
  hasCreatedAccount: false
};

const ACCOUNT_STORAGE_KEY = 'nextpath.accounts.v1';

const pathwayMap = {
  'A community': {
    title: 'Which area would you like your community to understand?',
    categories: ['Loss & Grief', 'Home & Family', 'Money & Work', 'School', 'Mental Wellbeing', 'Physical Health', 'Relationships', 'Moving & Change', 'Finding Community', 'Personal Growth']
  },
  'Support programs': {
    title: 'What kind of support program would help most?',
    categories: ['Housing & Safety', 'Food & Essentials', 'Health Access', 'Education Aid', 'Money & Benefits', 'Legal & Advocacy', 'Finding Community']
  },
  'A job': {
    title: 'What kind of work pathway are you exploring?',
    categories: ['First Job', 'Career Change', 'Job Search', 'Workplace Support', 'Training & Skills']
  },
  'Resources': {
    title: 'Which resources would you like to find?',
    categories: ['Housing & Safety', 'Mental Wellbeing', 'Physical Health', 'School', 'Money & Benefits', 'Legal & Advocacy']
  },
  'Guidance': {
    title: 'What would you like guidance with?',
    categories: ['Decision-making', 'Personal Growth', 'Relationships', 'School', 'Moving & Change', 'Finding Community']
  },
  'Something else': {
    title: 'Which path feels closest to what you need?',
    categories: ['I need someone to listen', 'I need practical help', 'I want to learn', 'I want to meet people', 'Something else']
  }
};

const subcategoryMap = {
  'Loss & Grief': ['Family member', 'Friend', 'Pet', 'A relationship', 'A home or routine', 'A future I imagined', 'Other'],
  'Home & Family': ['Homelessness', 'Housing insecurity', 'Eviction risk', 'Divorce or separation', 'Family conflict', 'Caregiving', 'Unsafe home', 'Setting boundaries', 'Other'],
  'Money & Work': ['Financial hardship', 'Homelessness', 'Food insecurity', 'Job search', 'Job stress', 'Debt', 'Career uncertainty', 'Money management', 'Other'],
  School: ['Bullying', 'Academics', 'College applications', 'College transition', 'Friends and belonging', 'School stress', 'Accessibility support', 'Other'],
  'Mental Wellbeing': ['Depression', 'Anxiety', 'OCD', 'BPD', 'Stress', 'Loneliness', 'Self-esteem', 'Burnout', 'Other'],
  'Physical Health': ['Autoimmune condition', 'Amputation', 'Asthma', 'Diabetes', 'Chronic pain', 'Disability support', 'Injury recovery', 'Medical care access', 'Other'],
  Relationships: ['Breakup', 'Friendship', 'Family relationship', 'Conflict', 'Trust', 'Communication', 'Boundaries', 'Other'],
  'Moving & Change': ['Moving', 'Immigration', 'Starting over', 'Big life transition', 'Identity change', 'Grief after change', 'Other'],
  'Finding Community': ['Friends', 'Belonging', 'Support circle', 'Mentorship', 'Group chats', 'Local activities', 'Other'],
  'Personal Growth': ['Goals', 'Career', 'Hobbies', 'Confidence', 'Self-improvement', 'Creativity', 'Other'],
  'Housing & Safety': ['Homelessness', 'Housing insecurity', 'Eviction risk', 'Emergency shelter', 'Finding a safe home', 'Domestic safety', 'Other'],
  'Food & Essentials': ['Food assistance', 'Clothing', 'Transportation', 'Childcare', 'Technology access', 'Other'],
  'Health Access': ['Finding a doctor', 'Affordable medication', 'Mental health care', 'Disability services', 'Health insurance', 'Other'],
  'Education Aid': ['Tutoring', 'Scholarships', 'School supplies', 'College planning', 'Adult education', 'Other'],
  'Money & Benefits': ['Financial assistance', 'Benefits navigation', 'Debt support', 'Budgeting', 'Tax help', 'Other'],
  'Legal & Advocacy': ['Housing rights', 'Workplace rights', 'Identity documents', 'Immigration support', 'Disability rights', 'Other'],
  'First Job': ['Resume help', 'Interview practice', 'Finding openings', 'Work readiness', 'Other'],
  'Career Change': ['Choosing a direction', 'Training programs', 'Transferable skills', 'Returning to work', 'Other'],
  'Job Search': ['Local jobs', 'Remote jobs', 'Part-time work', 'First job', 'Application support', 'Other'],
  'Workplace Support': ['Workplace conflict', 'Accommodations', 'Burnout', 'Career confidence', 'Other'],
  'Training & Skills': ['Certification', 'Trade skills', 'Digital skills', 'Communication', 'Other'],
  'Decision-making': ['School decision', 'Work decision', 'Relationship decision', 'Life direction', 'Other'],
  'I need someone to listen': ['A hard day', 'Feeling alone', 'A confusing situation', 'Something I cannot name yet', 'Other'],
  'I need practical help': ['Housing', 'Money', 'Health', 'School', 'Work', 'Other'],
  'I want to learn': ['Life skills', 'Career skills', 'Wellbeing', 'Relationships', 'Other'],
  'I want to meet people': ['Friends', 'Mentorship', 'Local groups', 'Online groups', 'Other'],
  'Something else': ['I want to describe it myself', 'I am not sure yet', 'Other']
};

const goalDetails = {
  'A community': {
    title: 'Your community pathway',
    body: 'A space matched by age, interests, and what you are going through.',
    actions: ['Join a global group', 'Explore local groups', 'Find peer mentors']
  },
  'Support programs': {
    title: 'Your support pathway',
    body: 'Practical programs and resources you can explore at your own pace.',
    actions: ['Browse assistance programs', 'Save helpful resources', 'Talk with a guide']
  },
  'A job': {
    title: 'Your work pathway',
    body: 'Next steps for finding work, learning skills, and building confidence.',
    actions: ['Browse job resources', 'Build a resume', 'Find training']
  },
  Resources: {
    title: 'Your resource pathway',
    body: 'A starting point for trusted information and practical help.',
    actions: ['Browse resources', 'Save for later', 'Ask for guidance']
  },
  Guidance: {
    title: 'Your guidance pathway',
    body: 'Small, clear next steps for the decision or change in front of you.',
    actions: ['See guided steps', 'Find a mentor', 'Write a plan']
  },
  'Something else': {
    title: 'Your NextPath starting point',
    body: 'You can begin wherever you are. We will help you find the next useful step.',
    actions: ['Describe what you need', 'Explore all pathways', 'Talk with a guide']
  }
};

const placeholderCommunities = [
  {
    id: 'grief-creative-circle',
    name: 'Grief + Creative Circle',
    problems: ['Loss & Grief'],
    interests: ['Music', 'Art', 'Writing', 'Creative projects'],
    description: 'A future community for members processing loss through conversation, playlists, and shared projects.'
  },
  {
    id: 'home-reset-network',
    name: 'Home Reset Network',
    problems: ['Home & Family', 'Moving & Change'],
    interests: ['Cooking', 'Technology', 'Volunteering', 'Friends'],
    description: 'A placeholder space for people rebuilding routines, housing stability, and supportive connections.'
  },
  {
    id: 'school-support-studio',
    name: 'School Support Studio',
    problems: ['School', 'Mental Wellbeing'],
    interests: ['Reading', 'Writing', 'Technology', 'Wellbeing'],
    description: 'Designed for students and young adults who want encouragement, study support, and low-pressure check-ins.'
  },
  {
    id: 'growth-work-collective',
    name: 'Growth + Work Collective',
    problems: ['Money & Work', 'Personal Growth'],
    interests: ['Technology', 'Sports', 'Volunteering', 'Creative projects'],
    description: 'A future group for career confidence, shared goals, and practical encouragement.'
  },
  {
    id: 'wellbeing-friends-lounge',
    name: 'Wellbeing + Friends Lounge',
    problems: ['Mental Wellbeing', 'Relationships', 'Finding Community'],
    interests: ['Wellbeing', 'Friends', 'Gaming', 'Animals'],
    description: 'A placeholder match for gentle support, new friendships, and community-first conversations.'
  }
];

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function parseInterestInput(value) {
  return String(value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function loadStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((account) => account && typeof account === 'object' && normalizeEmail(account.email));
  } catch (error) {
    return [];
  }
}

function saveStoredAccounts() {
  try {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(appState.storedAccounts));
  } catch (error) {
    // Ignore storage failures in restricted environments.
  }
}

function rememberAccount(account) {
  const email = normalizeEmail(account?.email);
  if (!email) return;

  const nextEntry = {
    id: account.id,
    age: Number(account.age || ageRange?.value || 15),
    firstName: account.firstName,
    email,
    school: account.school || 'Not shared yet',
    bio: account.bio || '',
    locationMode: account.locationMode || 'Global + Local',
    interests: Array.isArray(account.interests) && account.interests.length ? account.interests : ['Music'],
    goal: account.goal || 'A community',
    category: account.category || 'Loss & Grief',
    subcategory: account.subcategory || '',
    avatarColor: account.avatarColor || 'blue',
    avatarImageData: sanitizeAvatarImageData(account.avatarImageData),
    savedAt: Date.now()
  };

  const existingIndex = appState.storedAccounts.findIndex((item) => normalizeEmail(item.email) === email);
  if (existingIndex >= 0) {
    appState.storedAccounts.splice(existingIndex, 1, nextEntry);
  } else {
    appState.storedAccounts.push(nextEntry);
  }

  appState.hasCreatedAccount = appState.storedAccounts.length > 0;
  saveStoredAccounts();
}

function getAgeGroup(age) {
  if (age <= 12) return 'Kids support circle';
  if (age <= 17) return 'Teen support circle';
  if (age <= 24) return 'Young adult circle';
  if (age <= 39) return 'Adult community';
  return 'Life stage community';
}

function getCommunityRange(age) {
  const lower = Math.max(7, age - 3);
  const upper = Math.min(100, age + 3);
  return `You will be placed within ages ${lower}-${upper}`;
}

function getProfileInitial(name) {
  return (name || 'A').trim().charAt(0).toUpperCase() || 'A';
}

function getSelectedInterests() {
  return Array.from(document.querySelectorAll('.interest-tags span.active')).map((tag) => tag.textContent.trim());
}

function getLocationPreference() {
  return document.querySelector('.toggle-btn.active')?.textContent.trim() || 'Global + Local';
}

function getSelectedAvatarColor() {
  return document.querySelector('.avatar-color.active')?.dataset.color || 'blue';
}

function sanitizeAvatarImageData(imageData) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,[a-z0-9+/=\s]+$/i.test(imageData || '')
    ? imageData
    : '';
}

function getAvatarImageData() {
  return sanitizeAvatarImageData(avatarPreview?.dataset.imageUrl || '');
}

function getProblemLabel(account = appState.currentAccount) {
  if (!account) return '';
  return account.subcategory ? `${account.category}: ${account.subcategory}` : account.category;
}

function canManageOwnerContent(ownerId) {
  return Boolean(appState.currentAccount && appState.currentAccount.id === ownerId);
}

function updateAgeDisplay() {
  if (!ageRange || !ageValue || !ageNote || !ageTag) return;
  const age = Number(ageRange.value);
  ageValue.textContent = age;
  ageNote.textContent = getCommunityRange(age);
  ageTag.textContent = getAgeGroup(age);
}

function getActiveChoice(screen) {
  const active = screen.querySelector('.choice-card.active');
  return active ? active.textContent.trim() : '';
}

function setChoiceState(container, value) {
  container.querySelectorAll('.choice-card').forEach((card) => {
    card.classList.toggle('active', card.textContent.trim() === value);
  });
}

function renderChoices(screen, title, options) {
  screen.querySelector('h2.bubble').textContent = title;
  const grid = screen.querySelector('.choice-grid');
  grid.innerHTML = options.map((option) => `<button class="choice-card">${option}</button>`).join('');
  grid.querySelectorAll('.choice-card').forEach((card) => {
    card.addEventListener('click', () => setChoiceState(grid, card.textContent.trim()));
  });
  setChoiceState(grid, options[0]);
}

function renderCategoryScreen(goal) {
  const data = pathwayMap[goal] || pathwayMap['A community'];
  renderChoices(screens[3], data.title, data.categories);
}

function renderSubcategoryScreen(category) {
  const options = subcategoryMap[category] || ['I need guidance', 'I need support', 'I want information', 'Other'];
  renderChoices(screens[4], `Expand: ${category}`, options);
}

function renderResultScreen() {
  const details = goalDetails[selectedGoal] || goalDetails['A community'];
  const resultScreen = screens[6];
  const accountName = appState.currentAccount?.firstName ? `${appState.currentAccount.firstName}'s` : 'Your';

  resultScreen.querySelector('h2.bubble').textContent = details.title;
  resultScreen.querySelector('.match-box h3').textContent = selectedSubcategory
    ? `${selectedCategory}: ${selectedSubcategory}`
    : selectedCategory;
  resultScreen.querySelector('.match-box p').textContent = `${details.body} ${accountName} account is now ready in the top bar.`;
  resultScreen.querySelector('.match-box ul').innerHTML = [
    `Age-matched: ${ageTag.textContent}`,
    `Pathway: ${selectedGoal}`,
    `Account owner: ${appState.currentAccount?.firstName || 'Pending account'}`,
    'People tab prepared for similar-interest matching'
  ].map((item) => `<li>${item}</li>`).join('');
  resultScreen.querySelector('.action-grid').innerHTML = details.actions
    .concat('See your People matches')
    .map((action) => `<button class="choice-card">${action}</button>`)
    .join('');
}

function showStep(stepIndex) {
  currentStep = Math.min(Math.max(stepIndex, 0), screens.length - 1);
  screens.forEach((screen, index) => screen.classList.toggle('active', index === currentStep));
  stepPills.forEach((pill, index) => pill.classList.toggle('active', index === currentStep));
}

function setAppNotice(message) {
  if (!appNotice) return;
  appNotice.textContent = message;
  appNotice.classList.toggle('hidden-field', !message);
}

function navigateTo(page) {
  let nextPage = page;
  if ((nextPage === 'people' || nextPage === 'account') && !appState.currentAccount) {
    nextPage = 'home';
    setAppNotice('Create your account first to open People and account controls.');
  } else {
    setAppNotice('');
  }

  const pages = document.querySelectorAll('.page-content');
  const navLinks = document.querySelectorAll('.nav-link');

  pages.forEach((currentPage) => currentPage.classList.remove('active'));
  navLinks.forEach((link) => link.classList.remove('active'));

  const targetPage = document.getElementById(`${nextPage}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  const activeLink = document.querySelector(`[data-page="${nextPage}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

function updateAvatarLetter() {
  const initial = getProfileInitial(firstNameInput?.value || appState.currentAccount?.firstName);

  if (avatarPreview && !avatarPreview.classList.contains('has-image')) {
    avatarPreview.textContent = initial;
  }

  if (accountSummaryAvatar && !accountSummaryAvatar.classList.contains('has-image')) {
    accountSummaryAvatar.textContent = initial;
  }
}

function syncAccountAvatar(account) {
  if (!accountSummaryAvatar) return;

  accountSummaryAvatar.className = `account-chip-avatar ${account.avatarColor || 'blue'}`;
  const avatarImageData = sanitizeAvatarImageData(account.avatarImageData);
  if (avatarImageData) {
    accountSummaryAvatar.style.backgroundImage = `url("${avatarImageData}")`;
    accountSummaryAvatar.classList.add('has-image');
    accountSummaryAvatar.textContent = '';
  } else {
    accountSummaryAvatar.style.backgroundImage = '';
    accountSummaryAvatar.classList.remove('has-image');
    accountSummaryAvatar.textContent = getProfileInitial(account.firstName);
  }
}

function buildSystemPost(account) {
  return {
    id: 'nextpath-team-update',
    ownerId: 'nextpath-team',
    author: 'NextPath Team',
    title: 'Community update',
    problem: account.category,
    body: `We are preparing people and community matches for ${getProblemLabel(account)}. Only the account owner will be able to edit their own posts and settings.`,
    editable: false
  };
}

function buildOwnerPost(account) {
  return {
    id: `account-post-${account.id}`,
    ownerId: account.id,
    author: account.firstName,
    title: 'Your intro post',
    problem: getProblemLabel(account),
    body: account.bio || `Looking for support around ${getProblemLabel(account)} and hoping to connect through ${account.interests.slice(0, 2).join(' and ') || 'shared interests'}.`,
    editable: true,
    userEdited: false
  };
}

function upsertAccountPosts(account) {
  const existingOwnerPost = appState.posts.find((post) => post.ownerId === account.id);
  const nextSystemPost = buildSystemPost(account);

  if (existingOwnerPost) {
    existingOwnerPost.author = account.firstName;
    existingOwnerPost.problem = getProblemLabel(account);
    if (!existingOwnerPost.userEdited) {
      existingOwnerPost.body = account.bio || existingOwnerPost.body;
    }
    appState.posts = [existingOwnerPost, nextSystemPost];
    return;
  }

  appState.posts = [buildOwnerPost(account), nextSystemPost];
}

function renderAccountPosts() {
  if (!accountPosts) return;

  if (!appState.currentAccount) {
    accountPosts.innerHTML = `
      <div class="empty-state">
        <p>Create an account to unlock your posts and see owner-only editing controls.</p>
      </div>
    `;
    return;
  }

  accountPosts.innerHTML = appState.posts.map((post) => {
    const editable = canManageOwnerContent(post.ownerId);
    return `
      <article class="post-card">
        <div class="post-card-header">
          <div>
            <h3>${escapeHtml(post.title)}</h3>
            <p class="match-meta">${escapeHtml(post.author)} · ${escapeHtml(post.problem)}</p>
          </div>
          <span class="post-pill">${editable ? 'Owner controls' : 'Read only'}</span>
        </div>
        ${editable ? `
          <label class="field-label" for="post-editor-${escapeHtml(post.id)}">Edit post</label>
          <textarea id="post-editor-${escapeHtml(post.id)}" class="text-field area" data-post-editor="${escapeHtml(post.id)}"></textarea>
          <button class="primary-btn post-save-btn" type="button" data-post-id="${escapeHtml(post.id)}">Save post</button>
        ` : `
          <p>${escapeHtml(post.body)}</p>
          <p class="owner-note">Only ${escapeHtml(post.author)} can edit this post.</p>
        `}
      </article>
    `;
  }).join('');

  appState.posts.forEach((post) => {
    if (!canManageOwnerContent(post.ownerId)) return;
    const editor = document.querySelector(`[data-post-editor="${post.id}"]`);
    if (editor) {
      editor.value = post.body;
    }
  });

  document.querySelectorAll('.post-save-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const postId = button.getAttribute('data-post-id');
      const post = appState.posts.find((item) => item.id === postId);
      if (!post || !canManageOwnerContent(post.ownerId)) return;

      const editor = document.querySelector(`[data-post-editor="${postId}"]`);
      const nextBody = editor?.value.trim();
      if (!nextBody) return;

      post.body = nextBody;
      post.userEdited = true;
      if (appState.currentAccount) {
        rememberAccount(appState.currentAccount);
      }
      renderAccountPosts();
    });
  });
}

function getCommunityMatches(account) {
  return placeholderCommunities
    .map((community) => {
      const sharedInterests = community.interests.filter((interest) => account.interests.includes(interest));
      const problemMatches = community.problems.includes(account.category) || community.problems.includes(account.subcategory);
      if (!problemMatches) return null;

      return {
        ...community,
        sharedInterests
      };
    })
    .filter(Boolean)
    .sort((first, second) => second.sharedInterests.length - first.sharedInterests.length);
}

function renderPeopleMatches() {
  if (!peopleContext || !peopleEmptyState || !peopleMatches || !peoplePlaceholderNote) return;

  if (!appState.currentAccount) {
    peopleContext.textContent = 'Create your account to unlock personalized people and community matching.';
    peopleMatches.innerHTML = '';
    peoplePlaceholderNote.classList.add('hidden-field');
    return;
  }

  const account = appState.currentAccount;
  const matches = getCommunityMatches(account);
  const interestPreview = account.interests.slice(0, 3).join(', ') || 'shared interests';

  peopleContext.textContent = `Prepared for ${getProblemLabel(account)} and ready to rank people and communities by similar interests like ${interestPreview}.`;
  peopleEmptyState.querySelector('p').textContent = `No live people have joined this path yet. When they do, this tab will pair ${account.firstName} with people and communities related to ${getProblemLabel(account)} and overlapping interests.`;
  peoplePlaceholderNote.classList.toggle('hidden-field', matches.length === 0);

  peopleMatches.innerHTML = matches.map((community) => `
    <article class="people-card">
      <div class="people-card-header">
        <div>
          <h3>${escapeHtml(community.name)}</h3>
          <p class="match-meta">Problem match: ${escapeHtml(community.problems.join(', '))}</p>
        </div>
        <span class="post-pill">Coming soon</span>
      </div>
      <p>${escapeHtml(community.description)}</p>
      <p class="match-meta">${
        community.sharedInterests.length > 0
          ? `Shared interests: ${escapeHtml(community.sharedInterests.join(', '))}`
          : 'Shared interests will appear here as more members join this path.'
      }</p>
    </article>
  `).join('');
}

function syncProfileInputs(account) {
  if (ageRange && Number.isFinite(Number(account.age))) {
    ageRange.value = String(Math.min(Math.max(Number(account.age), 7), 100));
    updateAgeDisplay();
  }
  if (firstNameInput) firstNameInput.value = account.firstName;
  if (emailInput) emailInput.value = account.email;
  if (schoolSearch) {
    schoolSearch.value = account.school === 'Not shared yet' ? '' : account.school;
  }
  if (schoolAbbreviation) {
    schoolAbbreviation.textContent = schoolSearch?.value
      ? `Profile initials: ${getSchoolInitials(schoolSearch.value)}`
      : 'Your school initials will appear here';
  }
  if (profileBio) profileBio.value = account.bio;

  document.querySelectorAll('.interest-tags span').forEach((tag) => {
    const label = tag.textContent.trim();
    tag.classList.toggle('active', account.interests.includes(label));
  });

  document.querySelectorAll('.toggle-btn').forEach((button) => {
    button.classList.toggle('active', button.textContent.trim() === account.locationMode);
  });

  const avatarButtons = Array.from(document.querySelectorAll('.avatar-color'));
  const selectedColor = account.avatarColor || 'blue';
  avatarButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.color === selectedColor);
  });
  if (avatarPreview) {
    avatarPreview.className = `avatar-circle ${selectedColor}`;
    const avatarImageData = sanitizeAvatarImageData(account.avatarImageData);
    if (avatarImageData) {
      avatarPreview.dataset.imageUrl = avatarImageData;
      avatarPreview.style.backgroundImage = `url("${avatarImageData}")`;
      avatarPreview.classList.add('has-image');
      avatarPreview.textContent = '';
    } else {
      delete avatarPreview.dataset.imageUrl;
      avatarPreview.style.backgroundImage = '';
      avatarPreview.classList.remove('has-image');
      avatarPreview.textContent = getProfileInitial(account.firstName);
    }
  }

  selectedGoal = pathwayMap[account.goal] ? account.goal : 'A community';
  setChoiceState(screens[2].querySelector('.choice-grid'), selectedGoal);
  renderCategoryScreen(selectedGoal);
  const availableCategories = pathwayMap[selectedGoal]?.categories || [];
  selectedCategory = availableCategories.includes(account.category) ? account.category : (availableCategories[0] || selectedCategory);
  setChoiceState(screens[3].querySelector('.choice-grid'), selectedCategory);
  renderSubcategoryScreen(selectedCategory);
  const availableSubcategories = subcategoryMap[selectedCategory] || [];
  selectedSubcategory = availableSubcategories.includes(account.subcategory) ? account.subcategory : '';
  if (selectedSubcategory) {
    setChoiceState(screens[4].querySelector('.choice-grid'), selectedSubcategory);
  }

  updateAvatarLetter();
}

function populateSettingsCategoryOptions(goalValue, selectedValue) {
  if (!settingsCategory) return;
  const categories = pathwayMap[goalValue]?.categories || pathwayMap['A community'].categories;
  settingsCategory.innerHTML = categories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join('');
  settingsCategory.value = categories.includes(selectedValue) ? selectedValue : categories[0];
}

function populateSettingsSubcategoryOptions(categoryValue, selectedValue) {
  if (!settingsSubcategory) return;
  const options = subcategoryMap[categoryValue] || [];
  settingsSubcategory.innerHTML = ['<option value="">No expanded focus</option>']
    .concat(options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`))
    .join('');
  settingsSubcategory.value = options.includes(selectedValue) ? selectedValue : '';
}

function renderAccountPage() {
  const account = appState.currentAccount;
  const canUseSettings = Boolean(account && canManageOwnerContent(account.id));
  const editableInputs = [
    settingsAge,
    settingsName,
    settingsEmail,
    settingsGoal,
    settingsCategory,
    settingsSubcategory,
    settingsSchool,
    settingsLocation,
    settingsInterests,
    settingsBio
  ];
  const allSettingsFields = [...editableInputs];

  if (!account) {
    if (accountContext) accountContext.textContent = 'Finish onboarding to see your account controls, settings, and posts.';
    if (settingsOwnerNote) settingsOwnerNote.textContent = 'Only the account owner can use these settings.';
    allSettingsFields.forEach((field) => {
      if (field) {
        field.value = '';
        field.disabled = true;
        field.readOnly = false;
      }
    });
    if (saveSettingsButton) saveSettingsButton.disabled = true;
    renderAccountPosts();
    return;
  }

  if (accountContext) {
    accountContext.textContent = `${account.firstName}, this account owns its settings and only your posts can be edited here.`;
  }
  if (settingsOwnerNote) {
    settingsOwnerNote.textContent = canUseSettings
      ? 'Signed in as the account owner. Only your account can use these settings.'
      : 'Only the account owner can use these settings.';
  }

  if (settingsName) settingsName.value = account.firstName;
  if (settingsEmail) settingsEmail.value = account.email;
  if (settingsAge) settingsAge.value = Number.isFinite(Number(account.age)) ? String(account.age) : '';
  if (settingsGoal) settingsGoal.value = pathwayMap[account.goal] ? account.goal : 'A community';
  populateSettingsCategoryOptions(settingsGoal?.value || 'A community', account.category || '');
  populateSettingsSubcategoryOptions(settingsCategory?.value || account.category || '', account.subcategory || '');
  if (settingsSchool) settingsSchool.value = account.school;
  if (settingsLocation) settingsLocation.value = account.locationMode;
  if (settingsInterests) settingsInterests.value = account.interests.join(', ');
  if (settingsBio) settingsBio.value = account.bio || '';

  allSettingsFields.forEach((field) => {
    if (field) {
      field.disabled = !canUseSettings;
      field.readOnly = false;
    }
  });
  if (saveSettingsButton) saveSettingsButton.disabled = !canUseSettings;

  renderAccountPosts();
}

function updateReturningUserPanel() {
  const hasStoredAccounts = appState.storedAccounts.length > 0;
  const account = appState.currentAccount;
  const signedIn = Boolean(account);

  if (returningUserStatus) {
    if (signedIn) {
      returningUserStatus.textContent = `Signed in as ${account.firstName}. This browser remembers ${hasStoredAccounts ? appState.storedAccounts.length : 1} account${(hasStoredAccounts ? appState.storedAccounts.length : 1) === 1 ? '' : 's'} for returning login.`;
    } else if (hasStoredAccounts) {
      returningUserStatus.textContent = `Sign in with your saved email to continue. ${appState.storedAccounts.length} remembered account${appState.storedAccounts.length === 1 ? '' : 's'} found on this browser.`;
    } else {
      returningUserStatus.textContent = 'Create an account to unlock sign-in for later visits on this browser.';
    }
  }

  if (returningAccountSelect) {
    const previousSelection = returningAccountSelect.value;
    const options = hasStoredAccounts
      ? appState.storedAccounts.map((stored) => `
          <option value="${escapeHtml(stored.id)}">${escapeHtml(stored.firstName || 'Member')} · ${escapeHtml(stored.email)}</option>
        `).join('')
      : '<option value="">No saved accounts yet</option>';
    returningAccountSelect.innerHTML = options;
    if (signedIn) {
      returningAccountSelect.value = account.id;
    } else if (hasStoredAccounts && appState.storedAccounts.some((stored) => stored.id === previousSelection)) {
      returningAccountSelect.value = previousSelection;
    } else if (hasStoredAccounts) {
      returningAccountSelect.value = appState.storedAccounts[0].id;
    } else {
      returningAccountSelect.value = '';
    }
  }

  if (returningLoginButton) returningLoginButton.disabled = !hasStoredAccounts;
  if (signOutButton) signOutButton.disabled = !signedIn;
  if (resumeOnboardingButton) resumeOnboardingButton.disabled = !signedIn;
}

function updateAuthenticatedUI() {
  const account = appState.currentAccount;
  const isAuthenticated = Boolean(account);
  const hideStepNumbers = isAuthenticated || appState.hasCreatedAccount;

  authOnlyElements.forEach((element) => {
    element.classList.toggle('hidden-field', !isAuthenticated);
  });

  if (accountSummary) {
    accountSummary.classList.toggle('hidden-field', !isAuthenticated);
  }

  if (account && accountSummaryName && accountSummaryMeta) {
    accountSummaryName.textContent = account.firstName;
    accountSummaryMeta.textContent = `${account.email} · ${getProblemLabel(account)}`;
    syncAccountAvatar(account);
  }

  if (stepIndicator) {
    stepIndicator.classList.toggle('hidden-field', hideStepNumbers);
  }

  renderPeopleMatches();
  renderAccountPage();
  updateReturningUserPanel();
}

function validateProfileStep() {
  if (firstNameInput && !firstNameInput.reportValidity()) return false;
  if (emailInput && !emailInput.reportValidity()) return false;
  return true;
}

function saveAccountFromProfile() {
  const nextAccount = {
    id: appState.currentAccount?.id || `account-${Date.now()}`,
    age: Number(ageRange?.value || 15),
    firstName: firstNameInput?.value.trim() || 'Member',
    email: normalizeEmail(emailInput?.value),
    school: schoolSearch?.value.trim() || otherSchool?.value.trim() || 'Not shared yet',
    bio: profileBio?.value.trim() || '',
    locationMode: getLocationPreference(),
    interests: getSelectedInterests(),
    goal: selectedGoal,
    category: selectedCategory,
    subcategory: selectedSubcategory,
    avatarColor: getSelectedAvatarColor(),
    avatarImageData: getAvatarImageData()
  };

  appState.currentAccount = nextAccount;
  upsertAccountPosts(nextAccount);
  rememberAccount(nextAccount);
  updateAuthenticatedUI();
}

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    navigateTo(link.getAttribute('data-page'));
  });
});

document.querySelectorAll('.back-to-home-btn').forEach((button) => {
  button.addEventListener('click', () => {
    navigateTo('home');
  });
});

document.querySelectorAll('.choice-grid').forEach((grid) => {
  grid.querySelectorAll('.choice-card').forEach((card) => {
    card.addEventListener('click', () => setChoiceState(grid, card.textContent.trim()));
  });
});

document.querySelectorAll('.interest-tags span').forEach((tag) => {
  tag.addEventListener('click', () => tag.classList.toggle('active'));
});

document.querySelectorAll('.toggle-btn').forEach((button) => {
  button.addEventListener('click', () => {
    button.parentElement.querySelectorAll('.toggle-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
  });
});

document.querySelectorAll('.avatar-color').forEach((button) => {
  button.addEventListener('click', () => {
    const avatar = button.closest('.profile-side').querySelector('.avatar-circle');
    button.parentElement.querySelectorAll('.avatar-color').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    avatar.className = `avatar-circle ${button.dataset.color}`;
    const avatarImageData = sanitizeAvatarImageData(avatar.dataset.imageUrl);
    if (avatarImageData) {
      avatar.style.backgroundImage = `url("${avatarImageData}")`;
      avatar.classList.add('has-image');
      avatar.textContent = '';
    } else {
      avatar.textContent = getProfileInitial(firstNameInput?.value || appState.currentAccount?.firstName);
    }

    if (appState.currentAccount) {
      appState.currentAccount.avatarColor = button.dataset.color;
      updateAuthenticatedUI();
    }
  });
});

const avatarUpload = document.getElementById('avatarUpload');
const cropAvatarBtn = document.getElementById('cropAvatarBtn');
const avatarCropperModal = document.getElementById('avatarCropperModal');
const cropCanvas = document.getElementById('cropCanvas');
const closeCropper = document.getElementById('closeCropper');
const cancelCrop = document.getElementById('cancelCrop');
const applyCrop = document.getElementById('applyCrop');
const avatarZoom = document.getElementById('avatarZoom');
const avatarX = document.getElementById('avatarX');
const avatarY = document.getElementById('avatarY');
const zoomValue = document.getElementById('zoomValue');
const xValue = document.getElementById('xValue');
const yValue = document.getElementById('yValue');
const avatarPreview = avatarUpload ? avatarUpload.closest('.profile-side').querySelector('.avatar-circle') : null;

let currentImageData = null;
let canvasContext = null;

function initializeCanvas(imageSrc) {
  const img = new Image();
  img.onload = function() {
    const canvas = cropCanvas;
    const wrapper = canvas.parentElement;

    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;

    canvasContext = canvas.getContext('2d');
    currentImageData = {
      img,
      originalWidth: img.width,
      originalHeight: img.height
    };

    drawCropPreview();
  };
  img.src = imageSrc;
}

function drawCropPreview() {
  if (!canvasContext || !currentImageData || !cropCanvas) return;

  const zoom = parseInt(avatarZoom.value, 10) / 100;
  const offsetX = parseInt(avatarX.value, 10);
  const offsetY = parseInt(avatarY.value, 10);
  const displayWidth = currentImageData.originalWidth * zoom;
  const displayHeight = currentImageData.originalHeight * zoom;
  const x = (cropCanvas.width - displayWidth) / 2 + (offsetX / 100) * (displayWidth - cropCanvas.width);
  const y = (cropCanvas.height - displayHeight) / 2 + (offsetY / 100) * (displayHeight - cropCanvas.height);

  canvasContext.fillStyle = '#f0f0f0';
  canvasContext.fillRect(0, 0, cropCanvas.width, cropCanvas.height);
  canvasContext.drawImage(currentImageData.img, x, y, displayWidth, displayHeight);
}

function updateCropControls() {
  if (!avatarZoom || !avatarX || !avatarY) return;

  zoomValue.textContent = `${avatarZoom.value}%`;
  xValue.textContent = `${avatarX.value}%`;
  yValue.textContent = `${avatarY.value}%`;
  drawCropPreview();
}

function saveCropToPreview() {
  if (!canvasContext || !currentImageData || !avatarPreview || !cropCanvas) return;

  const croppedImageData = cropCanvas.toDataURL('image/png');
  avatarPreview.dataset.imageUrl = croppedImageData;
  avatarPreview.style.backgroundImage = `url("${croppedImageData}")`;
  avatarPreview.classList.add('has-image');
  avatarPreview.textContent = '';

  if (appState.currentAccount) {
    appState.currentAccount.avatarImageData = croppedImageData;
    updateAuthenticatedUI();
  }
}

function openCropper(imageSrc) {
  if (!avatarCropperModal || !avatarZoom || !avatarX || !avatarY) return;
  avatarCropperModal.classList.add('show');
  avatarZoom.value = 100;
  avatarX.value = 0;
  avatarY.value = 0;

  if (imageSrc) {
    initializeCanvas(imageSrc);
  }
}

function closeCropperModal() {
  if (!avatarCropperModal) return;
  avatarCropperModal.classList.remove('show');
  currentImageData = null;
  canvasContext = null;
}

if (avatarUpload) {
  avatarUpload.addEventListener('change', () => {
    const file = avatarUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
      openCropper(event.target.result);
    };
    reader.readAsDataURL(file);
  });
}

if (cropAvatarBtn) {
  cropAvatarBtn.addEventListener('click', () => {
    const avatarImageData = sanitizeAvatarImageData(avatarPreview?.dataset.imageUrl);
    if (avatarImageData) {
      openCropper(avatarImageData);
    }
  });
}

if (closeCropper) {
  closeCropper.addEventListener('click', closeCropperModal);
}

if (cancelCrop) {
  cancelCrop.addEventListener('click', closeCropperModal);
}

if (applyCrop) {
  applyCrop.addEventListener('click', () => {
    saveCropToPreview();
    closeCropperModal();
  });
}

if (avatarCropperModal) {
  avatarCropperModal.addEventListener('click', (event) => {
    if (event.target === avatarCropperModal) {
      closeCropperModal();
    }
  });
}

if (avatarZoom) {
  avatarZoom.addEventListener('input', updateCropControls);
}

if (avatarX) {
  avatarX.addEventListener('input', updateCropControls);
}

if (avatarY) {
  avatarY.addEventListener('input', updateCropControls);
}

window.addEventListener('resize', () => {
  if (currentImageData && avatarCropperModal?.classList.contains('show')) {
    if (cropCanvas?.parentElement) {
      cropCanvas.width = cropCanvas.parentElement.offsetWidth;
      cropCanvas.height = cropCanvas.parentElement.offsetHeight;
    }
    drawCropPreview();
  }
});

const schoolSearch = document.getElementById('schoolSearch');
const schoolSuggestions = document.getElementById('schoolSuggestions');
const schoolAbbreviation = document.getElementById('schoolAbbreviation');
const noSchoolButton = document.getElementById('noSchoolButton');
const otherSchool = document.getElementById('otherSchool');
const schoolDirectory = [
  'South County High School', 'South County Middle School', 'Lincoln High School',
  'Lincoln Middle School', 'Roosevelt High School', 'Roosevelt Middle School',
  'Washington High School', 'Washington Middle School', 'Jefferson High School',
  'Jefferson Middle School', 'Alexandria City High School', 'Boston Latin School',
  'Brooklyn Technical High School', 'Thomas Jefferson High School for Science and Technology',
  'University of Virginia', 'Virginia Tech', 'Howard University', 'Stanford University',
  'Harvard University', 'Community College', 'State University', 'Technical College'
];

function getSchoolInitials(name) {
  const words = name.replace(/[^a-zA-Z0-9 ]/g, '').trim().split(/\s+/);
  const meaningful = words.filter((word) => !['the', 'of', 'and', 'for', 'at'].includes(word.toLowerCase()));
  return meaningful.map((word) => word[0]).join('').toUpperCase().slice(0, 4);
}

function chooseSchool(name) {
  schoolSearch.value = name;
  schoolAbbreviation.textContent = `Profile initials: ${getSchoolInitials(name)}`;
  schoolSuggestions.innerHTML = '';
  schoolSuggestions.classList.remove('visible');
  otherSchool.classList.add('hidden-field');
  otherSchool.required = false;
}

if (schoolSearch && schoolSuggestions && schoolAbbreviation && otherSchool) {
  schoolSearch.addEventListener('input', () => {
    const query = schoolSearch.value.trim().toLowerCase();
    schoolAbbreviation.textContent = query
      ? `Profile initials: ${getSchoolInitials(schoolSearch.value)}`
      : 'Your school initials will appear here';
    if (query.length < 2) {
      schoolSuggestions.innerHTML = '';
      schoolSuggestions.classList.remove('visible');
      return;
    }

    const matches = schoolDirectory.filter((school) => school.toLowerCase().includes(query)).slice(0, 8);
    schoolSuggestions.innerHTML = matches.map((school) => `<button type="button" class="school-suggestion">${school}<small>${getSchoolInitials(school)}</small></button>`).join('');
    schoolSuggestions.classList.toggle('visible', matches.length > 0);
    schoolSuggestions.querySelectorAll('.school-suggestion').forEach((button) => {
      button.addEventListener('click', () => chooseSchool(button.textContent.replace(button.querySelector('small').textContent, '').trim()));
    });
  });
}

if (noSchoolButton && otherSchool) {
  noSchoolButton.addEventListener('click', () => {
    schoolSearch.value = 'Not in school';
    schoolAbbreviation.textContent = 'School initials hidden';
    schoolSuggestions.innerHTML = '';
    schoolSuggestions.classList.remove('visible');
    otherSchool.classList.add('hidden-field');
    otherSchool.required = false;
  });
}

prevButtons.forEach((button) => button.addEventListener('click', () => showStep(currentStep - 1)));

nextButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const activeScreen = screens[currentStep];
    if (!activeScreen) return;

    if (activeScreen.dataset.step === '3') {
      selectedGoal = getActiveChoice(activeScreen) || 'A community';
      renderCategoryScreen(selectedGoal);
    } else if (activeScreen.dataset.step === '4') {
      selectedCategory = getActiveChoice(activeScreen) || pathwayMap[selectedGoal].categories[0];
      renderSubcategoryScreen(selectedCategory);
    } else if (activeScreen.dataset.step === '5') {
      selectedSubcategory = getActiveChoice(activeScreen);
    } else if (activeScreen.dataset.step === '6') {
      if (!validateProfileStep()) return;
      saveAccountFromProfile();
      renderResultScreen();
    }

    showStep(currentStep + 1);
  });
});

if (ageRange) {
  ageRange.addEventListener('input', updateAgeDisplay);
  updateAgeDisplay();
}

if (firstNameInput) {
  firstNameInput.addEventListener('input', updateAvatarLetter);
}

if (accountSummaryButton) {
  accountSummaryButton.addEventListener('click', () => navigateTo('account'));
}

if (accountSettingsButton) {
  accountSettingsButton.addEventListener('click', () => navigateTo('account'));
}

if (joinNowButton) {
  joinNowButton.addEventListener('click', () => navigateTo('people'));
}

if (settingsGoal) {
  settingsGoal.addEventListener('change', () => {
    populateSettingsCategoryOptions(settingsGoal.value, '');
    populateSettingsSubcategoryOptions(settingsCategory?.value || '', '');
  });
}

if (settingsCategory) {
  settingsCategory.addEventListener('change', () => {
    populateSettingsSubcategoryOptions(settingsCategory.value, '');
  });
}

if (saveSettingsButton) {
  saveSettingsButton.addEventListener('click', () => {
    const account = appState.currentAccount;
    if (!account || !canManageOwnerContent(account.id)) return;
    if (settingsName && !settingsName.value.trim()) return;
    if (settingsEmail && !settingsEmail.reportValidity()) return;
    if (settingsAge && Number(settingsAge.value) < 7) return;
    if (settingsAge && Number(settingsAge.value) > 100) return;

    account.age = Number(settingsAge?.value || account.age || ageRange?.value || 15);
    account.firstName = settingsName.value.trim();
    account.email = normalizeEmail(settingsEmail.value);
    const requestedGoal = settingsGoal?.value.trim() || account.goal || selectedGoal;
    account.goal = pathwayMap[requestedGoal] ? requestedGoal : 'A community';
    const categoryOptions = pathwayMap[account.goal]?.categories || [];
    const requestedCategory = settingsCategory?.value.trim() || account.category || selectedCategory;
    account.category = categoryOptions.includes(requestedCategory) ? requestedCategory : (categoryOptions[0] || 'Loss & Grief');
    const requestedSubcategory = settingsSubcategory?.value.trim() || account.subcategory || '';
    const subcategoryOptions = subcategoryMap[account.category] || [];
    account.subcategory = subcategoryOptions.includes(requestedSubcategory) ? requestedSubcategory : '';
    account.school = settingsSchool.value.trim() || 'Not shared yet';
    account.locationMode = settingsLocation.value.trim() || account.locationMode;
    const enteredInterests = parseInterestInput(settingsInterests?.value);
    if (enteredInterests.length > 0) {
      account.interests = enteredInterests;
    } else if (!Array.isArray(account.interests) || account.interests.length === 0) {
      account.interests = ['Music'];
    }
    account.bio = settingsBio?.value.trim() || '';
    upsertAccountPosts(account);
    rememberAccount(account);

    const ownerPost = appState.posts.find((post) => post.ownerId === account.id);
    if (ownerPost) {
      ownerPost.author = account.firstName;
    }

    syncProfileInputs(account);
    updateAuthenticatedUI();
    settingsOwnerNote.textContent = 'Settings saved. Only your account can use these controls.';
  });
}

if (returningLoginButton) {
  returningLoginButton.addEventListener('click', () => {
    const selectedAccountId = returningAccountSelect?.value;
    if (!selectedAccountId) {
      setAppNotice('Select a saved account to sign in.');
      return;
    }

    const matchedAccount = appState.storedAccounts.find((account) => account.id === selectedAccountId);
    if (!matchedAccount) {
      setAppNotice('No saved account found for that selection.');
      return;
    }

    appState.currentAccount = {
      id: matchedAccount.id,
      age: Number(matchedAccount.age || ageRange?.value || 15),
      firstName: matchedAccount.firstName || 'Member',
      email: normalizeEmail(matchedAccount.email),
      school: matchedAccount.school || 'Not shared yet',
      bio: matchedAccount.bio || '',
      locationMode: matchedAccount.locationMode || 'Global + Local',
      interests: Array.isArray(matchedAccount.interests) && matchedAccount.interests.length ? matchedAccount.interests : ['Music'],
      goal: matchedAccount.goal || 'A community',
      category: matchedAccount.category || 'Loss & Grief',
      subcategory: matchedAccount.subcategory || '',
      avatarColor: matchedAccount.avatarColor || 'blue',
      avatarImageData: sanitizeAvatarImageData(matchedAccount.avatarImageData)
    };
    appState.hasCreatedAccount = true;
    syncProfileInputs(appState.currentAccount);
    upsertAccountPosts(appState.currentAccount);
    updateAuthenticatedUI();
    navigateTo('account');
    setAppNotice(`Welcome back, ${appState.currentAccount.firstName}.`);
  });
}

if (signOutButton) {
  signOutButton.addEventListener('click', () => {
    appState.currentAccount = null;
    updateAuthenticatedUI();
    navigateTo('home');
    setAppNotice('Signed out. You can sign in again from the Account tab.');
  });
}

if (resumeOnboardingButton) {
  resumeOnboardingButton.addEventListener('click', () => {
    const account = appState.currentAccount;
    if (!account || !canManageOwnerContent(account.id)) return;
    syncProfileInputs(account);
    navigateTo('home');
    showStep(1);
    setAppNotice('You can now edit every part of your signup flow.');
  });
}

appState.storedAccounts = loadStoredAccounts();
appState.hasCreatedAccount = appState.storedAccounts.length > 0;
updateReturningUserPanel();

showStep(0);
updateAvatarLetter();
renderCategoryScreen(selectedGoal);
updateAuthenticatedUI();
