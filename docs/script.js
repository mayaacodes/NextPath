const screens = Array.from(document.querySelectorAll('.screen'));
const stepPills = Array.from(document.querySelectorAll('.step-pill'));
const nextButtons = document.querySelectorAll('.next-btn');
const prevButtons = document.querySelectorAll('.prev-btn');
const ageRange = document.getElementById('ageRange');
const ageValue = document.getElementById('ageValue');
const ageNote = document.getElementById('ageNote');
const ageTag = document.getElementById('ageTag');

let currentStep = 0;
let selectedGoal = 'A community';
let selectedCategory = 'Loss & Grief';
let selectedSubcategory = '';

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
  'School': ['Bullying', 'Academics', 'College applications', 'College transition', 'Friends and belonging', 'School stress', 'Accessibility support', 'Other'],
  'Mental Wellbeing': ['Depression', 'Anxiety', 'OCD', 'BPD', 'Stress', 'Loneliness', 'Self-esteem', 'Burnout', 'Other'],
  'Physical Health': ['Autoimmune condition', 'Amputation', 'Asthma', 'Diabetes', 'Chronic pain', 'Disability support', 'Injury recovery', 'Medical care access', 'Other'],
  'Relationships': ['Breakup', 'Friendship', 'Family relationship', 'Conflict', 'Trust', 'Communication', 'Boundaries', 'Other'],
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
  'Resources': {
    title: 'Your resource pathway',
    body: 'A starting point for trusted information and practical help.',
    actions: ['Browse resources', 'Save for later', 'Ask for guidance']
  },
  'Guidance': {
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
  resultScreen.querySelector('h2.bubble').textContent = details.title;
  resultScreen.querySelector('.match-box h3').textContent = selectedSubcategory
    ? `${selectedCategory}: ${selectedSubcategory}`
    : selectedCategory;
  resultScreen.querySelector('.match-box p').textContent = details.body;
  resultScreen.querySelector('.match-box ul').innerHTML = [
    `Age-matched: ${ageTag.textContent}`,
    `Pathway: ${selectedGoal}`,
    'Private profile and avatar options',
    'Local and global choices'
  ].map((item) => `<li>${item}</li>`).join('');
  resultScreen.querySelector('.action-grid').innerHTML = details.actions
    .map((action) => `<button class="choice-card">${action}</button>`).join('');
}

function showStep(stepIndex) {
  currentStep = Math.min(Math.max(stepIndex, 0), screens.length - 1);
  screens.forEach((screen, index) => screen.classList.toggle('active', index === currentStep));
  stepPills.forEach((pill, index) => pill.classList.toggle('active', index === currentStep));
}

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
      renderResultScreen();
    }
    showStep(currentStep + 1);
  });
});

if (ageRange) {
  ageRange.addEventListener('input', updateAgeDisplay);
  updateAgeDisplay();
}

showStep(0);
