# 钱罐小精灵 — 架构文档

## 一、系统概览

```
┌─────────────────────────────────────────────────┐
│                   微信小程序                      │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │  小岛页   │  统计页   │  记录页   │  我的页   │  │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┘  │
│       │          │          │          │         │
│  ┌────┴──────────┴──────────┴──────────┴────┐   │
│  │            工具层 (utils/)                 │   │
│  │  stats  │ budget │  pet  │ adventure │ db │   │
│  └──────────────────┬───────────────────────┘   │
│                     │                            │
│              ┌──────┴──────┐                     │
│              │  云开发 SDK   │                     │
│              └──────┬──────┘                     │
└─────────────────────┼───────────────────────────┘
                      │
┌─────────────────────┼───────────────────────────┐
│              微信云开发                           │
│  ┌──────────┬──────────┬──────────┬──────────┐  │
│  │ 云数据库  │  云函数   │  云存储   │  定时触发  │  │
│  │ MongoDB  │ Node.js  │  图片CDN  │  cron     │  │
│  └──────────┴──────────┴──────────┴──────────┘  │
└─────────────────────────────────────────────────┘
```

**一句话架构**：微信原生小程序 + 云开发（数据库/云函数/存储），纯前端工具函数层做业务逻辑，不设独立后端服务。

---

## 二、技术栈

| 层 | 选型 | 说明 |
|---|------|------|
| 前端框架 | 微信原生小程序 | 无需跨端框架，性能最优 |
| 后端 | 微信云开发 | 免服务器，免费额度，含数据库+云函数+存储 |
| 数据库 | 云开发数据库（MongoDB 文档型）| 内置于云开发，schema-free |
| 云函数 | Node.js | 定时任务（月度冒险日记生成）|
| 测试 | Jest | 45 个工具函数单元测试，TDD 开发 |
| 静态数据 | 本地 JSON | 精灵/主题/分类定义，随代码版本管理 |

---

## 三、目录结构

```
pet-adventure-app/
├── miniprogram/                # 小程序根目录
│   ├── app.js                  # 入口：云开发初始化，全局数据
│   ├── app.json                # 路由 + 窗口 + TabBar 配置
│   ├── app.wxss                # 全局样式 + CSS 变量
│   │
│   ├── pages/                  # 页面（每个页面 4 文件：js/wxml/wxss/json）
│   │   ├── island/             # 小岛首页 — 精灵互动 + 今日概览
│   │   ├── statistics/         # 统计页 — 日/周/月/年统计 + 图表
│   │   ├── records/            # 记录列表 — 账单浏览 + 筛选 + 删除
│   │   ├── profile/            # 我的 — 菜单 + 成就 + 数据导出
│   │   ├── add-record/         # 记账弹窗 — 数字键盘 + 分类选择
│   │   ├── budget/             # 预算设置 — 总预算 + 分类预算
│   │   ├── adventure-diary/    # 冒险日记 — 月度回顾故事
│   │   ├── collection/         # 精灵收藏馆 — 精灵/皮肤/配饰
│   │   └── category-mgmt/      # 分类管理
│   │
│   ├── components/             # 可复用组件
│   │   ├── budget-ring/        # 预算进度环（SVG 环形图）
│   │   └── category-picker/    # 两级分类选择器
│   │
│   ├── utils/                  # 核心业务逻辑（纯函数，可 Jest 测试）
│   │   ├── db.js               # 云数据库 CRUD 封装
│   │   ├── stats.js            # 日/周/月/年统计计算
│   │   ├── budget.js           # 预算进度 + 预警级别
│   │   ├── pet.js              # 精灵数据查询 + 解锁 + 心情
│   │   └── adventure.js        # 冒险动作映射 + 故事生成
│   │
│   ├── data/                   # 静态配置数据（JSON）
│   │   ├── categories.json     # 16 个一级分类 + 60 个二级分类
│   │   ├── pets.json           # 12 基础 + 12 稀有精灵定义
│   │   └── themes.json         # 20 常驻 + 10 节日主题定义
│   │
│   ├── assets/                 # 素材资源
│   │   ├── icons/              # Tab 图标（8 个）+ 分类图标（16 个）
│   │   └── sprites/            # 精灵占位图（100+ 个）
│   │
│   └── tests/                  # Jest 测试
│       └── utils/              # 4 个测试套件，45 个测试用例
│
├── cloudfunctions/
│   └── generateAdventure/      # 月度冒险日记生成（每月1日 9:00 触发）
│
├── scripts/
│   └── generate_assets.py      # 素材占位图生成脚本
│
└── README.md
```

---

## 四、数据模型

### 云数据库集合

**bills（账单）**
```
{
  _openid: string,        // 用户 ID（云开发自动注入）
  type: 'expense'|'income',
  amount: number,         // 金额，单位：分（整数）
  categoryL1: string,     // 一级分类 ID，如 'food'
  categoryL2: string,     // 二级分类 ID，如 'breakfast'
  date: string,           // 日期 'YYYY-MM-DD'
  timestamp: number,      // Unix 毫秒时间戳
  note: string,           // 备注
  createdAt: Date         // 服务端创建时间
}
```

**budgets（预算）**
```
{
  _openid: string,
  period: 'monthly'|'weekly',
  totalBudget: number,        // 总预算（分）
  categoryBudgets: {          // 分类预算
    food: 50000,              // 餐饮 500 元
    transport: 20000,         // 交通 200 元
    ...
  }
}
```

**users（用户）**
```
{
  _openid: string,
  currentPet: string,           // 当前精灵 ID
  currentTheme: string,         // 当前主题 ID
  unlockedPets: string[],       // 已解锁精灵列表
  unlockedThemes: string[],     // 已解锁主题列表
  unlockedSkins: string[],      // 已解锁配色列表
  unlockedAccessories: string[],// 已解锁配饰列表
  consecutiveDays: number,      // 连续记账天数
  totalRecords: number,         // 累计记账笔数
}
```

**adventures（冒险日记）**
```
{
  _openid: string,
  month: string,            // 'YYYY-MM'
  themeId: string,          // 主题 ID
  totalExpense: number,     // 月支出（分）
  totalIncome: number,      // 月收入（分）
  topCategory: string,      // 支出最多的分类
  topCategoryAmount: number,
  recordDays: number,       // 记账天数
  totalRecords: number,     // 记账笔数
}
```

### 本地静态数据

| 文件 | 内容 |
|------|------|
| `data/categories.json` | 支出 10 大类 42 细分 + 收入 6 大类 18 细分，含图标色值、冒险动作映射 |
| `data/pets.json` | 24 只精灵（12 基础 + 12 稀有），含解锁条件、成长阶段、配色方案 |
| `data/themes.json` | 30 个主题（20 常驻 + 10 节日），含配色方案、解锁条件 |

---

## 五、核心模块职责

### utils/stats.js
- `calculateDailyStats(bills, date)` — 日统计：收支结余 + 分类排行
- `calculateWeeklyStats(bills, date)` — 周统计：7 天柱状 + 分类饼图
- `calculateMonthlyStats(bills, month)` — 月统计：月度总览 + 热力图
- `calculateYearlyStats(bills, year)` — 年统计：12 月趋势 + TOP 排行
- `groupByCategory(bills)` — 分类聚合，含金额和百分比

### utils/budget.js
- `calculateBudgetProgress(spent, budget)` — 预算使用百分比
- `getBudgetWarningLevel(percentage)` — 四级预警：safe / half / warning / critical / over
- `checkCategoryBudget(spending, budgets)` — 逐分类检查，返回告警列表

### utils/pet.js
- `getPetById(id)` — 查询精灵定义
- `getPetStage(totalDays)` — 成长阶段：baby (0-30) → young (31-90) → adult (91+)
- `checkPetUnlock(petId, userStats)` — 判断解锁条件（记账笔数/连续天数/节日）
- `getPetMood(budgetPct)` — 心情：happy → neutral → worried → sad

### utils/adventure.js
- `getAdventureAction(categoryId)` — 分类 → 冒险动作映射
- `generateMonthStory(data)` — 生成月度冒险故事（标题 + 章节 + 总结）
- `getCurrentFestivalTheme(date)` — 判断当前是否有节日限定主题

### utils/db.js
- `addBill()` / `getBillsByDateRange()` / `deleteBill()` / `updateBill()`
- `getBudget()` / `saveBudget()` — 预算单例读写
- `getUser()` / `updateUser()` — 用户数据单例读写
- `getAdventure()` / `saveAdventure()` — 冒险日记按月读写

---

## 六、页面路由 & 导航

```
TabBar（4 个常驻 Tab）
├── 小岛  → pages/island/island          （首页）
├── 统计  → pages/statistics/statistics  （二级）
├── 记录  → pages/records/records        （三级）
└── 我的  → pages/profile/profile        （四级）

悬浮按钮
└── +   → pages/add-record/add-record    （半屏弹窗）

我的 → 子页面
├── 精灵收藏馆  → pages/collection/collection
├── 冒险相册    → pages/adventure-diary/adventure-diary
├── 预算设置    → pages/budget/budget
└── 分类管理    → pages/category-mgmt/category-mgmt
```

---

## 七、数据流

```
记账流程:
  用户输入金额+选分类 → add-record.js
    → db.addBill() → 云数据库 bills 集合
    → 返回上一页 → onShow() 刷新数据

统计流程:
  用户切换日/周/月/年 → statistics.js
    → db.getBillsByDateRange() → 云数据库
    → stats.js 计算统计 → 页面渲染

预算流程:
  用户设置预算 → budget.js
    → db.saveBudget() → 云数据库 budgets 集合
    → 各页面读取 → budget.js 计算进度 → budget-ring 组件渲染

冒险日记:
  每月1日 9:00 → 云函数 generateAdventure 触发
    → 遍历所有用户 → 聚合上月账单 → 写入 adventures 集合
    → 用户打开冒险日记页 → db.getAdventure() → adventure.js 生成故事

精灵解锁:
  记账后 → 更新 users 集合 totalRecords/consecutiveDays
    → pet.js checkPetUnlock() → 达标则解锁新精灵
```

---

## 八、测试策略

```
类型           工具        覆盖范围               数量
─────────────────────────────────────────────────────
单元测试       Jest        utils/*.js            4 套件 45 用例
组件测试       开发者工具   components/*          运行时验证
页面集成       开发者工具   pages/*               手动/真机测试
云函数测试     云开发控制台  generateAdventure     手动触发验证
```

测试关注点：
- 统计计算：边界值（空数据、单日、跨月年份）
- 预算预警：四级阈值精确触发
- 精灵逻辑：解锁条件判断、阶段计算
- 冒险生成：空月、有结余、超支三种场景

---

## 九、配色系统

```
用途         变量名          色值
──────────────────────────────────
主色（草莓粉） --primary       #FF6B8A
收入（薄荷绿） --income        #4ECDC4
支出（蜜橘橙） --expense       #FF8C5A
背景（奶油白） --bg            #FFF8F0
卡片白         --card          #FFFFFF
强调（柠檬黄） --accent        #FFE66D
警告红         --danger        #FF4757
文字主色       --text          #3D3D3D
文字次要       --text-secondary #A0A0A0
```

所有颜色通过 `app.wxss` 的 CSS 自定义属性全局注入，组件和页面通过 `var(--xxx)` 引用，主题切换时只需替换根变量值。
