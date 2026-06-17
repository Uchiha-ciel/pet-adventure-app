const { calculateDailyStats, calculateWeeklyStats, calculateMonthlyStats, calculateYearlyStats, groupByCategory } = require('../../utils/stats');

const sampleBills = [
  { type: 'expense', amount: 3000, categoryL1: 'food', categoryL2: 'breakfast', date: '2026-06-15', timestamp: 1686816000000 },
  { type: 'expense', amount: 5000, categoryL1: 'food', categoryL2: 'lunch', date: '2026-06-15', timestamp: 1686830400000 },
  { type: 'expense', amount: 2000, categoryL1: 'transport', categoryL2: 'subway', date: '2026-06-15', timestamp: 1686816000000 },
  { type: 'income', amount: 500000, categoryL1: 'salary', categoryL2: 'monthly', date: '2026-06-15', timestamp: 1686816000000 },
  { type: 'expense', amount: 1500, categoryL1: 'food', categoryL2: 'snack', date: '2026-06-14', timestamp: 1686729600000 },
  { type: 'expense', amount: 8000, categoryL1: 'entertainment', categoryL2: 'movie', date: '2026-06-10', timestamp: 1686384000000 },
];

describe('calculateDailyStats', () => {
  test('calculates daily income, expense, and balance', () => {
    const result = calculateDailyStats(sampleBills, '2026-06-15');
    expect(result.totalExpense).toBe(10000);
    expect(result.totalIncome).toBe(500000);
    expect(result.balance).toBe(490000);
  });

  test('returns zeros for day with no bills', () => {
    const result = calculateDailyStats(sampleBills, '2026-06-16');
    expect(result.totalExpense).toBe(0);
    expect(result.totalIncome).toBe(0);
    expect(result.balance).toBe(0);
  });
});

describe('calculateWeeklyStats', () => {
  test('calculates weekly totals', () => {
    const result = calculateWeeklyStats(sampleBills, '2026-06-15');
    expect(result.totalExpense).toBe(19500);
    expect(result.totalIncome).toBe(500000);
    expect(result.dailyBreakdown).toHaveLength(7);
  });

  test('daily breakdown has correct structure', () => {
    const result = calculateWeeklyStats(sampleBills, '2026-06-15');
    result.dailyBreakdown.forEach(day => {
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('expense');
      expect(day).toHaveProperty('income');
    });
  });
});

describe('calculateMonthlyStats', () => {
  test('calculates monthly totals', () => {
    const result = calculateMonthlyStats(sampleBills, '2026-06');
    expect(result.totalExpense).toBe(19500);
    expect(result.totalIncome).toBe(500000);
    expect(result.categoryBreakdown).toBeDefined();
  });
});

describe('calculateYearlyStats', () => {
  test('calculates yearly totals with 12-month breakdown', () => {
    const result = calculateYearlyStats(sampleBills, '2026');
    expect(result.totalExpense).toBe(19500);
    expect(result.totalIncome).toBe(500000);
    expect(result.monthlyBreakdown).toHaveLength(12);
  });
});

describe('groupByCategory', () => {
  test('groups expense bills by categoryL1 and sums amounts', () => {
    const result = groupByCategory(sampleBills.filter(b => b.type === 'expense'));
    expect(result.length).toBeGreaterThan(0);
    const food = result.find(r => r.category === 'food');
    expect(food).toBeDefined();
    expect(food.amount).toBe(9500);
  });

  test('percentages sum to approximately 100', () => {
    const result = groupByCategory(sampleBills.filter(b => b.type === 'expense'));
    const total = result.reduce((sum, c) => sum + c.percentage, 0);
    expect(Math.round(total)).toBe(100);
  });
});
