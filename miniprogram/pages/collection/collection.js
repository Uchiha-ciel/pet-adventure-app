const { ALL_PETS, checkPetUnlock } = require('../../utils/pet');

Page({
  data: {
    pets: [],
    currentPetId: '',
    activeTab: 'pets',
  },
  onShow() {
    const app = getApp();
    const userStats = app.globalData.userStats || { totalRecords: 0, consecutiveDays: 0 };
    const pets = ALL_PETS.map(p => ({
      ...p,
      unlocked: checkPetUnlock(p.id, userStats).unlocked,
    }));
    this.setData({
      pets,
      currentPetId: app.globalData.currentPet || 'fat-cat',
    });
  },
  onSelectPet(e) {
    const { id } = e.currentTarget.dataset;
    const pet = this.data.pets.find(p => p.id === id);
    if (!pet || !pet.unlocked) {
      wx.showToast({ title: '尚未解锁，继续加油！', icon: 'none' });
      return;
    }
    const app = getApp();
    app.globalData.currentPet = id;
    this.setData({ currentPetId: id });
    wx.showToast({ title: `已切换为${pet.name}`, icon: 'success' });
  },
  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },
});
