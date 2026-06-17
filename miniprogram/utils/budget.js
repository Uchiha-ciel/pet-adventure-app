function calculateBudgetProgress(spent, budget) {
  if (budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

function getBudgetWarningLevel(percentage) {
  if (percentage > 100) return 'over';
  if (percentage >= 100) return 'critical';
  if (percentage >= 80) return 'warning';
  if (percentage >= 50) return 'half';
  return 'safe';
}

function getWarningMessage(level, categoryName) {
  const messages = {
    half: `${categoryName || ''}预算已过半啦~`,
    warning: `${categoryName || ''}预算快要用完咯`,
    critical: `${categoryName || ''}预算已用完！`,
    over: `${categoryName || ''}超预算了！`,
  };
  return messages[level] || '';
}

function checkCategoryBudget(spending, categoryBudgets) {
  const alerts = [];
  Object.entries(categoryBudgets).forEach(([category, budget]) => {
    const spent = spending[category] || 0;
    const percentage = calculateBudgetProgress(spent, budget);
    const level = getBudgetWarningLevel(percentage);
    if (level !== 'safe') {
      alerts.push({
        category, spent, budget, percentage, level,
        message: getWarningMessage(level, category),
      });
    }
  });
  return { alerts, hasAlert: alerts.length > 0 };
}

module.exports = { calculateBudgetProgress, getBudgetWarningLevel, checkCategoryBudget, getWarningMessage };
