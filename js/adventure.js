// js/adventure.js — browser version
(function () {
  const actions = {};

  window.AdventureUtils = {
    init(categoriesData) {
      (categoriesData.expense || []).forEach(c => { actions[c.id] = c.adventureAction; });
      (categoriesData.income || []).forEach(c => { actions[c.id] = c.adventureAction; });
    },
    getAction(catId) { return actions[catId] || 'misc'; },
    generateStory(data) {
      const { month, themeName, totalExpense, totalIncome, topCategory, topCategoryAmount, recordDays } = data;
      const balance = totalIncome - totalExpense;
      const sections = [
        { type: 'intro', text: `${month}，「${themeName}」冒险开始！✨` },
        { type: 'stat', text: `总收入 ¥${(totalIncome / 100).toFixed(2)} · 总支出 ¥${(totalExpense / 100).toFixed(2)}` },
      ];
      if (recordDays > 0) sections.push({ type: 'streak', text: `小精灵陪你记录了 ${recordDays} 天！` });
      if (topCategory) sections.push({ type: 'highlight', text: `花最多：「${topCategory}」¥${(topCategoryAmount / 100).toFixed(2)}` });
      if (balance > 0) sections.push({ type: 'positive', text: `结余 ¥${(balance / 100).toFixed(2)}，储蓄率 ${totalIncome > 0 ? Math.round(balance / totalIncome * 100) : 0}% 🎉` });
      else if (balance < 0) sections.push({ type: 'warning', text: `超支 ¥${(Math.abs(balance) / 100).toFixed(2)}，下个月加油！💪` });
      sections.push({ type: 'outro', text: '新的冒险即将开始，小精灵在等你~' });
      return { title: `「${themeName}」冒险日记 — ${month}`, month, sections, summary: `记录 ${recordDays} 天，${balance >= 0 ? '有结余' : '超支了'}` };
    },
  };
})();
