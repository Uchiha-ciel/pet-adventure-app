const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed, previous month is complete
  const targetYear = month === 0 ? year - 1 : year;
  const targetMonth = month === 0 ? 12 : month;
  const monthStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}`;

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${lastDay}`;

  try {
    const usersResult = await db.collection('users').get();
    const users = usersResult.data;

    let processedCount = 0;
    for (const user of users) {
      try {
        const billsResult = await db.collection('bills')
          .where({ _openid: user._openid, date: _.gte(startDate).and(_.lte(endDate)) })
          .get();

        const bills = billsResult.data;
        const totalExpense = bills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
        const totalIncome = bills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);

        const catMap = {};
        bills.filter(b => b.type === 'expense').forEach(b => {
          catMap[b.categoryL1] = (catMap[b.categoryL1] || 0) + b.amount;
        });
        const topEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

        await db.collection('adventures').add({
          data: {
            _openid: user._openid,
            month: monthStr,
            themeId: user.currentTheme || 'candy-kingdom',
            totalExpense,
            totalIncome,
            topCategory: topEntry ? topEntry[0] : null,
            topCategoryAmount: topEntry ? topEntry[1] : 0,
            recordDays: new Set(bills.map(b => b.date)).size,
            totalRecords: bills.length,
            createdAt: db.serverDate(),
          },
        });
        processedCount++;
      } catch (e) {
        console.error(`Failed for user ${user._openid}:`, e);
      }
    }

    return { success: true, month: monthStr, userCount: users.length, processedCount };
  } catch (e) {
    console.error('generateAdventure failed:', e);
    return { success: false, error: e.message };
  }
};
