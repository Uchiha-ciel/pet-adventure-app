const petsData = require('../data/pets.json');
const ALL_PETS = [...petsData.basic, ...petsData.rare];

function getPetById(id) {
  return ALL_PETS.find(p => p.id === id);
}

function getPetStage(totalDays) {
  if (totalDays <= 30) return 'baby';
  if (totalDays <= 90) return 'young';
  return 'adult';
}

function checkPetUnlock(petId, userStats) {
  const pet = getPetById(petId);
  if (!pet) return { unlocked: false, reason: 'unknown_pet' };
  if (pet.unlockCondition === 'initial') return { unlocked: true };

  const { type, value } = pet.unlockCondition;
  const current = userStats[type] || 0;
  return {
    unlocked: current >= value,
    reason: current >= value ? null : 'not_met',
    required: value,
    current,
  };
}

function getPetMood(budgetPercentage) {
  if (budgetPercentage <= 50) return 'happy';
  if (budgetPercentage <= 75) return 'neutral';
  if (budgetPercentage <= 100) return 'worried';
  return 'sad';
}

function getMoodEmoji(mood) {
  const map = {
    happy: '(◕‿◕)',
    neutral: '(・-・)',
    worried: '(>_<)',
    sad: '(;_;)',
  };
  return map[mood] || '(・-・)';
}

module.exports = { getPetById, getPetStage, checkPetUnlock, getPetMood, getMoodEmoji, ALL_PETS };
