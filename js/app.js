// js/app.js — Main application controller
(function () {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  let currentTab = 'island';
  let currentPeriod = 'month';
  let categoriesData = {};
  let petsData = {};

  // ── Init ──
  async function init() {
    // Load static data
    const [cats, pets, themes] = await Promise.all([
      fetch('data/categories.json').then(r => r.json()),
      fetch('data/pets.json').then(r => r.json()),
      fetch('data/themes.json').then(r => r.json()),
    ]);
    categoriesData = cats;
    PetUtils.init(pets);
    AdventureUtils.init(cats);

    // Init user if needed
    if (!DB.getUser()) {
      DB.saveUser({ currentPet: 'fat-cat', currentTheme: 'candy-kingdom', unlockedPets: ['fat-cat'], unlockedThemes: ['candy-kingdom'], totalRecords: 0, consecutiveDays: 0 });
    }

    setupTabs();
    setupAddRecord();
    setupBudget();
    setupExport();
    switchTab('island');
  }

  // ── Tabs ──
  function setupTabs() {
    $$('.tab-item').forEach(el => el.addEventListener('click', () => switchTab(el.dataset.tab)));
    $('#fab-add').addEventListener('click', () => openAddModal());
    $('#modal-close').addEventListener('click', () => closeAddModal());
    $('#add-submit').addEventListener('click', () => submitRecord());
    setupNumberPad();
  }

  function switchTab(tab) {
    currentTab = tab;
    $$('.tab-item').forEach(el => el.classList.toggle('active', el.dataset.tab === tab));
    $$('.page').forEach(el => el.classList.toggle('active', el.id === 'page-' + tab));
    if (tab === 'island') renderIsland();
    if (tab === 'stats') renderStats();
    if (tab === 'records') renderRecords();
    if (tab === 'profile') renderProfile();
  }

  // ── Add Record Modal ──
  function openAddModal() {
    const now = new Date();
    $('#add-type').value = 'expense';
    $('#add-amount').value = '';
    $('#add-cat-l1').value = '';
    $('#add-cat-l2').value = '';
    $('#add-date').value = now.toISOString().slice(0, 10);
    $('#add-time').value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    $('#add-note').value = '';
    $('#modal-overlay').classList.add('show');
    renderCategoryPicker();
    document.querySelector('#add-amount').focus();
  }

  function closeAddModal() { $('#modal-overlay').classList.remove('show'); }

  function setupNumberPad() {
    $$('.numpad-key').forEach(k => k.addEventListener('click', () => {
      const d = k.dataset.key;
      const inp = $('#add-amount');
      if (d === 'del') inp.value = inp.value.slice(0, -1);
      else if (d === '.') { if (!inp.value.includes('.')) inp.value += d; }
      else inp.value = inp.value === '0' ? d : inp.value + d;
    }));
  }

  function renderCategoryPicker() {
    const type = $('#add-type').value;
    const cats = categoriesData[type] || [];
    const grid = $('#cat-grid');
    grid.innerHTML = cats.map((c, i) =>
      `<div class="cat-btn" data-idx="${i}" data-id="${c.id}"><span class="cat-emoji">${getCatEmoji(c.id)}</span><span>${c.name}</span></div>`
    ).join('');

    grid.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        const idx = parseInt(btn.dataset.idx);
        $('#add-cat-l1').value = btn.dataset.id;
        const subDiv = $('#subcat-list');
        const children = cats[idx].children;
        subDiv.innerHTML = children.map(s =>
          `<div class="subcat-btn" data-id="${s.id}">${s.name}</div>`
        ).join('');
        subDiv.classList.add('show');
        subDiv.querySelectorAll('.subcat-btn').forEach(sb => sb.addEventListener('click', () => {
          subDiv.querySelectorAll('.subcat-btn').forEach(b => b.classList.remove('sel'));
          sb.classList.add('sel');
          $('#add-cat-l2').value = sb.dataset.id;
        }));
      });
    });
  }

  $('#add-type').addEventListener('change', renderCategoryPicker);

  function submitRecord() {
    const amount = parseFloat($('#add-amount').value);
    const catL1 = $('#add-cat-l1').value;
    const catL2 = $('#add-cat-l2').value;
    if (!amount || amount <= 0) return alert('请输入金额');
    if (!catL1 || !catL2) return alert('请选择分类');

    const bill = {
      type: $('#add-type').value,
      amount: Math.round(amount * 100),
      categoryL1: catL1,
      categoryL2: catL2,
      date: $('#add-date').value,
      timestamp: new Date($('#add-date').value + 'T' + $('#add-time').value + ':00').getTime(),
      note: $('#add-note').value.trim(),
    };
    DB.saveBill(bill);

    // Update user stats
    const user = DB.getUser() || {};
    user.totalRecords = (user.totalRecords || 0) + 1;
    const today = new Date().toISOString().slice(0, 10);
    const todayBills = DB.getBillsByDateRange(today, today);
    if (todayBills.length <= 2) { user.consecutiveDays = (user.consecutiveDays || 0) + 1; }
    DB.saveUser(user);

    closeAddModal();
    switchTab(currentTab); // refresh
  }

  // ── Island Page ──
  function renderIsland() {
    const user = DB.getUser() || {};
    const petId = user.currentPet || 'fat-cat';
    const pet = PetUtils.getById(petId) || { name: '胖猫', id: 'fat-cat' };
    const stage = PetUtils.getStage(user.totalRecords || 0);
    const today = new Date().toISOString().slice(0, 10);
    const bills = DB.getBillsByDateRange(today, today);
    const stats = StatsUtils.daily(bills, today);
    const budget = DB.getBudget();
    const budgetPct = budget ? BudgetUtils.progress(stats.totalExpense, budget.totalBudget) : 0;
    const mood = PetUtils.getMood(budgetPct);

    // Pet area
    $('#pet-name').textContent = pet.name;
    $('#pet-stage').textContent = stage === 'baby' ? '宝宝' : stage === 'young' ? '幼年' : '成年';
    $('#pet-stage').className = 'stage-badge stage-' + stage;
    $('#pet-mood').textContent = PetUtils.getMoodEmoji(mood);

    // Pet circle background
    const petColors = { 'fat-cat': '#FF8C5A', 'round-bear': '#8B4513', 'soft-bunny': '#FFB6C1', 'mochi': '#FFF', 'dino': '#228B22', 'fat-bird': '#87CEEB', 'seal': '#808080', 'cream-fox': '#FFDAB9', 'shiba': '#FF8C00', 'hamster': '#D2691E', 'hippo': '#9370DB', 'penguin': '#4169E1' };
    $('#pet-circle').style.background = petColors[petId] || '#FF6B8A';

    // Today stats
    $('#today-expense').textContent = (stats.totalExpense / 100).toFixed(2);
    $('#today-income').textContent = (stats.totalIncome / 100).toFixed(2);
    if (budget) {
      $('#today-budget').textContent = budgetPct + '%';
      $('#today-budget').style.display = '';
    } else { $('#today-budget').style.display = 'none'; }

    // Adventure progress
    const now = new Date();
    const totalDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const pct = Math.round(now.getDate() / totalDays * 100);
    $('#adv-progress-bar').style.width = pct + '%';
    $('#adv-progress-text').textContent = pct + '% · 小精灵正在探索中~';

    // Budget ring
    const ringContainer = $('#budget-ring');
    if (budget) {
      ringContainer.style.display = '';
      const ringCanvas = $('#budget-ring-canvas');
      drawBudgetRing(ringCanvas, budgetPct);
    } else { ringContainer.style.display = 'none'; }

    // Recent bills
    const recentDiv = $('#recent-bills');
    if (bills.length === 0) {
      recentDiv.innerHTML = '<div class="empty-hint">今天还没有冒险记录~<br><small>点击下方 + 开始记账吧</small></div>';
    } else {
      recentDiv.innerHTML = bills.slice(0, 5).map(b =>
        `<div class="recent-row"><span>${b.categoryL2}</span><span class="${b.type === 'income' ? 'green' : 'orange'}">${b.type === 'income' ? '+' : '-'}¥${(b.amount / 100).toFixed(2)}</span></div>`
      ).join('');
    }
  }

  function drawBudgetRing(canvas, pct) {
    const ctx = canvas.getContext('2d');
    const size = 120;
    canvas.width = size; canvas.height = size;
    const cx = size / 2, cy = size / 2, r = 45, w = 10;
    ctx.clearRect(0, 0, size, size);
    // bg
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = '#F0F0F0'; ctx.lineWidth = w; ctx.stroke();
    // progress
    const color = pct > 100 ? '#FF4757' : pct >= 80 ? '#FF8C5A' : pct >= 50 ? '#FFE66D' : '#4ECDC4';
    const angle = Math.min(pct, 100) / 100 * Math.PI * 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.stroke();
    // text
    ctx.fillStyle = '#3D3D3D'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(pct + '%', cx, cy + 4);
  }

  // ── Stats Page ──
  function renderStats() {
    $$('.period-tab').forEach(el => el.classList.toggle('active', el.dataset.period === currentPeriod));
    const now = new Date();
    const bills = DB.getBills();
    let stats;

    switch (currentPeriod) {
      case 'day': stats = StatsUtils.daily(bills, now.toISOString().slice(0, 10)); break;
      case 'week': stats = StatsUtils.weekly(bills, now.toISOString().slice(0, 10)); break;
      case 'month': stats = StatsUtils.monthly(bills, `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`); break;
      case 'year': stats = StatsUtils.yearly(bills, String(now.getFullYear())); break;
    }

    $('#stat-expense').textContent = (stats.totalExpense / 100).toFixed(2);
    $('#stat-income').textContent = (stats.totalIncome / 100).toFixed(2);
    const bal = stats.balance;
    $('#stat-balance').textContent = (Math.abs(bal) / 100).toFixed(2);
    $('#stat-balance').className = 'stat-val ' + (bal >= 0 ? 'green' : 'orange');

    // Period-specific view
    const detailDiv = $('#stat-detail');
    if (currentPeriod === 'week') {
      const maxVal = Math.max(...stats.dailyBreakdown.map(d => Math.max(d.expense, d.income)), 1);
      detailDiv.innerHTML = '<div class="bar-chart">' + stats.dailyBreakdown.map((d, i) => {
        const labels = ['一', '二', '三', '四', '五', '六', '日'];
        return `<div class="bar-col"><div class="bar-expense" style="height:${Math.round(d.expense / maxVal * 120)}px"></div><div class="bar-income" style="height:${Math.round(d.income / maxVal * 120)}px"></div><span>${labels[i]}</span></div>`;
      }).join('') + '</div>';
    } else if (currentPeriod === 'year') {
      const maxVal = Math.max(...stats.monthlyBreakdown.map(d => Math.max(d.expense, d.income)), 1);
      detailDiv.innerHTML = '<div class="bar-chart">' + stats.monthlyBreakdown.map((d, i) =>
        `<div class="bar-col"><div class="bar-expense" style="height:${Math.round(d.expense / maxVal * 120)}px"></div><div class="bar-income" style="height:${Math.round(d.income / maxVal * 120)}px"></div><span>${i + 1}月</span></div>`
      ).join('') + '</div>';
    } else {
      detailDiv.innerHTML = '';
    }

    // Category breakdown
    const cats = stats.categoryBreakdown || [];
    const colors = ['#FF8C5A', '#4ECDC4', '#FF6B8A', '#FFE66D', '#FFB347', '#87CEEB', '#B8A9C9', '#FF4757', '#A0A0A0', '#DDA0DD'];
    const maxAmt = Math.max(...cats.map(c => c.amount), 1);
    $('#cat-breakdown').innerHTML = cats.length === 0
      ? '<div class="empty-hint">暂无数据</div>'
      : cats.map((c, i) => `
        <div class="cat-row">
          <span class="cat-rank">#${i + 1}</span>
          <div class="cat-bar-wrap"><div class="cat-bar-fill" style="width:${c.percentage}%;background:${colors[i % colors.length]}20"></div><span class="cat-bar-label">${getCatName(c.category)}</span></div>
          <div class="cat-right"><span>¥${(c.amount / 100).toFixed(2)}</span><span class="cat-pct">${c.percentage}%</span></div>
        </div>
      `).join('');
  }

  $$('.period-tab').forEach(el => el.addEventListener('click', () => { currentPeriod = el.dataset.period; renderStats(); }));

  // ── Records Page ──
  function renderRecords() {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth() + 1;
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
    const bills = DB.getBillsByDateRange(start, end);

    $('#rec-month').textContent = `${year}年${month}月`;

    // Summary
    const te = bills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
    const ti = bills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
    $('#rec-summary').innerHTML = `<span class="orange">支出 ¥${(te / 100).toFixed(2)}</span> <span class="green">收入 ¥${(ti / 100).toFixed(2)}</span>`;

    if (bills.length === 0) {
      $('#rec-list').innerHTML = '<div class="empty-hint">本月暂无记录</div>';
      return;
    }

    // Group by date
    const groups = {};
    bills.forEach(b => {
      if (!groups[b.date]) groups[b.date] = [];
      groups[b.date].push(b);
    });

    $('#rec-list').innerHTML = Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => {
      const d = new Date(date);
      const wd = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
      const de = items.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
      const di = items.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
      return `<div class="rec-group">
        <div class="rec-group-hd"><span>${d.getMonth() + 1}月${d.getDate()}日 周${wd}</span><span>${de > 0 ? '支出 ¥' + (de / 100).toFixed(2) : ''} ${di > 0 ? '收入 ¥' + (di / 100).toFixed(2) : ''}</span></div>
        ${items.map(b => `<div class="rec-item">
          <span class="cat-emoji small">${getCatEmoji(b.categoryL1)}</span>
          <span>${b.categoryL2}${b.note ? ' · ' + b.note : ''}</span>
          <span class="${b.type === 'income' ? 'green' : 'orange'} ml-auto">${b.type === 'income' ? '+' : '-'}¥${(b.amount / 100).toFixed(2)}</span>
          <span class="rec-del" data-id="${b._id}">×</span>
        </div>`).join('')}
      </div>`;
    }).join('');

    // Delete handlers
    $$('.rec-del').forEach(el => el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('确认删除？')) { DB.deleteBill(el.dataset.id); renderRecords(); }
    }));
  }

  // Month navigation
  let recOffset = 0;
  $('#rec-prev').addEventListener('click', () => { recOffset--; renderRecordsWithOffset(); });
  $('#rec-next').addEventListener('click', () => { recOffset++; renderRecordsWithOffset(); });

  function renderRecordsWithOffset() {
    const d = new Date(); d.setMonth(d.getMonth() + recOffset);
    const y = d.getFullYear(), m = d.getMonth() + 1;
    const start = `${y}-${String(m).padStart(2, '0')}-01`;
    const end = `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
    const bills = DB.getBillsByDateRange(start, end);
    $('#rec-month').textContent = `${y}年${m}月`;
    const te = bills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
    const ti = bills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);
    $('#rec-summary').innerHTML = `<span class="orange">支出 ¥${(te / 100).toFixed(2)}</span> <span class="green">收入 ¥${(ti / 100).toFixed(2)}</span>`;
    renderGroupedList(bills);
  }

  function renderGroupedList(bills) {
    const groups = {};
    bills.forEach(b => { if (!groups[b.date]) groups[b.date] = []; groups[b.date].push(b); });
    if (bills.length === 0) { $('#rec-list').innerHTML = '<div class="empty-hint">本月暂无记录</div>'; return; }
    $('#rec-list').innerHTML = Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => {
      const d = new Date(date);
      const wd = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
      return `<div class="rec-group"><div class="rec-group-hd"><span>${d.getMonth() + 1}月${d.getDate()}日 周${wd}</span></div>
        ${items.map(b => `<div class="rec-item"><span>${b.categoryL2}</span><span class="${b.type === 'income' ? 'green' : 'orange'} ml-auto">${b.type === 'income' ? '+' : '-'}¥${(b.amount / 100).toFixed(2)}</span><span class="rec-del" data-id="${b._id}">×</span></div>`).join('')}
      </div>`;
    }).join('');
    $$('.rec-del').forEach(el => el.addEventListener('click', (e) => { e.stopPropagation(); if (confirm('确认删除？')) { DB.deleteBill(el.dataset.id); renderRecordsWithOffset(); } }));
  }

  // ── Profile Page ──
  function renderProfile() {
    const user = DB.getUser() || {};
    $('#prof-days').textContent = user.consecutiveDays || 0;
    $('#prof-records').textContent = user.totalRecords || 0;

    // Achievements
    const achievements = [
      { id: 'first', name: '初次冒险', cond: user.totalRecords >= 1 },
      { id: 'streak7', name: '坚持不懈', cond: user.consecutiveDays >= 7 },
      { id: 'streak30', name: '月度勇士', cond: user.consecutiveDays >= 30 },
      { id: 'rec100', name: '百记达人', cond: user.totalRecords >= 100 },
      { id: 'rec1000', name: '记账大师', cond: user.totalRecords >= 1000 },
      { id: 'budget', name: '预算管家', cond: false },
    ];
    $('#achieve-grid').innerHTML = achievements.map(a =>
      `<div class="achieve-item ${a.cond ? 'unlocked' : ''}"><span>${a.cond ? '🌟' : '🔒'}</span><span>${a.name}</span></div>`
    ).join('');
  }

  // ── Budget Setup ──
  function setupBudget() {
    const budget = DB.getBudget();
    if (budget) {
      $('#budget-period').value = budget.period || 'monthly';
      $('#budget-total').value = budget.totalBudget > 0 ? (budget.totalBudget / 100).toFixed(0) : '';
      renderBudgetCats(budget.categoryBudgets || {});
    }
    $('#budget-save').addEventListener('click', () => {
      const catBudgets = {};
      $$('.budget-cat-input').forEach(inp => {
        const v = parseFloat(inp.value);
        if (v > 0) catBudgets[inp.dataset.cat] = Math.round(v * 100);
      });
      DB.saveBudget({
        period: $('#budget-period').value,
        totalBudget: Math.round(parseFloat($('#budget-total').value || '0') * 100),
        categoryBudgets: catBudgets,
      });
      alert('预算已保存！');
      const budgetModal = document.getElementById('budget-modal');
      if (budgetModal) budgetModal.style.display = 'none';
      switchTab('island');
    });
    $('#budget-close').addEventListener('click', () => {
      document.getElementById('budget-modal').style.display = 'none';
    });
  }

  function renderBudgetCats(catBudgets) {
    const cats = categoriesData.expense || [];
    const div = $('#budget-cats');
    div.innerHTML = cats.map(c =>
      `<div class="budget-cat-row"><span>${c.name}</span><input class="budget-cat-input" type="number" data-cat="${c.id}" placeholder="不限" value="${(catBudgets[c.id] || 0) > 0 ? (catBudgets[c.id] / 100).toFixed(0) : ''}" step="10" min="0"></div>`
    ).join('');
  }

  // ── Export/Import ──
  function setupExport() {
    $('#btn-export').addEventListener('click', () => {
      const data = DB.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `pet-adventure-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
    $('#btn-import').addEventListener('click', () => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
      inp.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            DB.importAll(data);
            alert('数据导入成功！');
            switchTab('island');
          } catch (err) { alert('导入失败：文件格式不正确'); }
        };
        reader.readAsText(file);
      };
      inp.click();
    });
    $('#btn-budget-page').addEventListener('click', () => {
      const modal = document.getElementById('budget-modal');
      modal.style.display = 'flex';
      const budget = DB.getBudget() || {};
      $('#budget-period').value = budget.period || 'monthly';
      $('#budget-total').value = budget.totalBudget > 0 ? (budget.totalBudget / 100).toFixed(0) : '';
      renderBudgetCats(budget.categoryBudgets || {});
    });
  }

  // ── Helpers ──
  function getCatEmoji(id) {
    const map = { food: '🍔', transport: '🚗', shopping: '🛒', housing: '🏠', entertainment: '🎮', medical: '💊', education: '📚', social: '🎁', pet: '🐱', other: '📦', salary: '💼', 'side-job': '💻', investment: '📈', refund: '↩️', 'gift-money': '🎁', 'income-other': '📦' };
    return map[id] || '📋';
  }

  function getCatName(id) {
    const allCats = [...(categoriesData.expense || []), ...(categoriesData.income || [])];
    const found = allCats.find(c => c.id === id);
    return found ? found.name : id;
  }

  // ── PWA Install Prompt ──
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const promptEl = document.getElementById('install-prompt');
    if (promptEl) promptEl.style.display = '';
  });
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-install');
    if (btn) btn.addEventListener('click', async () => {
      if (!deferredPrompt) { alert('安装功能暂时不可用，请通过浏览器菜单「添加到主屏幕」'); return; }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') { document.getElementById('install-prompt').style.display = 'none'; }
      deferredPrompt = null;
    });
  });

  // ── Backup tracking ──
  function updateBackupStatus() {
    const lastBackup = localStorage.getItem('lastBackup');
    const el = document.getElementById('last-backup');
    if (el) el.textContent = lastBackup || '从未';
    // Remind if more than 7 days
    const hint = document.getElementById('backup-hint');
    if (hint) {
      if (!lastBackup || Date.now() - new Date(lastBackup).getTime() > 7 * 86400000) {
        hint.classList.add('warn');
      } else { hint.classList.remove('warn'); }
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    updateBackupStatus();
    const qe = document.getElementById('btn-quick-export');
    if (qe) qe.addEventListener('click', () => {
      const data = DB.exportAll();
      localStorage.setItem('lastBackup', new Date().toISOString());
      updateBackupStatus();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `pet-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      URL.revokeObjectURL(url);
    });
  });

  // ── Start ──
  document.addEventListener('DOMContentLoaded', init);

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      console.log('SW registered:', reg.scope);
    }).catch(err => {
      console.warn('SW registration failed:', err);
    });
  }
})();
