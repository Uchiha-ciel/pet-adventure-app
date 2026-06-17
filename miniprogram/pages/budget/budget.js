const { getBudget, saveBudget } = require('../../utils/db');
const categoriesData = require('../../data/categories.json');

Page({
  data: {
    period: 'monthly',
    totalBudget: '',
    categoryBudgets: {},
    expenseCategories: [],
    saving: false,
  },
  onShow() {
    this.setData({ expenseCategories: categoriesData.expense });
    this.loadBudget();
  },
  async loadBudget() {
    const budget = await getBudget();
    if (budget) {
      const catBudgets = {};
      if (budget.categoryBudgets) {
        Object.entries(budget.categoryBudgets).forEach(([k, v]) => {
          catBudgets[k] = v > 0 ? String(v / 100) : '';
        });
      }
      this.setData({
        period: budget.period || 'monthly',
        totalBudget: budget.totalBudget > 0 ? String(budget.totalBudget / 100) : '',
        categoryBudgets: catBudgets,
      });
    }
  },
  onPeriodChange(e) { this.setData({ period: e.detail.value }); },
  onTotalInput(e) { this.setData({ totalBudget: e.detail.value }); },
  onCategoryInput(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ [`categoryBudgets.${cat}`]: e.detail.value });
  },
  async onSave() {
    this.setData({ saving: true });
    try {
      const catBudgets = {};
      Object.entries(this.data.categoryBudgets).forEach(([k, v]) => {
        if (v && parseFloat(v) > 0) catBudgets[k] = Math.round(parseFloat(v) * 100);
      });
      await saveBudget({
        period: this.data.period,
        totalBudget: Math.round(parseFloat(this.data.totalBudget || '0') * 100),
        categoryBudgets: catBudgets,
      });
      wx.showToast({ title: '预算已保存', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});
