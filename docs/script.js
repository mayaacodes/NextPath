const screens = Array.from(document.querySelectorAll('.screen'));
const stepPills = Array.from(document.querySelectorAll('.step-pill'));
const nextButtons = document.querySelectorAll('.next-btn');
const prevButtons = document.querySelectorAll('.prev-btn');
const ageRange = document.getElementById('ageRange');
const ageValue = document.getElementById('ageValue');
const ageNote = document.getElementById('ageNote');
const ageTag = document.getElementById('ageTag');

let currentStep = 0;

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

function showStep(stepIndex) {
  currentStep = Math.min(Math.max(stepIndex, 0), screens.length - 1);

  screens.forEach((screen, index) => {
    screen.classList.toggle('active', index === currentStep);
  });

  stepPills.forEach((pill, index) => {
    pill.classList.toggle('active', index === currentStep);
  });
}

nextButtons.forEach((button) => {
  button.addEventListener('click', () => showStep(currentStep + 1));
});

prevButtons.forEach((button) => {
  button.addEventListener('click', () => showStep(currentStep - 1));
});

if (ageRange) {
  ageRange.addEventListener('input', updateAgeDisplay);
  updateAgeDisplay();
}

showStep(0);
