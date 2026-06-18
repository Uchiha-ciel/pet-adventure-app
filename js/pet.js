// js/pet.js — browser version
(function () {
  const ALL_PETS = [];

  window.PetUtils = {
    init(data) {
      ALL_PETS.length = 0;
      ALL_PETS.push(...(data.basic || []), ...(data.rare || []));
    },
    getById(id) { return ALL_PETS.find(p => p.id === id); },
    getStage(days) { return days <= 30 ? 'baby' : days <= 90 ? 'young' : 'adult'; },
    checkUnlock(petId, stats) {
      const pet = this.getById(petId);
      if (!pet) return { unlocked: false };
      if (pet.unlockCondition === 'initial') return { unlocked: true };
      const { type, value } = pet.unlockCondition;
      return { unlocked: (stats[type] || 0) >= value, required: value, current: stats[type] || 0 };
    },
    getMood(budgetPct) {
      if (budgetPct <= 50) return 'happy';
      if (budgetPct <= 75) return 'neutral';
      if (budgetPct <= 100) return 'worried';
      return 'sad';
    },
    getMoodEmoji(mood) {
      return { happy: '(◕‿◕)', neutral: '(・-・)', worried: '(>_<)', sad: '(;_;)' }[mood] || '(・-・)';
    },
    getAll() { return ALL_PETS; },
  };
})();
