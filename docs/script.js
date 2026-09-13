const ageRange = document.getElementById('ageRange');
const ageValue = document.getElementById('ageValue');
const ageNote = document.getElementById('ageNote');
const ageGroup = document.getElementById('ageGroup');

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

if (ageRange && ageValue && ageNote && ageGroup) {
  const updateAge = () => {
    const age = Number(ageRange.value);
    ageValue.textContent = age;
    ageNote.textContent = getCommunityRange(age);
    ageGroup.textContent = getAgeGroup(age);
  };

  ageRange.addEventListener('input', updateAge);
  updateAge();
}
