const { getAdventureAction, generateMonthStory, getCurrentFestivalTheme } = require('../../utils/adventure');

describe('getAdventureAction', () => {
  test('returns action for known expense category', () => {
    expect(getAdventureAction('food')).toBe('explore_food');
    expect(getAdventureAction('transport')).toBe('travel');
  });

  test('returns action for known income category', () => {
    expect(getAdventureAction('salary')).toBe('gold_mine');
  });

  test('returns misc for unknown category', () => {
    expect(getAdventureAction('unknown-cat')).toBe('misc');
  });
});

describe('generateMonthStory', () => {
  test('generates story with all sections for active month', () => {
    const data = {
      month: '2026-06',
      themeName: '糖果王国',
      totalExpense: 350000,
      totalIncome: 800000,
      topCategory: '餐饮',
      topCategoryAmount: 120000,
      recordDays: 25,
    };
    const story = generateMonthStory(data);
    expect(story.title).toContain('糖果王国');
    expect(story.sections.length).toBeGreaterThan(0);
    expect(story.summary).toBeDefined();
  });

  test('generates story for empty month', () => {
    const data = {
      month: '2026-06',
      themeName: '迷雾森林',
      totalExpense: 0,
      totalIncome: 0,
      topCategory: null,
      topCategoryAmount: 0,
      recordDays: 0,
    };
    const story = generateMonthStory(data);
    expect(story.sections.length).toBeGreaterThan(0);
  });

  test('includes warning for overspent month', () => {
    const data = {
      month: '2026-06',
      themeName: '糖果王国',
      totalExpense: 500000,
      totalIncome: 300000,
      topCategory: '购物',
      topCategoryAmount: 200000,
      recordDays: 30,
    };
    const story = generateMonthStory(data);
    const warningSection = story.sections.find(s => s.type === 'warning');
    expect(warningSection).toBeDefined();
  });
});

describe('getCurrentFestivalTheme', () => {
  test('returns null for ordinary date', () => {
    const result = getCurrentFestivalTheme(new Date('2026-06-15'));
    expect(result).toBeNull();
  });

  test('returns null when no themes data', () => {
    const result = getCurrentFestivalTheme(new Date('2026-12-25'));
    expect(result).toBeNull();
  });
});
