function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekRange(dateStr) {
  const end = new Date(dateStr + 'T00:00:00');
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function filterByDate(bills, start, end) {
  const startStr = formatLocalDate(start);
  const endStr = formatLocalDate(end);
  return bills.filter(b => b.date >= startStr && b.date <= endStr);
}

function sumByType(bills, type) {
  return bills.filter(b => b.type === type).reduce((sum, b) => sum + b.amount, 0);
}

function groupByCategory(bills) {
  const map = {};
  bills.forEach(b => {
    if (!map[b.categoryL1]) map[b.categoryL1] = { amount: 0, count: 0 };
    map[b.categoryL1].amount += b.amount;
    map[b.categoryL1].count += 1;
  });
  const total = Object.values(map).reduce((s, c) => s + c.amount, 0);
  return Object.entries(map)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? Math.round((data.amount / total) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function calculateDailyStats(bills, dateStr) {
  const dayBills = bills.filter(b => b.date === dateStr);
  const totalExpense = sumByType(dayBills, 'expense');
  const totalIncome = sumByType(dayBills, 'income');
  const categoryBreakdown = groupByCategory(dayBills.filter(b => b.type === 'expense'));
  return { date: dateStr, totalExpense, totalIncome, balance: totalIncome - totalExpense, categoryBreakdown };
}

function calculateWeeklyStats(bills, dateStr) {
  const { start, end } = getWeekRange(dateStr);
  const weekBills = filterByDate(bills, start, end);
  const totalExpense = sumByType(weekBills, 'expense');
  const totalIncome = sumByType(weekBills, 'income');

  const dailyBreakdown = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    const dayStr = formatLocalDate(day);
    dailyBreakdown.push({ date: dayStr, expense: 0, income: 0 });
  }
  weekBills.forEach(b => {
    const entry = dailyBreakdown.find(d => d.date === b.date);
    if (entry) {
      if (b.type === 'expense') entry.expense += b.amount;
      else entry.income += b.amount;
    }
  });

  return {
    startDate: formatLocalDate(start),
    endDate: formatLocalDate(end),
    totalExpense,
    totalIncome,
    balance: totalIncome - totalExpense,
    dailyBreakdown,
  };
}

function calculateMonthlyStats(bills, monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const monthBills = filterByDate(bills, start, end);
  const totalExpense = sumByType(monthBills, 'expense');
  const totalIncome = sumByType(monthBills, 'income');
  const categoryBreakdown = groupByCategory(monthBills.filter(b => b.type === 'expense'));
  return { month: monthStr, totalExpense, totalIncome, balance: totalIncome - totalExpense, categoryBreakdown };
}

function calculateYearlyStats(bills, yearStr) {
  const year = Number(yearStr);
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  const yearBills = filterByDate(bills, start, end);
  const totalExpense = sumByType(yearBills, 'expense');
  const totalIncome = sumByType(yearBills, 'income');

  const monthlyBreakdown = [];
  for (let m = 0; m < 12; m++) {
    const monthStart = new Date(year, m, 1);
    const monthEnd = new Date(year, m + 1, 0, 23, 59, 59, 999);
    const monthBills = filterByDate(yearBills, monthStart, monthEnd);
    monthlyBreakdown.push({
      month: m + 1,
      expense: sumByType(monthBills, 'expense'),
      income: sumByType(monthBills, 'income'),
    });
  }

  return { year: yearStr, totalExpense, totalIncome, balance: totalIncome - totalExpense, monthlyBreakdown };
}

module.exports = { calculateDailyStats, calculateWeeklyStats, calculateMonthlyStats, calculateYearlyStats, groupByCategory };
