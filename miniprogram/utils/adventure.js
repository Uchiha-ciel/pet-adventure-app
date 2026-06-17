const categoriesData = require('../data/categories.json');
const themesData = require('../data/themes.json');

const adventureActions = {};
categoriesData.expense.forEach(c => { adventureActions[c.id] = c.adventureAction; });
categoriesData.income.forEach(c => { adventureActions[c.id] = c.adventureAction; });

function getAdventureAction(categoryId) {
  return adventureActions[categoryId] || 'misc';
}

function generateMonthStory(data) {
  const { month, themeName, totalExpense, totalIncome, topCategory, topCategoryAmount, recordDays } = data;
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0;

  const sections = [
    { type: 'intro', text: `${month}，「${themeName}」冒险开始！小精灵整装待发~` },
    { type: 'stat', text: `本月总收入 ${(totalIncome / 100).toFixed(2)} 元，总支出 ${(totalExpense / 100).toFixed(2)} 元` },
  ];

  if (recordDays > 0) {
    sections.push({ type: 'streak', text: `小精灵陪你记录了 ${recordDays} 天的冒险旅程！` });
  }

  if (topCategory) {
    sections.push({ type: 'highlight', text: `本月花钱最多的是「${topCategory}」，共 ${(topCategoryAmount / 100).toFixed(2)} 元` });
  }

  if (balance > 0) {
    sections.push({ type: 'positive', text: `棒极了！本月结余 ${(balance / 100).toFixed(2)} 元，储蓄率 ${savingsRate}%` });
  } else if (balance < 0) {
    sections.push({ type: 'warning', text: `本月超支 ${(Math.abs(balance) / 100).toFixed(2)} 元，下个月加油哦！` });
  }

  sections.push({ type: 'outro', text: '期待下个月的冒险！小精灵在岛上等你~' });

  return {
    title: `「${themeName}」冒险日记 — ${month}`,
    month,
    sections,
    summary: `${month}冒险总结：记录${recordDays}天，${balance >= 0 ? '有结余' : '超支了'}！`,
  };
}

function getCurrentFestivalTheme(date) {
  return null;
}

module.exports = { getAdventureAction, generateMonthStory, getCurrentFestivalTheme };
