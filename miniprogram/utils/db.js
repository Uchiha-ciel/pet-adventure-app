const db = wx.cloud.database();
const _ = db.command;

const collections = {
  bills: db.collection('bills'),
  budgets: db.collection('budgets'),
  users: db.collection('users'),
  adventures: db.collection('adventures'),
};

// Bills
async function addBill(bill) {
  const data = {
    type: bill.type,
    amount: Math.round(bill.amount),
    categoryL1: bill.categoryL1,
    categoryL2: bill.categoryL2,
    date: bill.date,
    timestamp: bill.timestamp || Date.now(),
    note: bill.note || '',
    createdAt: db.serverDate(),
  };
  const result = await collections.bills.add({ data });
  return { _id: result._id, ...data };
}

async function getBillsByDateRange(startDate, endDate) {
  const MAX_LIMIT = 100;
  let allData = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await collections.bills
      .where({ date: _.gte(startDate).and(_.lte(endDate)) })
      .orderBy('timestamp', 'desc')
      .skip(skip)
      .limit(MAX_LIMIT)
      .get();
    allData = allData.concat(result.data);
    skip += MAX_LIMIT;
    hasMore = result.data.length === MAX_LIMIT;
  }
  return allData;
}

async function deleteBill(id) {
  await collections.bills.doc(id).remove();
}

async function updateBill(id, data) {
  await collections.bills.doc(id).update({ data });
}

// Budget
async function getBudget() {
  const result = await collections.budgets.limit(1).get();
  return result.data[0] || null;
}

async function saveBudget(budget) {
  const existing = await getBudget();
  if (existing) {
    await collections.budgets.doc(existing._id).update({ data: budget });
  } else {
    await collections.budgets.add({ data: budget });
  }
}

// User
async function getUser() {
  const result = await collections.users.limit(1).get();
  return result.data[0] || null;
}

async function updateUser(data) {
  const user = await getUser();
  if (user) {
    await collections.users.doc(user._id).update({ data });
  } else {
    await collections.users.add({ data });
  }
}

// Adventures
async function getAdventure(month) {
  const result = await collections.adventures.where({ month }).limit(1).get();
  return result.data[0] || null;
}

async function saveAdventure(adventure) {
  const existing = await getAdventure(adventure.month);
  if (existing) {
    await collections.adventures.doc(existing._id).update({ data: adventure });
  } else {
    await collections.adventures.add({ data: adventure });
  }
}

module.exports = {
  addBill,
  getBillsByDateRange,
  deleteBill,
  updateBill,
  getBudget,
  saveBudget,
  getUser,
  updateUser,
  getAdventure,
  saveAdventure,
};
