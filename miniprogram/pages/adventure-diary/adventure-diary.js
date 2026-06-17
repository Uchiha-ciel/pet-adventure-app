const { getAdventure } = require('../../utils/db');
const { generateMonthStory } = require('../../utils/adventure');

Page({
  data: {
    adventures: [],
    loading: false,
    isEmpty: true,
  },
  onShow() { this.loadAdventures(); },
  async loadAdventures() {
    this.setData({ loading: true });
    try {
      const months = this.getRecentMonths(12);
      const results = [];
      for (const month of months) {
        const adv = await getAdventure(month);
        if (adv) results.push(adv);
      }
      this.setData({ adventures: results, isEmpty: results.length === 0, loading: false });
    } catch (e) {
      console.error(e);
      this.setData({ loading: false });
    }
  },
  getRecentMonths(count) {
    const months = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  },
  onTapAdventure(e) {
    const adventure = e.currentTarget.dataset.adventure;
    const story = generateMonthStory({
      month: adventure.month,
      themeName: adventure.themeId || '糖果王国',
      totalExpense: adventure.totalExpense || 0,
      totalIncome: adventure.totalIncome || 0,
      topCategory: adventure.topCategory,
      topCategoryAmount: adventure.topCategoryAmount || 0,
      recordDays: adventure.recordDays || 0,
    });
    this.setData({ selectedStory: story });
  },
  onCloseStory() {
    this.setData({ selectedStory: null });
  },
});
