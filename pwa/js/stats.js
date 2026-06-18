// js/stats.js — browser version
(function () {
  function filterByDate(bills, start, end) {
    return bills.filter(b => b.timestamp >= start.getTime() && b.timestamp <= end.getTime());
  }
  function sumByType(bills, type) { return bills.filter(b => b.type === type).reduce((s, b) => s + b.amount, 0); }

  function groupByCategory(bills) {
    const map = {};
    bills.forEach(b => {
      if (!map[b.categoryL1]) map[b.categoryL1] = { amount: 0, count: 0 };
      map[b.categoryL1].amount += b.amount;
      map[b.categoryL1].count++;
    });
    const total = Object.values(map).reduce((s, c) => s + c.amount, 0);
    return Object.entries(map).map(([cat, d]) => ({
      category: cat, amount: d.amount, count: d.count,
      percentage: total > 0 ? Math.round(d.amount / total * 10000) / 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
  }

  window.StatsUtils = {
    daily(bills, dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const dayBills = filterByDate(bills, d, new Date(next.getTime() - 1));
      return { date: dateStr, totalExpense: sumByType(dayBills, 'expense'), totalIncome: sumByType(dayBills, 'income'), balance: sumByType(dayBills, 'income') - sumByType(dayBills, 'expense'), categoryBreakdown: groupByCategory(dayBills.filter(b => b.type === 'expense')) };
    },
    weekly(bills, dateStr) {
      const d = new Date(dateStr + 'T00:00:00');
      const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const mon = new Date(d); mon.setDate(diff); mon.setHours(0, 0, 0, 0);
      const sun = new Date(mon); sun.setDate(sun.getDate() + 6); sun.setHours(23, 59, 59, 999);
      const wb = filterByDate(bills, mon, sun);
      const breakdown = [];
      for (let i = 0; i < 7; i++) {
        const dd = new Date(mon); dd.setDate(dd.getDate() + i);
        const ds = dd.toISOString().slice(0, 10);
        breakdown.push({ date: ds, expense: 0, income: 0 });
      }
      wb.forEach(b => { const e = breakdown.find(d => d.date === b.date); if (e) { if (b.type === 'expense') e.expense += b.amount; else e.income += b.amount; } });
      const te = sumByType(wb, 'expense'), ti = sumByType(wb, 'income');
      return { startDate: mon.toISOString().slice(0, 10), endDate: sun.toISOString().slice(0, 10), totalExpense: te, totalIncome: ti, balance: ti - te, dailyBreakdown: breakdown, categoryBreakdown: groupByCategory(wb.filter(b => b.type === 'expense')) };
    },
    monthly(bills, monthStr) {
      const [y, m] = monthStr.split('-').map(Number);
      const start = new Date(y, m - 1, 1), end = new Date(y, m, 0, 23, 59, 59, 999);
      const mb = filterByDate(bills, start, end);
      const te = sumByType(mb, 'expense'), ti = sumByType(mb, 'income');
      return { month: monthStr, totalExpense: te, totalIncome: ti, balance: ti - te, categoryBreakdown: groupByCategory(mb.filter(b => b.type === 'expense')) };
    },
    yearly(bills, yearStr) {
      const y = Number(yearStr);
      const start = new Date(y, 0, 1), end = new Date(y, 11, 31, 23, 59, 59, 999);
      const yb = filterByDate(bills, start, end);
      const te = sumByType(yb, 'expense'), ti = sumByType(yb, 'income');
      const monthlyBreakdown = [];
      for (let m = 0; m < 12; m++) {
        const ms = new Date(y, m, 1), me = new Date(y, m + 1, 0, 23, 59, 59, 999);
        const mb = filterByDate(yb, ms, me);
        monthlyBreakdown.push({ month: m + 1, expense: sumByType(mb, 'expense'), income: sumByType(mb, 'income') });
      }
      return { year: yearStr, totalExpense: te, totalIncome: ti, balance: ti - te, monthlyBreakdown, categoryBreakdown: groupByCategory(yb.filter(b => b.type === 'expense')) };
    },
    groupByCategory,
  };
})();
