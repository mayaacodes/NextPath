const screens = Array.from(document.querySelectorAll('.screen'));
const stepPills = Array.from(document.querySelectorAll('.step-pill'));
const nextButtons = document.querySelectorAll('.next-btn');
const prevButtons = document.querySelectorAll('.prev-btn');
const ageRange = document.getElementById('ageRange');
const ageValue = document.getElementById('ageValue');
const ageNote = document.getElementById('ageNote');
const ageTag = document.getElementById('ageTag');

let currentStep = 0;

const branchMap = {
  'Physical Health': {
    title: 'What health complication are you dealing with?',
    options: ['Autoimmune', 'Amputation', 'Asthma', 'Diabetes', 'Chronic pain', 'Recovery', 'Other']
  },
  'Mental Wellbeing': {
    title: 'Which part of your mental wellbeing feels toughest?',
    options: ['Depression', 'Anxiety', 'OCD', 'BPD', 'Stress', 'Loneliness', 'Other']
  },
  'School': {
    title: 'What school challenge are you navigating?',
    options: ['Bullying', 'Academics', 'College prep', 'Friends', 'Mental load', 'Other']
  },
  'Home & Family': {
    title: 'What family situation are you dealing with?',
    options: ['Divorce', 'Family conflict', 'Housing', 'Caretaking', 'Boundaries', 'Other']
  },
  'Money & Work': {
    title: 'What money or work situation are you facing?',
    options: ['Financial hardship', 'Job stress', 'Homelessness', 'Career uncertainty', 'Money management', 'Other']
  },
  'Relationships': {
    title: 'What kind of relationship support do you need?',
    options: ['Breakup', 'Friendship', 'Family relationship', 'Conflict', 'Trust', 'Other']
  },
  'Moving & Change': {
    title: 'What change are you adjusting to?',
    options: ['Moving', 'Immigration', 'Starting over', 'Big life transition', 'Identity change', 'Other']
  },
  'Loss & Grief': {
    title: 'Who or what are you grieving?',
    options: ['Family member', 'Friend', 'Pet', 'Loss of routine', 'Other']
  },
  'Finding Community': {
    title: 'What kind of community connection are you looking for?',
    options: ['Friends', 'Belonging', 'Support circle', 'Mentorship', 'Group chats', 'Other']
  },
  'Personal Growth': {
    title: 'What part of your growth feels most important right now?',
    options: ['Goals', 'Career', 'Hobbies', 'Confidence', 'Self-improvement', 'Other']
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
  const cards = container.querySelectorAll('.choice-card');
  cards.forEach((card) => {
    card.classList.toggle('active', card.textContent.trim() === value);
  });
}

function renderBranchScreen(category) {
  const branchScreen = screens[3];
  const header = branchScreen.querySelector('h2.bubble');
  const grid = branchScreen.querySelector('.choice-grid');
  const data = branchMap[category] || {
    title: 'What are you navigating right now?',
    options: ['I need guidance', 'I need support', 'I want community', 'Other']
  };

  header.textContent = data.title;
  grid.innerHTML = data.options
    .map((option) => `<button class="choice-card">${option}</button>`)
    .join('');

  const cards = grid.querySelectorAll('.choice-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => setChoiceState(grid, card.textContent.trim()));
  });
}

function handleNextStep() {
  const activeScreen = screens[currentStep];

  if (activeScreen && activeScreen.dataset.step === '4') {
    const category = getActiveChoice(activeScreen);

    if (category && branchMap[category]) {
      renderBranchScreen(category);
      return;
    }
  }

  if (activeScreen && activeScreen.dataset.step === '5') {
    showStep(currentStep + 1);
    return;
  }

  if (currentStep < screens.length - 1) {
    showStep(currentStep + 1);
  }
}

function showStep(stepIndex) {
  currentStep = Math.min(Math.max(stepIndex, 0), screens.length - 1);

  screens.forEach((screen, index) => {
    screen.classList.toggle('active', index === currentStep);
  });

  stepPills.forEach((pill, index) => {
    pill.classList.toggle('active', index === currentStep);
  });
}

const mainGoalScreen = screens[2];
if (mainGoalScreen) {
  const goalCards = mainGoalScreen.querySelectorAll('.choice-card');
  goalCards.forEach((card) => {
    card.addEventListener('click', () => {
      const current = mainGoalScreen.querySelector('.choice-card.active');
      if (current) current.classList.remove('active');
      card.classList.add('active');
    });
  });
}

const branchScreen = screens[3];
if (branchScreen) {
  const branchCards = branchScreen.querySelectorAll('.choice-card');
  branchCards.forEach((card) => {
    card.addEventListener('click', () => setChoiceState(branchScreen.querySelector('.choice-grid'), card.textContent.trim()));
  });
}

prevButtons.forEach((button) => {
  button.addEventListener('click', () => showStep(currentStep - 1));
});

nextButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const activeScreen = screens[currentStep];

    if (activeScreen && activeScreen.dataset.step === '3') {
      const activeGoal = getActiveChoice(activeScreen);
      if (activeGoal) {
        showStep(3);
        if (branchMap[activeGoal]) {
          renderBranchScreen(activeGoal);
        }
        return;
      }
    }

    if (activeScreen && activeScreen.dataset.step === '4') {
      const category = getActiveChoice(activeScreen);
      if (category) {
        showStep(4);
        return;
      }
    }

    if (currentStep < screens.length - 1) {
      showStep(currentStep + 1);
    }
  });
});

if (ageRange) {
  ageRange.addEventListener('input', updateAgeDisplay);
  updateAgeDisplay();
}

showStep(0);
