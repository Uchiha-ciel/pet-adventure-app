Page({
  data: {
    totalDays: 0,
    totalRecords: 0,
    achievements: [
      { id: 'first-record', name: '初次冒险', desc: '完成第一笔记账', unlocked: false },
      { id: 'streak-7', name: '坚持不懈', desc: '连续记账7天', unlocked: false },
      { id: 'streak-30', name: '月度勇士', desc: '连续记账30天', unlocked: false },
      { id: 'records-100', name: '百记达人', desc: '累计记账100笔', unlocked: false },
      { id: 'records-1000', name: '记账大师', desc: '累计记账1000笔', unlocked: false },
      { id: 'budget-master', name: '预算管家', desc: '连续3月达成预算', unlocked: false },
    ],
    menuItems: [
      { icon: '🐾', label: '精灵收藏馆', url: '/pages/collection/collection' },
      { icon: '📖', label: '冒险相册', url: '/pages/adventure-diary/adventure-diary' },
      { icon: '💰', label: '预算设置', url: '/pages/budget/budget' },
      { icon: '📋', label: '分类管理', url: '/pages/category-mgmt/category-mgmt' },
    ],
  },

  onShow() {
    this.loadStats();
  },

  loadStats() {
    const app = getApp();
    this.setData({
      totalDays: app.globalData.totalDays || 0,
      totalRecords: app.globalData.userStats?.totalRecords || 0,
    });
    this.updateAchievements();
  },

  updateAchievements() {
    const { totalRecords, totalDays } = this.data;
    const achievements = this.data.achievements.map(a => {
      let unlocked = false;
      if (a.id === 'first-record') unlocked = totalRecords >= 1;
      if (a.id === 'streak-7') unlocked = totalDays >= 7;
      if (a.id === 'streak-30') unlocked = totalDays >= 30;
      if (a.id === 'records-100') unlocked = totalRecords >= 100;
      if (a.id === 'records-1000') unlocked = totalRecords >= 1000;
      return { ...a, unlocked };
    });
    this.setData({ achievements });
  },

  onTapMenu(e) {
    const { url } = e.currentTarget.dataset;
    if (url) wx.navigateTo({ url });
  },
});
