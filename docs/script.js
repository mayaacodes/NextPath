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

// Navigation for pages
function navigateTo(page) {
  const pages = document.querySelectorAll('.page-content');
  const navLinks = document.querySelectorAll('.nav-link');
  
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(link => link.classList.remove('active'));
  
  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  const activeLink = document.querySelector(`[data-page="${page}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Add click handlers for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.getAttribute('data-page');
    navigateTo(page);
  });
});

// Add click handlers for back to home buttons
document.querySelectorAll('.back-to-home-btn').forEach(btn => {
  btn.addEventListener('click', () => {
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
    avatar.textContent = 'A';
  });
});

// Enhanced Avatar Cropper with Popup Modal
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
    const canvas = document.getElementById('cropCanvas');
    const wrapper = canvas.parentElement;
    
    // Set canvas dimensions to match wrapper
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
    
    canvasContext = canvas.getContext('2d');
    currentImageData = {
      img: img,
      originalWidth: img.width,
      originalHeight: img.height
    };
    
    drawCropPreview();
  };
  img.src = imageSrc;
}

function drawCropPreview() {
  if (!canvasContext || !currentImageData) return;
  
  const canvas = document.getElementById('cropCanvas');
  const zoom = parseInt(avatarZoom.value) / 100;
  const offsetX = parseInt(avatarX.value);
  const offsetY = parseInt(avatarY.value);
  
  // Calculate displayed dimensions
  const displayWidth = currentImageData.originalWidth * zoom;
  const displayHeight = currentImageData.originalHeight * zoom;
  
  // Calculate position based on offset
  const x = (canvas.width - displayWidth) / 2 + (offsetX / 100) * (displayWidth - canvas.width);
  const y = (canvas.height - displayHeight) / 2 + (offsetY / 100) * (displayHeight - canvas.height);
  
  // Clear canvas
  canvasContext.fillStyle = '#f0f0f0';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw image
  canvasContext.drawImage(currentImageData.img, x, y, displayWidth, displayHeight);
}

function updateCropControls() {
  if (!avatarZoom || !avatarX || !avatarY) return;
  
  zoomValue.textContent = avatarZoom.value + '%';
  xValue.textContent = avatarX.value + '%';
  yValue.textContent = avatarY.value + '%';
  
  drawCropPreview();
}

function saveCropToPreview() {
  if (!canvasContext || !currentImageData || !avatarPreview) return;
  
  const canvas = document.getElementById('cropCanvas');
  const croppedImageData = canvas.toDataURL('image/png');
  
  avatarPreview.style.backgroundImage = `url("${croppedImageData}")`;
  avatarPreview.classList.add('has-image');
  avatarPreview.textContent = '';
}

function openCropper(imageSrc) {
  if (!avatarCropperModal) return;
  avatarCropperModal.classList.add('show');
  
  // Reset controls
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

// Handle avatar upload
if (avatarUpload) {
  avatarUpload.addEventListener('change', () => {
    const file = avatarUpload.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      openCropper(e.target.result);
    };
    reader.readAsDataURL(file);
  });
}

// Handle crop button click
if (cropAvatarBtn) {
  cropAvatarBtn.addEventListener('click', () => {
    if (avatarPreview && avatarPreview.style.backgroundImage) {
      openCropper(avatarPreview.style.backgroundImage.slice(5, -2));
    }
  });
}

// Close cropper modal handlers
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

// Close modal when clicking on backdrop
if (avatarCropperModal) {
  avatarCropperModal.addEventListener('click', (e) => {
    if (e.target === avatarCropperModal) {
      closeCropperModal();
    }
  });
}

// Update crop preview on control changes
if (avatarZoom) {
  avatarZoom.addEventListener('input', updateCropControls);
}

if (avatarX) {
  avatarX.addEventListener('input', updateCropControls);
}

if (avatarY) {
  avatarY.addEventListener('input', updateCropControls);
}

// Handle canvas resizing on window resize
window.addEventListener('resize', () => {
  if (currentImageData && avatarCropperModal.classList.contains('show')) {
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
