const { getBillsByDateRange, deleteBill } = require('../../utils/db');

Page({
  data: {
    groupedBills: [],
    currentMonth: '',
    loading: false,
    isEmpty: true,
  },

  onShow() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ currentMonth: month });
    this.loadBills();
  },

  onPullDownRefresh() {
    this.loadBills().finally(() => wx.stopPullDownRefresh());
  },

  async loadBills() {
    this.setData({ loading: true });
    try {
      const [year, month] = this.data.currentMonth.split('-').map(Number);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

      const bills = await getBillsByDateRange(startDate, endDate);
      const grouped = this.groupByDate(bills);
      this.setData({
        groupedBills: grouped,
        isEmpty: bills.length === 0,
        loading: false,
      });
    } catch (e) {
      console.error('Load bills failed:', e);
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  groupByDate(bills) {
    const groups = {};
    bills.forEach(b => {
      if (!groups[b.date]) {
        const d = new Date(b.date);
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekDay = weekDays[d.getDay()];
        const monthDay = `${d.getMonth() + 1}月${d.getDate()}日`;
        groups[b.date] = {
          date: b.date,
          label: `${monthDay} 周${weekDay}`,
          expense: 0,
          income: 0,
          items: [],
        };
      }
      const group = groups[b.date];
      if (b.type === 'expense') group.expense += b.amount;
      else group.income += b.amount;
      group.items.push(b);
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  },

  onMonthChange(e) {
    this.setData({ currentMonth: e.detail.value });
    this.loadBills();
  },

  onPrevMonth() {
    const [year, month] = this.data.currentMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    this.setData({
      currentMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
    this.loadBills();
  },

  onNextMonth() {
    const [year, month] = this.data.currentMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    this.setData({
      currentMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
    this.loadBills();
  },

  async onDeleteBill(e) {
    const { id } = e.currentTarget.dataset;
    const result = await wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复哦',
      confirmColor: '#FF4757',
    });
    if (result.confirm) {
      try {
        await deleteBill(id);
        wx.showToast({ title: '已删除', icon: 'success' });
        this.loadBills();
      } catch (err) {
        wx.showToast({ title: '删除失败', icon: 'none' });
      }
    }
  },

  formatAmount(amount) {
    return (amount / 100).toFixed(2);
  },
});
