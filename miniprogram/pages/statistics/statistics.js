const { getBillsByDateRange } = require('../../utils/db');
const { calculateDailyStats, calculateWeeklyStats, calculateMonthlyStats, calculateYearlyStats } = require('../../utils/stats');
const { getBudget } = require('../../utils/db');
const { calculateBudgetProgress } = require('../../utils/budget');

Page({
  data: {
    period: 'month',
    periods: [
      { key: 'day', label: '日' },
      { key: 'week', label: '周' },
      { key: 'month', label: '月' },
      { key: 'year', label: '年' },
    ],
    stats: null,
    budget: null,
    budgetPercentage: 0,
    categoryBreakdown: [],
    loading: false,
  },

  onShow() { this.loadData(); },

  async loadData() {
    this.setData({ loading: true });
    try {
      const now = new Date();
      let bills, stats;

      switch (this.data.period) {
        case 'day': {
          const today = now.toISOString().slice(0, 10);
          bills = await getBillsByDateRange(today, today);
          stats = calculateDailyStats(bills, today);
          break;
        }
        case 'week': {
          const monday = this.getMonday(now);
          const sunday = new Date(monday);
          sunday.setDate(sunday.getDate() + 6);
          bills = await getBillsByDateRange(
            monday.toISOString().slice(0, 10),
            sunday.toISOString().slice(0, 10)
          );
          stats = calculateWeeklyStats(bills, now.toISOString().slice(0, 10));
          break;
        }
        case 'month': {
          const year = now.getFullYear();
          const month = now.getMonth() + 1;
          const start = `${year}-${String(month).padStart(2, '0')}-01`;
          const end = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
          bills = await getBillsByDateRange(start, end);
          stats = calculateMonthlyStats(bills, `${year}-${String(month).padStart(2, '0')}`);
          break;
        }
        case 'year': {
          const year = now.getFullYear();
          bills = await getBillsByDateRange(`${year}-01-01`, `${year}-12-31`);
          stats = calculateYearlyStats(bills, String(year));
          break;
        }
      }

      const budget = await getBudget();
      const budgetPct = budget ? calculateBudgetProgress(stats.totalExpense, budget.totalBudget) : 0;

      this.setData({
        stats,
        budget,
        budgetPercentage: budgetPct,
        categoryBreakdown: stats.categoryBreakdown || [],
        loading: false,
      });
    } catch (e) {
      console.error('Load stats failed:', e);
      this.setData({ loading: false });
    }
  },

  getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  onPeriodChange(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.period) return;
    this.setData({ period: key });
    this.loadData();
  },

  onTapAdventureDiary() {
    wx.navigateTo({ url: '/pages/adventure-diary/adventure-diary' });
  },

  formatAmount(amount) {
    return (amount / 100).toFixed(2);
  },

  getCategoryColor(index) {
    const colors = ['#FF8C5A', '#4ECDC4', '#FF6B8A', '#FFE66D', '#FFB347', '#87CEEB', '#B8A9C9', '#FF4757', '#A0A0A0', '#DDA0DD'];
    return colors[index % colors.length];
  },
});
