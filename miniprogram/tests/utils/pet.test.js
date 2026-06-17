const { getPetById, getPetStage, checkPetUnlock, getPetMood, getMoodEmoji } = require('../../utils/pet');

describe('getPetById', () => {
  test('returns basic pet by id', () => {
    const pet = getPetById('fat-cat');
    expect(pet).toBeDefined();
    expect(pet.name).toBe('胖猫');
  });

  test('returns rare pet by id', () => {
    const pet = getPetById('narwhal');
    expect(pet).toBeDefined();
    expect(pet.name).toBe('独角鲸');
  });

  test('returns undefined for unknown id', () => {
    expect(getPetById('nonexistent')).toBeUndefined();
  });
});

describe('getPetStage', () => {
  test('baby stage for 0-30 days', () => {
    expect(getPetStage(0)).toBe('baby');
    expect(getPetStage(30)).toBe('baby');
  });
  test('young stage for 31-90 days', () => {
    expect(getPetStage(31)).toBe('young');
    expect(getPetStage(90)).toBe('young');
  });
  test('adult stage for 91+ days', () => {
    expect(getPetStage(91)).toBe('adult');
    expect(getPetStage(365)).toBe('adult');
  });
});

describe('checkPetUnlock', () => {
  test('initial pets are always unlocked', () => {
    const result = checkPetUnlock('fat-cat', { totalRecords: 0, consecutiveDays: 0 });
    expect(result.unlocked).toBe(true);
  });
  test('unlocks by total records', () => {
    const result = checkPetUnlock('narwhal', { totalRecords: 150, consecutiveDays: 0 });
    expect(result.unlocked).toBe(true);
  });
  test('not unlocked when insufficient', () => {
    const result = checkPetUnlock('narwhal', { totalRecords: 50, consecutiveDays: 0 });
    expect(result.unlocked).toBe(false);
  });
  test('unlocks by consecutive days', () => {
    const result = checkPetUnlock('cream-phoenix', { totalRecords: 0, consecutiveDays: 90 });
    expect(result.unlocked).toBe(true);
  });
  test('returns false for unknown pet', () => {
    const result = checkPetUnlock('unknown', { totalRecords: 999, consecutiveDays: 999 });
    expect(result.unlocked).toBe(false);
  });
});

describe('getPetMood', () => {
  test('happy when under 50%', () => expect(getPetMood(30)).toBe('happy'));
  test('neutral at 50-75%', () => expect(getPetMood(60)).toBe('neutral'));
  test('worried at 75-100%', () => expect(getPetMood(85)).toBe('worried'));
  test('sad over 100%', () => expect(getPetMood(110)).toBe('sad'));
});

describe('getMoodEmoji', () => {
  test('returns emoji for each mood', () => {
    expect(getMoodEmoji('happy')).toBe('(◕‿◕)');
    expect(getMoodEmoji('neutral')).toBe('(・-・)');
    expect(getMoodEmoji('worried')).toBe('(>_<)');
    expect(getMoodEmoji('sad')).toBe('(;_;)');
  });
});
