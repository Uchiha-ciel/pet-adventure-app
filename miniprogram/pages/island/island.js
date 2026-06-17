const { getBillsByDateRange } = require('../../utils/db');
const { calculateDailyStats } = require('../../utils/stats');
const { getPetById, getPetStage, getPetMood, getMoodEmoji } = require('../../utils/pet');
const { getBudget } = require('../../utils/db');
const { calculateBudgetProgress } = require('../../utils/budget');

Page({
  data: {
    pet: { name: '胖猫', id: 'fat-cat' },
    petStage: 'baby',
    petMood: 'happy',
    moodEmoji: '(◕‿◕)',
    todayStats: { totalExpense: 0, totalIncome: 0, balance: 0 },
    budget: null,
    budgetPercentage: 0,
    adventureProgress: 0,
    recentBills: [],
    loading: true,
  },

  onShow() {
    this.loadAll();
  },

  onPullDownRefresh() {
    this.loadAll().finally(() => wx.stopPullDownRefresh());
  },

  async loadAll() {
    this.setData({ loading: true });
    try {
      await Promise.all([this.loadPet(), this.loadToday()]);
    } catch (e) {
      console.error('Load island failed:', e);
    }
    this.setData({ loading: false });
  },

  loadPet() {
    const app = getApp();
    const pet = getPetById(app.globalData.currentPet || 'fat-cat');
    const totalDays = app.globalData.totalDays || 0;
    this.setData({
      pet: pet || { name: '胖猫', id: 'fat-cat' },
      petStage: getPetStage(totalDays),
    });
  },

  async loadToday() {
    const today = new Date().toISOString().slice(0, 10);
    const bills = await getBillsByDateRange(today, today);
    const stats = calculateDailyStats(bills, today);
    const budget = await getBudget();
    const budgetPct = budget ? calculateBudgetProgress(stats.totalExpense, budget.totalBudget) : 0;
    const mood = getPetMood(budgetPct);

    const now = new Date();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const recordDays = new Set(bills.map(b => b.date)).size;
    const adventureProgress = Math.round((now.getDate() / totalDays) * 100);

    this.setData({
      todayStats: stats,
      budget,
      budgetPercentage: budgetPct,
      petMood: mood,
      moodEmoji: getMoodEmoji(mood),
      adventureProgress,
      recentBills: bills.slice(0, 5),
    });
  },

  onPetTap() {
    wx.vibrateShort({ type: 'light' });
    const animations = ['(◕‿◕)✨', '(◕‿◕)💕', '(◕‿◕)🌟'];
    const randomEmoji = animations[Math.floor(Math.random() * animations.length)];
    this.setData({ moodEmoji: randomEmoji });
    setTimeout(() => {
      this.setData({ moodEmoji: getMoodEmoji(this.data.petMood) });
    }, 800);
  },

  onAddRecord() {
    wx.navigateTo({ url: '/pages/add-record/add-record' });
  },

  formatAmount(amount) {
    return (amount / 100).toFixed(2);
  },
});
