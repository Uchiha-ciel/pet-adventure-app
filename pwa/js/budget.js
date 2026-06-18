// js/budget.js — browser version
window.BudgetUtils = {
  progress(spent, budget) { return budget <= 0 ? 0 : Math.round(spent / budget * 100); },
  warningLevel(pct) {
    if (pct > 100) return 'over';
    if (pct >= 100) return 'critical';
    if (pct >= 80) return 'warning';
    if (pct >= 50) return 'half';
    return 'safe';
  },
  checkCategory(spending, categoryBudgets) {
    const alerts = [];
    Object.entries(categoryBudgets || {}).forEach(([cat, budget]) => {
      const spent = spending[cat] || 0;
      const pct = this.progress(spent, budget);
      const level = this.warningLevel(pct);
      if (level !== 'safe') alerts.push({ category: cat, spent, budget, percentage: pct, level });
    });
    return { alerts, hasAlert: alerts.length > 0 };
  },
};
