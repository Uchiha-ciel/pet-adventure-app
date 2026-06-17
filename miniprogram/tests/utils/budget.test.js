const { calculateBudgetProgress, getBudgetWarningLevel, checkCategoryBudget } = require('../../utils/budget');

describe('calculateBudgetProgress', () => {
  test('returns 0% when no spending', () => {
    expect(calculateBudgetProgress(0, 100000)).toBe(0);
  });
  test('returns 50% when half spent', () => {
    expect(calculateBudgetProgress(50000, 100000)).toBe(50);
  });
  test('returns 100% when exactly at budget', () => {
    expect(calculateBudgetProgress(100000, 100000)).toBe(100);
  });
  test('returns 150% when over budget', () => {
    expect(calculateBudgetProgress(150000, 100000)).toBe(150);
  });
  test('returns 0 when budget is 0', () => {
    expect(calculateBudgetProgress(5000, 0)).toBe(0);
  });
});

describe('getBudgetWarningLevel', () => {
  test('returns safe when under 50%', () => {
    expect(getBudgetWarningLevel(30)).toBe('safe');
  });
  test('returns half at 50%', () => {
    expect(getBudgetWarningLevel(50)).toBe('half');
  });
  test('returns warning at 80%', () => {
    expect(getBudgetWarningLevel(80)).toBe('warning');
  });
  test('returns critical at 100%', () => {
    expect(getBudgetWarningLevel(100)).toBe('critical');
  });
  test('returns over above 100%', () => {
    expect(getBudgetWarningLevel(120)).toBe('over');
  });
});

describe('checkCategoryBudget', () => {
  test('returns no alerts when no spending', () => {
    const result = checkCategoryBudget({}, { food: 50000 });
    expect(result.alerts).toHaveLength(0);
  });
  test('alerts on category approaching budget', () => {
    const result = checkCategoryBudget({ food: 45000 }, { food: 50000 });
    expect(result.alerts.length).toBe(1);
    expect(result.alerts[0].category).toBe('food');
    expect(result.alerts[0].level).toBe('warning');
  });
  test('no alert for category under 50%', () => {
    const result = checkCategoryBudget({ food: 20000 }, { food: 50000 });
    expect(result.alerts).toHaveLength(0);
  });
});
