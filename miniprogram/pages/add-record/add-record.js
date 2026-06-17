const { addBill } = require('../../utils/db');

Page({
  data: {
    type: 'expense',
    amount: '',
    categoryL1: '',
    categoryL2: '',
    date: '',
    time: '',
    note: '',
    showCategoryPicker: false,
    submitting: false,
  },

  onLoad() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.setData({
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    });
  },

  onTapDigit(e) {
    const digit = e.currentTarget.dataset.digit;
    let current = this.data.amount;

    if (digit === '.') {
      if (current.includes('.') || current === '') return;
      this.setData({ amount: current + '.' });
    } else if (digit === 'del') {
      this.setData({ amount: current.slice(0, -1) });
    } else {
      if (current === '0') {
        this.setData({ amount: digit });
      } else {
        this.setData({ amount: current + digit });
      }
    }
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ type, categoryL1: '', categoryL2: '' });
  },

  onToggleCategoryPicker() {
    this.setData({ showCategoryPicker: !this.data.showCategoryPicker });
  },

  onSelectCategory(e) {
    const { categoryL1, categoryL2 } = e.detail;
    this.setData({ categoryL1, categoryL2, showCategoryPicker: false });
  },

  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ time: e.detail.value });
  },

  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },

  getCategoryName() {
    const data = require('../../data/categories.json');
    const cats = data[this.data.type];
    const l1 = cats.find(c => c.id === this.data.categoryL1);
    const l2 = l1 ? l1.children.find(s => s.id === this.data.categoryL2) : null;
    return l1 && l2 ? `${l1.name} · ${l2.name}` : '';
  },

  async onSubmit() {
    const { type, amount, categoryL1, categoryL2, date, time, note } = this.data;

    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }
    if (!categoryL1 || !categoryL2) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      const timestamp = new Date(`${date}T${time}:00`).getTime();
      await addBill({
        type,
        amount: Math.round(parseFloat(amount) * 100),
        categoryL1,
        categoryL2,
        date,
        timestamp,
        note: note.trim(),
      });

      wx.vibrateShort({ type: 'medium' });
      wx.showToast({ title: '记好啦！✨', icon: 'success', duration: 800 });
      setTimeout(() => wx.navigateBack(), 900);
    } catch (e) {
      console.error('Add bill failed:', e);
      wx.showToast({ title: '记录失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
