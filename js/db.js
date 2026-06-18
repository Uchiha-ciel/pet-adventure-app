// js/db.js — localStorage wrapper for bills, budgets, settings
const DB = {
  getBills() {
    return JSON.parse(localStorage.getItem('bills') || '[]');
  },
  saveBill(bill) {
    const bills = this.getBills();
    bill._id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    bill.createdAt = new Date().toISOString();
    bills.unshift(bill);
    localStorage.setItem('bills', JSON.stringify(bills));
    return bill;
  },
  deleteBill(id) {
    const bills = this.getBills().filter(b => b._id !== id);
    localStorage.setItem('bills', JSON.stringify(bills));
  },
  updateBill(id, data) {
    const bills = this.getBills();
    const idx = bills.findIndex(b => b._id === id);
    if (idx >= 0) { bills[idx] = { ...bills[idx], ...data }; localStorage.setItem('bills', JSON.stringify(bills)); }
  },
  getBillsByDateRange(start, end) {
    return this.getBills().filter(b => b.date >= start && b.date <= end).sort((a, b) => b.timestamp - a.timestamp);
  },
  getBudget() {
    return JSON.parse(localStorage.getItem('budget') || 'null');
  },
  saveBudget(budget) {
    localStorage.setItem('budget', JSON.stringify(budget));
  },
  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  },
  saveUser(user) {
    localStorage.setItem('user', JSON.stringify({ ...this.getUser(), ...user }));
  },
  getAdventures() {
    return JSON.parse(localStorage.getItem('adventures') || '[]');
  },
  saveAdventure(adv) {
    const adventures = this.getAdventures().filter(a => a.month !== adv.month);
    adventures.push(adv);
    localStorage.setItem('adventures', JSON.stringify(adventures));
  },
  exportAll() {
    return {
      bills: this.getBills(),
      budget: this.getBudget(),
      user: this.getUser(),
      adventures: this.getAdventures(),
      exportedAt: new Date().toISOString(),
    };
  },
  importAll(data) {
    if (data.bills) localStorage.setItem('bills', JSON.stringify(data.bills));
    if (data.budget) localStorage.setItem('budget', JSON.stringify(data.budget));
    if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
    if (data.adventures) localStorage.setItem('adventures', JSON.stringify(data.adventures));
  },
};
