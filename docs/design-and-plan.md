# 宠物冒险记账 — 头脑风暴 & 设计 & 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一款以「宠物养成 + 冒险故事」为核心玩法的微信记账小程序，Q 版卡通风格，糖果色配色。

**Architecture:** 微信原生小程序 + 微信云开发（云数据库 + 云函数 + 云存储）。静态数据（精灵/主题/分类）用本地 JSON 管理，动态数据（账单/预算/用户）存云数据库。TDD 开发：Jest 测工具函数，miniprogram-simulate 测组件。

**Tech Stack:** 微信原生框架、微信云开发 (MongoDB)、Jest、miniprogram-simulate、Canvas (图表)

**TDD 铁律：** NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST. 每个功能先写测试，看它失败，再写最小实现，看它通过，最后重构。

---

## 文件结构总览

```
miniprogram/
├── pages/
│   ├── island/          # 小岛首页（精灵互动）
│   ├── statistics/      # 统计页（日/周/月/年）
│   ├── records/         # 记录列表
│   ├── profile/         # 我的
│   ├── add-record/      # 记账弹窗
│   ├── budget/          # 预算设置
│   ├── adventure-diary/ # 冒险日记
│   ├── collection/      # 精灵收藏馆
│   └── category-mgmt/   # 分类管理
├── components/
│   ├── pet-sprite/      # 精灵动画组件
│   ├── stat-chart/      # 统计图表组件
│   ├── calendar-heat/   # 日历热力图
│   ├── budget-ring/     # 预算进度环
│   ├── category-picker/ # 分类选择器
│   └── adventure-card/  # 冒险日记卡片
├── utils/
│   ├── db.js            # 云数据库封装
│   ├── stats.js         # 统计计算
│   ├── adventure.js     # 冒险主题/故事生成
│   ├── pet.js           # 精灵数据逻辑
│   └── budget.js        # 预算计算
├── data/
│   ├── categories.json  # 分类定义
│   ├── pets.json        # 精灵定义
│   ├── themes.json      # 主题定义
│   ├── accessories.json # 配饰定义
│   └── adventures.json  # 冒险故事模板
├── assets/
│   └── sprites/         # 精灵+主题+图标素材
├── app.js / app.json / app.wxss
└── tests/
    ├── utils/
    │   ├── stats.test.js
    │   ├── pet.test.js
    │   ├── adventure.test.js
    │   └── budget.test.js
    └── components/
        ├── budget-ring.test.js
        ├── stat-chart.test.js
        └── category-picker.test.js
```

---

## Phase 0: 项目脚手架

### Task 0.1: 创建微信小程序项目

**Files:**
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/project.config.json`
- Create: `miniprogram/package.json`

- [ ] **Step 1: 初始化项目结构**

```bash
mkdir -p miniprogram/pages/island miniprogram/pages/statistics miniprogram/pages/records miniprogram/pages/profile miniprogram/pages/add-record miniprogram/pages/budget miniprogram/pages/adventure-diary miniprogram/pages/collection miniprogram/pages/category-mgmt
mkdir -p miniprogram/components/pet-sprite miniprogram/components/stat-chart miniprogram/components/calendar-heat miniprogram/components/budget-ring miniprogram/components/category-picker miniprogram/components/adventure-card
mkdir -p miniprogram/utils miniprogram/data miniprogram/assets/sprites miniprogram/tests/utils miniprogram/tests/components
mkdir -p cloudfunctions
```

- [ ] **Step 2: 编写 app.json**

```json
{
  "pages": [
    "pages/island/island",
    "pages/statistics/statistics",
    "pages/records/records",
    "pages/profile/profile",
    "pages/add-record/add-record",
    "pages/budget/budget",
    "pages/adventure-diary/adventure-diary",
    "pages/collection/collection",
    "pages/category-mgmt/category-mgmt"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#FF6B8A",
    "navigationBarTitleText": "钱罐小精灵",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#FFF8F0"
  },
  "tabBar": {
    "color": "#A0A0A0",
    "selectedColor": "#FF6B8A",
    "backgroundColor": "#FFFFFF",
    "borderStyle": "white",
    "list": [
      {
        "pagePath": "pages/island/island",
        "text": "小岛",
        "iconPath": "assets/icons/island.png",
        "selectedIconPath": "assets/icons/island-active.png"
      },
      {
        "pagePath": "pages/statistics/statistics",
        "text": "统计",
        "iconPath": "assets/icons/stats.png",
        "selectedIconPath": "assets/icons/stats-active.png"
      },
      {
        "pagePath": "pages/records/records",
        "text": "记录",
        "iconPath": "assets/icons/records.png",
        "selectedIconPath": "assets/icons/records-active.png"
      },
      {
        "pagePath": "pages/profile/profile",
        "text": "我的",
        "iconPath": "assets/icons/profile.png",
        "selectedIconPath": "assets/icons/profile-active.png"
      }
    ]
  },
  "cloud": true
}
```

- [ ] **Step 3: 编写 app.js**

```javascript
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-env-id',
        traceUser: true,
      });
    }
  },
  globalData: {
    userInfo: null,
    currentPet: 'fat-cat',
    currentTheme: 'candy-kingdom',
  }
});
```

- [ ] **Step 4: 编写 app.wxss**

```css
page {
  --primary: #FF6B8A;
  --income: #4ECDC4;
  --expense: #FF8C5A;
  --bg: #FFF8F0;
  --card: #FFFFFF;
  --accent: #FFE66D;
  --danger: #FF4757;
  --text: #3D3D3D;
  --text-secondary: #A0A0A0;

  background-color: var(--bg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  font-size: 28rpx;
}

.card {
  background: var(--card);
  border-radius: 24rpx;
  padding: 24rpx;
  margin: 16rpx 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 138, 0.1);
}

.btn-primary {
  background: var(--primary);
  color: #fff;
  border-radius: 48rpx;
  border: none;
  font-size: 32rpx;
  font-weight: bold;
}
```

- [ ] **Step 5: 安装测试依赖**

```bash
cd miniprogram
npm init -y
npm install --save-dev jest @types/jest
```

- [ ] **Step 6: 配置 Jest 并验证**

创建 `miniprogram/jest.config.js`:
```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
};
```

Run: `npx jest --passWithNoTests`
Expected: PASS (no tests yet)

- [ ] **Step 7: 初始化 Git 并提交**

```bash
cd miniprogram
git init
git add -A
git commit -m "chore: init WeChat mini program scaffold"
```

---

## Phase 1: 静态数据文件

### Task 1.1: 分类数据文件

**Files:**
- Create: `miniprogram/data/categories.json`

- [ ] **Step 1: 编写分类数据文件**

```json
{
  "expense": [
    {
      "id": "food",
      "name": "餐饮",
      "icon": "food",
      "color": "#FF8C5A",
      "adventureAction": "explore_food",
      "children": [
        { "id": "breakfast", "name": "早餐", "icon": "breakfast" },
        { "id": "lunch", "name": "午餐", "icon": "lunch" },
        { "id": "dinner", "name": "晚餐", "icon": "dinner" },
        { "id": "snack", "name": "零食", "icon": "snack" },
        { "id": "takeout", "name": "外卖", "icon": "takeout" },
        { "id": "fruit", "name": "水果", "icon": "fruit" },
        { "id": "drink", "name": "饮品奶茶", "icon": "drink" },
        { "id": "party", "name": "聚餐", "icon": "party" }
      ]
    },
    {
      "id": "transport",
      "name": "交通",
      "icon": "transport",
      "color": "#4ECDC4",
      "adventureAction": "travel",
      "children": [
        { "id": "bus", "name": "公交", "icon": "bus" },
        { "id": "subway", "name": "地铁", "icon": "subway" },
        { "id": "taxi", "name": "打车", "icon": "taxi" },
        { "id": "gas", "name": "加油", "icon": "gas" },
        { "id": "parking", "name": "停车", "icon": "parking" },
        { "id": "train", "name": "火车高铁", "icon": "train" },
        { "id": "flight", "name": "飞机", "icon": "flight" },
        { "id": "bike", "name": "共享单车", "icon": "bike" }
      ]
    },
    {
      "id": "shopping",
      "name": "购物",
      "icon": "shopping",
      "color": "#FF6B8A",
      "adventureAction": "treasure_hunt",
      "children": [
        { "id": "clothes", "name": "服饰鞋包", "icon": "clothes" },
        { "id": "electronics", "name": "电子数码", "icon": "electronics" },
        { "id": "home", "name": "家居日用", "icon": "home" },
        { "id": "beauty", "name": "美妆护肤", "icon": "beauty" },
        { "id": "pet-supplies", "name": "宠物用品", "icon": "pet-supplies" },
        { "id": "stationery", "name": "办公文具", "icon": "stationery" }
      ]
    },
    {
      "id": "housing",
      "name": "居住",
      "icon": "housing",
      "color": "#A0A0A0",
      "adventureAction": "build_home",
      "children": [
        { "id": "rent", "name": "房租", "icon": "rent" },
        { "id": "utilities", "name": "水电燃气", "icon": "utilities" },
        { "id": "property", "name": "物业费", "icon": "property" },
        { "id": "internet", "name": "网费话费", "icon": "internet" },
        { "id": "repair", "name": "家居维修", "icon": "repair" },
        { "id": "daily", "name": "日用品", "icon": "daily" }
      ]
    },
    {
      "id": "entertainment",
      "name": "娱乐",
      "icon": "entertainment",
      "color": "#FFE66D",
      "adventureAction": "have_fun",
      "children": [
        { "id": "movie", "name": "电影", "icon": "movie" },
        { "id": "game", "name": "游戏", "icon": "game" },
        { "id": "vip", "name": "视频会员", "icon": "vip" },
        { "id": "ktv", "name": "KTV", "icon": "ktv" },
        { "id": "travel", "name": "旅游出行", "icon": "travel" },
        { "id": "fitness", "name": "运动健身", "icon": "fitness" }
      ]
    },
    {
      "id": "medical",
      "name": "医疗",
      "icon": "medical",
      "color": "#FF4757",
      "adventureAction": "heal",
      "children": [
        { "id": "clinic", "name": "门诊", "icon": "clinic" },
        { "id": "medicine", "name": "买药", "icon": "medicine" },
        { "id": "checkup", "name": "体检", "icon": "checkup" },
        { "id": "dental", "name": "牙科", "icon": "dental" },
        { "id": "hospital", "name": "住院", "icon": "hospital" }
      ]
    },
    {
      "id": "education",
      "name": "教育",
      "icon": "education",
      "color": "#B8A9C9",
      "adventureAction": "learn",
      "children": [
        { "id": "online-course", "name": "线上课程", "icon": "online-course" },
        { "id": "offline-course", "name": "线下培训", "icon": "offline-course" },
        { "id": "books", "name": "书籍资料", "icon": "books" },
        { "id": "exam", "name": "考试报名", "icon": "exam" }
      ]
    },
    {
      "id": "social",
      "name": "人情",
      "icon": "social",
      "color": "#FFB347",
      "adventureAction": "gift",
      "children": [
        { "id": "gift", "name": "送礼", "icon": "gift" },
        { "id": "red-packet", "name": "红包", "icon": "red-packet" },
        { "id": "treat", "name": "请客", "icon": "treat" },
        { "id": "wedding", "name": "婚礼份子", "icon": "wedding" },
        { "id": "parents", "name": "孝敬父母", "icon": "parents" }
      ]
    },
    {
      "id": "pet",
      "name": "宠物",
      "icon": "pet",
      "color": "#87CEEB",
      "adventureAction": "care_pet",
      "children": [
        { "id": "pet-food", "name": "主粮", "icon": "pet-food" },
        { "id": "pet-snack", "name": "零食", "icon": "pet-snack" },
        { "id": "pet-toy", "name": "玩具", "icon": "pet-toy" },
        { "id": "pet-medical", "name": "医疗", "icon": "pet-medical" },
        { "id": "pet-grooming", "name": "洗护美容", "icon": "pet-grooming" }
      ]
    },
    {
      "id": "other",
      "name": "其他",
      "icon": "other",
      "color": "#D3D3D3",
      "adventureAction": "misc",
      "children": [
        { "id": "shipping", "name": "快递运费", "icon": "shipping" },
        { "id": "fix", "name": "维修", "icon": "fix" },
        { "id": "fine", "name": "罚款", "icon": "fine" },
        { "id": "misc", "name": "其他杂项", "icon": "misc" }
      ]
    }
  ],
  "income": [
    {
      "id": "salary",
      "name": "工资",
      "icon": "salary",
      "color": "#4ECDC4",
      "adventureAction": "gold_mine",
      "children": [
        { "id": "monthly", "name": "月薪", "icon": "monthly" },
        { "id": "bonus", "name": "奖金", "icon": "bonus" },
        { "id": "allowance", "name": "津贴补贴", "icon": "allowance" },
        { "id": "year-end", "name": "年终奖", "icon": "year-end" }
      ]
    },
    {
      "id": "side-job",
      "name": "兼职",
      "icon": "side-job",
      "color": "#87CEEB",
      "adventureAction": "side_quest",
      "children": [
        { "id": "freelance", "name": "副业外快", "icon": "freelance" },
        { "id": "writing", "name": "稿费版税", "icon": "writing" },
        { "id": "design", "name": "设计接单", "icon": "design" },
        { "id": "consulting", "name": "顾问咨询", "icon": "consulting" }
      ]
    },
    {
      "id": "investment",
      "name": "理财",
      "icon": "investment",
      "color": "#FFE66D",
      "adventureAction": "golden_tree",
      "children": [
        { "id": "interest", "name": "利息", "icon": "interest" },
        { "id": "fund", "name": "基金收益", "icon": "fund" },
        { "id": "stock", "name": "股票收益", "icon": "stock" },
        { "id": "invest-red-packet", "name": "红包收入", "icon": "invest-red-packet" }
      ]
    },
    {
      "id": "refund",
      "name": "退款",
      "icon": "refund",
      "color": "#A0A0A0",
      "adventureAction": "recover",
      "children": [
        { "id": "return", "name": "退货退款", "icon": "return" },
        { "id": "reimburse", "name": "报销", "icon": "reimburse" }
      ]
    },
    {
      "id": "gift-money",
      "name": "礼金",
      "icon": "gift-money",
      "color": "#FF6B8A",
      "adventureAction": "lucky_day",
      "children": [
        { "id": "birthday-gift", "name": "生日礼金", "icon": "birthday-gift" },
        { "id": "festival-gift", "name": "节日红包", "icon": "festival-gift" },
        { "id": "wedding-gift", "name": "婚礼礼金", "icon": "wedding-gift" }
      ]
    },
    {
      "id": "income-other",
      "name": "其他",
      "icon": "income-other",
      "color": "#D3D3D3",
      "adventureAction": "misc_income",
      "children": [
        { "id": "sell", "name": "闲置出售", "icon": "sell" },
        { "id": "income-misc", "name": "其他收入", "icon": "income-misc" }
      ]
    }
  ]
}
```

- [ ] **Step 2: 验证 JSON 有效**

```bash
node -e "JSON.parse(require('fs').readFileSync('data/categories.json','utf8')); console.log('VALID')"
```
Expected: VALID

- [ ] **Step 3: Commit**

```bash
git add data/categories.json
git commit -m "feat: add category definitions (10 expense + 6 income categories)"
```

### Task 1.2: 精灵数据文件

**Files:**
- Create: `miniprogram/data/pets.json`

- [ ] **Step 1: 编写精灵数据**

```json
{
  "basic": [
    { "id": "fat-cat", "name": "胖猫", "description": "慵懒又贪吃的橘猫", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["orange", "pink", "blue", "green", "purple", "gold"] },
    { "id": "round-bear", "name": "圆熊", "description": "最爱蜂蜜的圆滚滚小熊", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["brown", "pink", "blue", "green", "purple", "gold"] },
    { "id": "soft-bunny", "name": "软兔", "description": "垂耳朵的软萌小兔", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["white", "pink", "blue", "green", "purple", "gold"] },
    { "id": "mochi", "name": "糯米团子", "description": "白白软软的小团子", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["white", "pink", "blue", "green", "purple", "gold"] },
    { "id": "dino", "name": "小恐龙", "description": "短手短脚的可爱小暴龙", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["green", "pink", "blue", "orange", "purple", "gold"] },
    { "id": "fat-bird", "name": "肥啾", "description": "圆滚滚的小白鸟", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["white", "pink", "blue", "green", "purple", "gold"] },
    { "id": "seal", "name": "小海豹", "description": "圆头圆脑芝麻豹", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["grey", "pink", "blue", "green", "purple", "gold"] },
    { "id": "cream-fox", "name": "奶狐狸", "description": "毛茸茸奶油色大尾巴", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["cream", "pink", "blue", "green", "purple", "gold"] },
    { "id": "shiba", "name": "柴丸子", "description": "豆豆眉的圆滚滚小柴犬", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["orange", "pink", "blue", "green", "purple", "gold"] },
    { "id": "hamster", "name": "仓鼠球", "description": "腮帮子鼓鼓的小仓鼠", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["brown", "pink", "blue", "green", "purple", "gold"] },
    { "id": "hippo", "name": "小河马", "description": "粉紫色的胖胖小河马", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["purple", "pink", "blue", "green", "orange", "gold"] },
    { "id": "penguin", "name": "奶企鹅", "description": "摇摇摆摆的小企鹅", "unlockCondition": "initial", "stages": ["baby", "young", "adult"], "colors": ["blue", "pink", "white", "green", "purple", "gold"] }
  ],
  "rare": [
    { "id": "narwhal", "name": "独角鲸", "description": "神秘的海洋独角精灵", "unlockCondition": { "type": "totalRecords", "value": 100 } },
    { "id": "cotton-cloud", "name": "棉花糖云", "description": "飘在空中的软软云朵", "unlockCondition": { "type": "totalRecords", "value": 300 } },
    { "id": "star-unicorn", "name": "星空独角兽", "description": "来自星空的神奇精灵", "unlockCondition": { "type": "totalRecords", "value": 500 } },
    { "id": "jelly-dragon", "name": "软糖龙", "description": "QQ弹弹的果冻小飞龙", "unlockCondition": { "type": "totalRecords", "value": 1000 } },
    { "id": "cream-phoenix", "name": "奶油凤凰", "description": "每天坚持记账才能遇到的神兽", "unlockCondition": { "type": "consecutiveDays", "value": 90 } },
    { "id": "crystal-slime", "name": "水晶史莱姆", "description": "预算管理大师的奖励", "unlockCondition": { "type": "consecutiveBudgetMonths", "value": 3 } },
    { "id": "rainbow-mochi", "name": "彩虹团子", "description": "记账一整年的纪念", "unlockCondition": { "type": "totalRecords", "value": 365, "extra": "记账满一年" } },
    { "id": "gold-carrot-bunny", "name": "金萝卜兔", "description": "收入达标的奖励", "unlockCondition": { "type": "totalIncome", "value": 10000000 } },
    { "id": "mooncake-cat", "name": "月饼猫", "description": "中秋节限定精灵", "unlockCondition": { "type": "festival", "value": "mid-autumn" } },
    { "id": "tangyuan-mochi", "name": "汤圆团子", "description": "元宵节限定精灵", "unlockCondition": { "type": "festival", "value": "lantern" } },
    { "id": "zongzi-dino", "name": "粽粽龙", "description": "端午节限定精灵", "unlockCondition": { "type": "festival", "value": "dragon-boat" } },
    { "id": "snowflake-spirit", "name": "雪花精", "description": "圣诞节限定精灵", "unlockCondition": { "type": "festival", "value": "christmas" } }
  ]
}
```

- [ ] **Step 2: 验证 JSON 并提交**

```bash
node -e "JSON.parse(require('fs').readFileSync('data/pets.json','utf8')); console.log('VALID')"
git add data/pets.json
git commit -m "feat: add pet definitions (12 basic + 12 rare pets)"
```

### Task 1.3: 主题数据文件

**Files:**
- Create: `miniprogram/data/themes.json`

- [ ] **Step 1: 编写主题数据**

```json
{
  "permanent": [
    { "id": "candy-kingdom", "name": "糖果王国", "colors": { "primary": "#FF6B8A", "secondary": "#FFB6C1", "bg": "#FFF0F5" }, "unlockCondition": "initial" },
    { "id": "misty-forest", "name": "迷雾森林", "colors": { "primary": "#7BC67E", "secondary": "#A8D8A8", "bg": "#F0F8F0" }, "unlockCondition": "initial" },
    { "id": "ocean-adventure", "name": "海底奇遇", "colors": { "primary": "#4ECDC4", "secondary": "#87CEEB", "bg": "#F0F8FF" }, "unlockCondition": "initial" },
    { "id": "star-travel", "name": "星空漫游", "colors": { "primary": "#6C5CE7", "secondary": "#A29BFE", "bg": "#1A1A2E", "text": "#FFFFFF" }, "unlockCondition": "initial" },
    { "id": "sakura-garden", "name": "樱花庭院", "colors": { "primary": "#FFB7C5", "secondary": "#FFE4E9", "bg": "#FFF5F7" }, "unlockCondition": { "type": "totalRecords", "value": 30 } },
    { "id": "desert-oasis", "name": "沙漠绿洲", "colors": { "primary": "#FFB347", "secondary": "#FFD700", "bg": "#FFF8E7" }, "unlockCondition": { "type": "totalRecords", "value": 50 } },
    { "id": "ice-wonderland", "name": "冰雪仙境", "colors": { "primary": "#87CEEB", "secondary": "#E0F7FA", "bg": "#F0FAFF" }, "unlockCondition": { "type": "totalRecords", "value": 100 } },
    { "id": "cloud-castle", "name": "云上城堡", "colors": { "primary": "#DDA0DD", "secondary": "#E8D5F5", "bg": "#FEF5FF" }, "unlockCondition": { "type": "totalRecords", "value": 150 } },
    { "id": "tropical-island", "name": "热带海岛", "colors": { "primary": "#00CED1", "secondary": "#98FB98", "bg": "#F0FFF0" }, "unlockCondition": { "type": "totalRecords", "value": 200 } },
    { "id": "mushroom-village", "name": "蘑菇村庄", "colors": { "primary": "#CD853F", "secondary": "#DEB887", "bg": "#FFF5EE" }, "unlockCondition": { "type": "totalRecords", "value": 300 } },
    { "id": "magic-academy", "name": "魔法学院", "colors": { "primary": "#9370DB", "secondary": "#DDA0DD", "bg": "#1A0033", "text": "#FFFFFF" }, "unlockCondition": { "type": "totalRecords", "value": 400 } },
    { "id": "steam-city", "name": "蒸汽城市", "colors": { "primary": "#B8860B", "secondary": "#DAA520", "bg": "#FFF8DC" }, "unlockCondition": { "type": "totalRecords", "value": 500 } },
    { "id": "bamboo-path", "name": "竹林小径", "colors": { "primary": "#556B2F", "secondary": "#8FBC8F", "bg": "#F5FFF5" }, "unlockCondition": { "type": "totalRecords", "value": 600 } },
    { "id": "sunflower-field", "name": "向日葵田", "colors": { "primary": "#FFD700", "secondary": "#FFFACD", "bg": "#FFFFF0" }, "unlockCondition": { "type": "totalRecords", "value": 700 } },
    { "id": "aurora-icefield", "name": "极光冰原", "colors": { "primary": "#00CED1", "secondary": "#7FFFD4", "bg": "#F0FFFF" }, "unlockCondition": { "type": "totalRecords", "value": 800 } },
    { "id": "totoro-forest", "name": "龙猫森林", "colors": { "primary": "#3CB371", "secondary": "#90EE90", "bg": "#F0FFF0" }, "unlockCondition": { "type": "totalRecords", "value": 900 } },
    { "id": "gem-cave", "name": "宝石矿洞", "colors": { "primary": "#FF1493", "secondary": "#FFB6C1", "bg": "#FFF0F5" }, "unlockCondition": { "type": "totalRecords", "value": 1000 } },
    { "id": "sky-garden", "name": "空中花园", "colors": { "primary": "#87CEEB", "secondary": "#FFFACD", "bg": "#F8F8FF" }, "unlockCondition": { "type": "consecutiveDays", "value": 30 } },
    { "id": "moonlit-market", "name": "月光夜市", "colors": { "primary": "#FF6347", "secondary": "#FFA07A", "bg": "#2C1810", "text": "#FFFFFF" }, "unlockCondition": { "type": "consecutiveDays", "value": 60 } },
    { "id": "dream-onsen", "name": "梦幻温泉", "colors": { "primary": "#FFB6C1", "secondary": "#FFE4E1", "bg": "#FFFAFA" }, "unlockCondition": { "type": "consecutiveDays", "value": 100 } }
  ],
  "festival": [
    { "id": "spring-festival", "name": "新春庙会", "festival": "spring", "colors": { "primary": "#FF0000", "secondary": "#FFD700", "bg": "#FFF0F0" } },
    { "id": "lantern-festival", "name": "元宵灯会", "festival": "lantern", "colors": { "primary": "#FF6347", "secondary": "#FFD700", "bg": "#FFF5F0" } },
    { "id": "sakura-festival", "name": "樱花祭", "festival": "sakura", "month": 4, "colors": { "primary": "#FFB7C5", "secondary": "#FFC0CB", "bg": "#FFF5F7" } },
    { "id": "dragon-boat", "name": "端午龙舟", "festival": "dragon-boat", "colors": { "primary": "#228B22", "secondary": "#90EE90", "bg": "#F5FFF5" } },
    { "id": "qixi", "name": "七夕鹊桥", "festival": "qixi", "colors": { "primary": "#9370DB", "secondary": "#DDA0DD", "bg": "#FFF5FF" } },
    { "id": "mid-autumn", "name": "中秋月宫", "festival": "mid-autumn", "colors": { "primary": "#FFD700", "secondary": "#FFA500", "bg": "#FFF8E7" } },
    { "id": "halloween", "name": "万圣南瓜镇", "festival": "halloween", "colors": { "primary": "#FF6347", "secondary": "#9370DB", "bg": "#FFF5F0" } },
    { "id": "christmas", "name": "圣诞雪乡", "festival": "christmas", "colors": { "primary": "#DC143C", "secondary": "#228B22", "bg": "#F0FFF0" } },
    { "id": "new-year", "name": "新年倒计时", "festival": "new-year", "colors": { "primary": "#FFD700", "secondary": "#FF69B4", "bg": "#FFF8F0" } },
    { "id": "birthday", "name": "生日派对", "festival": "birthday", "colors": { "primary": "#FF69B4", "secondary": "#FFB6C1", "bg": "#FFF5F7" } }
  ]
}
```

- [ ] **Step 2: 验证并提交**

```bash
node -e "JSON.parse(require('fs').readFileSync('data/themes.json','utf8')); console.log('VALID')"
git add data/themes.json
git commit -m "feat: add theme definitions (20 permanent + 10 festival themes)"
```

---

## Phase 2: 核心工具函数 (TDD)

### Task 2.1: 统计计算 utils/stats.js

**Files:**
- Create: `miniprogram/tests/utils/stats.test.js`
- Create: `miniprogram/utils/stats.js`

- [ ] **Step 1: RED — 写失败的测试**

```javascript
// tests/utils/stats.test.js

const { calculateDailyStats, calculateWeeklyStats, calculateMonthlyStats, calculateYearlyStats, groupByCategory } = require('../../utils/stats');

const sampleBills = [
  { type: 'expense', amount: 3000, categoryL1: 'food', categoryL2: 'breakfast', date: '2026-06-15', timestamp: 1686816000000 },
  { type: 'expense', amount: 5000, categoryL1: 'food', categoryL2: 'lunch', date: '2026-06-15', timestamp: 1686830400000 },
  { type: 'expense', amount: 2000, categoryL1: 'transport', categoryL2: 'subway', date: '2026-06-15', timestamp: 1686816000000 },
  { type: 'income', amount: 500000, categoryL1: 'salary', categoryL2: 'monthly', date: '2026-06-15', timestamp: 1686816000000 },
  { type: 'expense', amount: 1500, categoryL1: 'food', categoryL2: 'snack', date: '2026-06-14', timestamp: 1686729600000 },
  { type: 'expense', amount: 8000, categoryL1: 'entertainment', categoryL2: 'movie', date: '2026-06-10', timestamp: 1686384000000 },
];

describe('calculateDailyStats', () => {
  test('calculates daily income, expense, and balance', () => {
    const result = calculateDailyStats(sampleBills, '2026-06-15');
    expect(result.totalExpense).toBe(10000);
    expect(result.totalIncome).toBe(500000);
    expect(result.balance).toBe(490000);
  });

  test('returns zeros for day with no bills', () => {
    const result = calculateDailyStats(sampleBills, '2026-06-16');
    expect(result.totalExpense).toBe(0);
    expect(result.totalIncome).toBe(0);
    expect(result.balance).toBe(0);
  });

  test('returns empty categories array for day with no bills', () => {
    const result = calculateDailyStats(sampleBills, '2026-06-16');
    expect(result.categoryBreakdown).toEqual([]);
  });
});

describe('calculateWeeklyStats', () => {
  test('calculates weekly totals from Monday to Sunday', () => {
    const result = calculateWeeklyStats(sampleBills, '2026-06-15');
    expect(result.totalExpense).toBe(17500);
    expect(result.totalIncome).toBe(500000);
    expect(result.dailyBreakdown).toHaveLength(7);
  });

  test('daily breakdown has correct structure', () => {
    const result = calculateWeeklyStats(sampleBills, '2026-06-15');
    result.dailyBreakdown.forEach(day => {
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('expense');
      expect(day).toHaveProperty('income');
    });
  });
});

describe('calculateMonthlyStats', () => {
  test('calculates monthly totals', () => {
    const result = calculateMonthlyStats(sampleBills, '2026-06');
    expect(result.totalExpense).toBe(17500);
    expect(result.totalIncome).toBe(500000);
  });
});

describe('calculateYearlyStats', () => {
  test('calculates yearly totals', () => {
    const result = calculateYearlyStats(sampleBills, '2026');
    expect(result.totalExpense).toBe(17500);
    expect(result.totalIncome).toBe(500000);
    expect(result.monthlyBreakdown).toHaveLength(12);
  });
});

describe('groupByCategory', () => {
  test('groups bills by categoryL1 and sums amounts', () => {
    const result = groupByCategory(sampleBills.filter(b => b.type === 'expense'));
    expect(result).toEqual([
      { category: 'food', amount: 9500, count: 3, percentage: expect.any(Number) },
      { category: 'transport', amount: 2000, count: 1, percentage: expect.any(Number) },
      { category: 'entertainment', amount: 8000, count: 1, percentage: expect.any(Number) },
    ]);
  });

  test('calculates correct percentages', () => {
    const result = groupByCategory(sampleBills.filter(b => b.type === 'expense'));
    const total = result.reduce((sum, c) => sum + c.percentage, 0);
    expect(Math.round(total)).toBe(100);
  });
});
```

- [ ] **Step 2: RED — 运行测试确认失败**

```bash
npx jest tests/utils/stats.test.js
```
Expected: FAIL — module not found / functions not defined

- [ ] **Step 3: GREEN — 实现最小代码**

```javascript
// utils/stats.js

function getWeekRange(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

function filterByDate(bills, start, end) {
  return bills.filter(b => {
    const ts = b.timestamp;
    return ts >= start.getTime() && ts <= end.getTime();
  });
}

function sumByType(bills, type) {
  return bills.filter(b => b.type === type).reduce((sum, b) => sum + b.amount, 0);
}

function calculateDailyStats(bills, dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const next = new Date(d);
  next.setDate(next.getDate() + 1);

  const dayBills = filterByDate(bills, d, new Date(next.getTime() - 1));
  const totalExpense = sumByType(dayBills, 'expense');
  const totalIncome = sumByType(dayBills, 'income');
  const categoryBreakdown = groupByCategory(dayBills.filter(b => b.type === 'expense'));

  return { date: dateStr, totalExpense, totalIncome, balance: totalIncome - totalExpense, categoryBreakdown };
}

function calculateWeeklyStats(bills, dateStr) {
  const { start, end } = getWeekRange(dateStr);
  const weekBills = filterByDate(bills, start, end);
  const totalExpense = sumByType(weekBills, 'expense');
  const totalIncome = sumByType(weekBills, 'income');

  const dailyBreakdown = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(day.getDate() + i);
    const dayStr = day.toISOString().slice(0, 10);
    dailyBreakdown.push({ date: dayStr, expense: 0, income: 0 });
  }
  weekBills.forEach(b => {
    const entry = dailyBreakdown.find(d => d.date === b.date);
    if (entry) {
      if (b.type === 'expense') entry.expense += b.amount;
      else entry.income += b.amount;
    }
  });

  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), totalExpense, totalIncome, balance: totalIncome - totalExpense, dailyBreakdown };
}

function calculateMonthlyStats(bills, monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const monthBills = filterByDate(bills, start, end);
  const totalExpense = sumByType(monthBills, 'expense');
  const totalIncome = sumByType(monthBills, 'income');
  const categoryBreakdown = groupByCategory(monthBills.filter(b => b.type === 'expense'));

  return { month: monthStr, totalExpense, totalIncome, balance: totalIncome - totalExpense, categoryBreakdown };
}

function calculateYearlyStats(bills, yearStr) {
  const year = Number(yearStr);
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  const yearBills = filterByDate(bills, start, end);
  const totalExpense = sumByType(yearBills, 'expense');
  const totalIncome = sumByType(yearBills, 'income');

  const monthlyBreakdown = [];
  for (let m = 0; m < 12; m++) {
    const monthStart = new Date(year, m, 1);
    const monthEnd = new Date(year, m + 1, 0, 23, 59, 59, 999);
    const monthBills = filterByDate(yearBills, monthStart, monthEnd);
    monthlyBreakdown.push({
      month: m + 1,
      expense: sumByType(monthBills, 'expense'),
      income: sumByType(monthBills, 'income'),
    });
  }

  return { year: yearStr, totalExpense, totalIncome, balance: totalIncome - totalExpense, monthlyBreakdown };
}

function groupByCategory(bills) {
  const map = {};
  bills.forEach(b => {
    if (!map[b.categoryL1]) map[b.categoryL1] = { amount: 0, count: 0 };
    map[b.categoryL1].amount += b.amount;
    map[b.categoryL1].count += 1;
  });
  const total = Object.values(map).reduce((s, c) => s + c.amount, 0);
  return Object.entries(map)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: total > 0 ? Math.round((data.amount / total) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

module.exports = { calculateDailyStats, calculateWeeklyStats, calculateMonthlyStats, calculateYearlyStats, groupByCategory };
```

- [ ] **Step 4: GREEN — 运行测试确认通过**

```bash
npx jest tests/utils/stats.test.js
```
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add tests/utils/stats.test.js utils/stats.js
git commit -m "feat: add stats calculation utilities with TDD"
```

### Task 2.2: 预算计算 utils/budget.js

**Files:**
- Create: `miniprogram/tests/utils/budget.test.js`
- Create: `miniprogram/utils/budget.js`

- [ ] **Step 1: RED — 写失败的测试**

```javascript
// tests/utils/budget.test.js

const { getBudgetWarningLevel, calculateBudgetProgress, checkCategoryBudget } = require('../../utils/budget');

describe('calculateBudgetProgress', () => {
  test('returns 0% when no spending', () => {
    expect(calculateBudgetProgress(0, 100000)).toBe(0);
  });

  test('returns 50% when half spent', () => {
    expect(calculateBudgetProgress(50000, 100000)).toBe(50);
  });

  test('returns 100% when exactly at budget', () => {
    expect(calculateBudgetProgress(100000, 100000)).toBe(100);
  });

  test('returns 150% when over budget', () => {
    expect(calculateBudgetProgress(150000, 100000)).toBe(150);
  });

  test('returns 0 when budget is 0', () => {
    expect(calculateBudgetProgress(5000, 0)).toBe(0);
  });
});

describe('getBudgetWarningLevel', () => {
  test('returns "safe" when under 50%', () => {
    expect(getBudgetWarningLevel(30)).toBe('safe');
  });

  test('returns "half" at 50%', () => {
    expect(getBudgetWarningLevel(50)).toBe('half');
  });

  test('returns "warning" at 80%', () => {
    expect(getBudgetWarningLevel(80)).toBe('warning');
  });

  test('returns "critical" at 100%', () => {
    expect(getBudgetWarningLevel(100)).toBe('critical');
  });

  test('returns "over" above 100%', () => {
    expect(getBudgetWarningLevel(120)).toBe('over');
  });
});

describe('checkCategoryBudget', () => {
  const budgets = { food: 50000, transport: 20000 };

  test('returns all safe when no spending', () => {
    const result = checkCategoryBudget({}, budgets);
    expect(result.alerts).toHaveLength(0);
  });

  test('alerts on category approaching budget', () => {
    const spending = { food: 45000 };
    const result = checkCategoryBudget(spending, budgets);
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.alerts[0].category).toBe('food');
    expect(result.alerts[0].level).toBe('warning');
  });
});
```

- [ ] **Step 2: RED — 运行测试确认失败**

```bash
npx jest tests/utils/budget.test.js
```
Expected: FAIL

- [ ] **Step 3: GREEN — 实现最小代码**

```javascript
// utils/budget.js

function calculateBudgetProgress(spent, budget) {
  if (budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

function getBudgetWarningLevel(percentage) {
  if (percentage >= 100) return percentage > 100 ? 'over' : 'critical';
  if (percentage >= 80) return 'warning';
  if (percentage >= 50) return 'half';
  return 'safe';
}

function getWarningMessage(level, category) {
  const messages = {
    half: `${category || ''}预算已过半啦~`,
    warning: `${category || ''}预算快要用完咯`,
    critical: `${category || ''}预算已用完！`,
    over: `${category || ''}超预算了！`,
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
      alerts.push({ category, spent, budget, percentage, level, message: getWarningMessage(level, category) });
    }
  });
  return { alerts, hasAlert: alerts.length > 0 };
}

module.exports = { calculateBudgetProgress, getBudgetWarningLevel, checkCategoryBudget, getWarningMessage };
```

- [ ] **Step 4: GREEN — 运行测试确认通过**

```bash
npx jest tests/utils/budget.test.js
```
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add tests/utils/budget.test.js utils/budget.js
git commit -m "feat: add budget calculation utilities with TDD"
```

### Task 2.3: 精灵逻辑 utils/pet.js

**Files:**
- Create: `miniprogram/tests/utils/pet.test.js`
- Create: `miniprogram/utils/pet.js`
- Read: `miniprogram/data/pets.json`

- [ ] **Step 1: RED — 写失败的测试**

```javascript
// tests/utils/pet.test.js

const { getPetById, getPetStage, checkPetUnlock, getPetMood, ALL_PETS } = require('../../utils/pet');

// Mock the data module
jest.mock('../../data/pets.json', () => ({
  basic: [
    { id: 'fat-cat', name: '胖猫', unlockCondition: 'initial', stages: ['baby', 'young', 'adult'] },
    { id: 'shiba', name: '柴丸子', unlockCondition: 'initial', stages: ['baby', 'young', 'adult'] },
  ],
  rare: [
    { id: 'narwhal', name: '独角鲸', unlockCondition: { type: 'totalRecords', value: 100 } },
    { id: 'star-unicorn', name: '星空独角兽', unlockCondition: { type: 'totalRecords', value: 500 } },
    { id: 'cream-phoenix', name: '奶油凤凰', unlockCondition: { type: 'consecutiveDays', value: 90 } },
  ],
}), { virtual: true });

describe('getPetById', () => {
  test('returns basic pet by id', () => {
    const pet = getPetById('fat-cat');
    expect(pet).toBeDefined();
    expect(pet.name).toBe('胖猫');
  });

  test('returns rare pet by id', () => {
    const pet = getPetById('narwhal');
    expect(pet).toBeDefined();
    expect(pet.name).toBe('独角鲸');
  });

  test('returns undefined for unknown id', () => {
    expect(getPetById('nonexistent')).toBeUndefined();
  });
});

describe('getPetStage', () => {
  test('baby stage for 0-30 days', () => {
    expect(getPetStage(0)).toBe('baby');
    expect(getPetStage(15)).toBe('baby');
    expect(getPetStage(30)).toBe('baby');
  });

  test('young stage for 31-90 days', () => {
    expect(getPetStage(31)).toBe('young');
    expect(getPetStage(60)).toBe('young');
  });

  test('adult stage for 91+ days', () => {
    expect(getPetStage(91)).toBe('adult');
    expect(getPetStage(365)).toBe('adult');
  });
});

describe('checkPetUnlock', () => {
  test('initial pets are always unlocked', () => {
    const result = checkPetUnlock('fat-cat', { totalRecords: 0, consecutiveDays: 0 });
    expect(result.unlocked).toBe(true);
  });

  test('unlocks by total records', () => {
    const result = checkPetUnlock('narwhal', { totalRecords: 150, consecutiveDays: 0 });
    expect(result.unlocked).toBe(true);
  });

  test('not unlocked when insufficient records', () => {
    const result = checkPetUnlock('narwhal', { totalRecords: 50, consecutiveDays: 0 });
    expect(result.unlocked).toBe(false);
  });

  test('unlocks by consecutive days', () => {
    const result = checkPetUnlock('cream-phoenix', { totalRecords: 0, consecutiveDays: 90 });
    expect(result.unlocked).toBe(true);
  });
});

describe('getPetMood', () => {
  test('happy when under budget', () => {
    expect(getPetMood(50)).toBe('happy');
  });

  test('neutral at half budget', () => {
    expect(getPetMood(60)).toBe('neutral');
  });

  test('worried near budget limit', () => {
    expect(getPetMood(85)).toBe('worried');
  });

  test('sad at over budget', () => {
    expect(getPetMood(110)).toBe('sad');
  });
});
```

- [ ] **Step 2: RED — 运行确认失败**

```bash
npx jest tests/utils/pet.test.js
```
Expected: FAIL

- [ ] **Step 3: GREEN — 实现**

```javascript
// utils/pet.js

const petsData = require('../data/pets.json');

const ALL_PETS = [...petsData.basic, ...petsData.rare];

function getPetById(id) {
  return ALL_PETS.find(p => p.id === id);
}

function getPetStage(totalDays) {
  if (totalDays <= 30) return 'baby';
  if (totalDays <= 90) return 'young';
  return 'adult';
}

function checkPetUnlock(petId, userStats) {
  const pet = getPetById(petId);
  if (!pet) return { unlocked: false, reason: 'unknown_pet' };
  if (pet.unlockCondition === 'initial') return { unlocked: true };

  const { type, value } = pet.unlockCondition;
  const current = userStats[type] || 0;
  return { unlocked: current >= value, reason: current >= value ? null : 'not_met', required: value, current };
}

function getPetMood(budgetPercentage) {
  if (budgetPercentage <= 50) return 'happy';
  if (budgetPercentage <= 75) return 'neutral';
  if (budgetPercentage <= 100) return 'worried';
  return 'sad';
}

function getMoodEmoji(mood) {
  const map = { happy: '(◕‿◕)', neutral: '(・-・)', worried: '(>_<)', sad: '(;_;)' };
  return map[mood] || '(・-・)';
}

module.exports = { getPetById, getPetStage, checkPetUnlock, getPetMood, getMoodEmoji, ALL_PETS };
```

- [ ] **Step 4: GREEN — 运行确认通过**

```bash
npx jest tests/utils/pet.test.js
```
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add tests/utils/pet.test.js utils/pet.js
git commit -m "feat: add pet logic utilities with TDD"
```

### Task 2.4: 冒险逻辑 utils/adventure.js

**Files:**
- Create: `miniprogram/tests/utils/adventure.test.js`
- Create: `miniprogram/utils/adventure.js`

- [ ] **Step 1: RED — 写失败的测试**

```javascript
// tests/utils/adventure.test.js

const { getAdventureAction, generateMonthStory, getCurrentFestivalTheme } = require('../../utils/adventure');

describe('getAdventureAction', () => {
  test('returns action for known category', () => {
    expect(getAdventureAction('food')).toBe('explore_food');
    expect(getAdventureAction('transport')).toBe('travel');
  });

  test('returns default for unknown category', () => {
    expect(getAdventureAction('unknown-cat')).toBe('misc');
  });
});

describe('generateMonthStory', () => {
  test('generates story with all sections', () => {
    const data = {
      month: '2026-06',
      themeName: '糖果王国',
      totalExpense: 350000,
      totalIncome: 800000,
      topCategory: '餐饮',
      topCategoryAmount: 120000,
      recordDays: 25,
    };
    const story = generateMonthStory(data);
    expect(story.title).toContain('糖果王国');
    expect(story.sections.length).toBeGreaterThan(0);
    expect(story.summary).toBeDefined();
  });

  test('generates empty month story gracefully', () => {
    const data = {
      month: '2026-06',
      themeName: '迷雾森林',
      totalExpense: 0,
      totalIncome: 0,
      topCategory: null,
      topCategoryAmount: 0,
      recordDays: 0,
    };
    const story = generateMonthStory(data);
    expect(story.sections.length).toBeGreaterThan(0);
  });
});

describe('getCurrentFestivalTheme', () => {
  test('returns null on non-festival date', () => {
    const result = getCurrentFestivalTheme(new Date('2026-06-15'));
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: RED — 运行确认失败**

```bash
npx jest tests/utils/adventure.test.js
```
Expected: FAIL

- [ ] **Step 3: GREEN — 实现**

```javascript
// utils/adventure.js

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
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simple festival detection, expand as needed
  const festivals = {
    '1-1': 'new-year',
    '12-25': 'christmas',
    '10-31': 'halloween',
  };

  const key = `${month}-${day}`;
  const festivalId = festivals[key];
  if (!festivalId) return null;

  return themesData.festival.find(t => t.festival === festivalId) || null;
}

module.exports = { getAdventureAction, generateMonthStory, getCurrentFestivalTheme };
```

- [ ] **Step 4: GREEN — 运行确认通过**

```bash
npx jest tests/utils/adventure.test.js
```
Expected: ALL PASS

- [ ] **Step 5: 运行全部工具函数测试**

```bash
npx jest tests/utils/
```
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add tests/utils/adventure.test.js utils/adventure.js
git commit -m "feat: add adventure logic utilities with TDD"
```

---

## Phase 3: 云数据库层

### Task 3.1: 数据库封装 utils/db.js

**Files:**
- Create: `miniprogram/utils/db.js`

- [ ] **Step 1: 实现数据库封装**

```javascript
// utils/db.js

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
    ...bill,
    amount: Math.round(bill.amount), // store as integer (cents/fen)
    createdAt: db.serverDate(),
  };
  const result = await collections.bills.add({ data });
  return { _id: result._id, ...data };
}

async function getBills(query = {}) {
  const { startDate, endDate, type, categoryL1, keyword, skip = 0, limit = 50 } = query;
  let q = collections.bills;

  if (startDate && endDate) {
    q = q.where({ date: _.gte(startDate).and(_.lte(endDate)) });
  }
  if (type) {
    // Chain where — note: each where adds an AND condition in cloud DB
  }

  const result = await q.orderBy('timestamp', 'desc').skip(skip).limit(limit).get();
  return result.data;
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

// Budgets
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

module.exports = { addBill, getBills, getBillsByDateRange, deleteBill, updateBill, getBudget, saveBudget, getUser, updateUser, getAdventure, saveAdventure };
```

- [ ] **Step 2: Commit**

```bash
git add utils/db.js
git commit -m "feat: add cloud database wrapper utilities"
```

---

## Phase 4: 组件开发 (TDD)

### Task 4.1: 预算进度环组件 budget-ring

**Files:**
- Create: `miniprogram/components/budget-ring/budget-ring.js`
- Create: `miniprogram/components/budget-ring/budget-ring.json`
- Create: `miniprogram/components/budget-ring/budget-ring.wxml`
- Create: `miniprogram/components/budget-ring/budget-ring.wxss`

- [ ] **Step 1: 创建组件 JS 逻辑**

```javascript
// components/budget-ring/budget-ring.js
const { calculateBudgetProgress, getBudgetWarningLevel } = require('../../utils/budget');

Component({
  properties: {
    spent: { type: Number, value: 0 },
    budget: { type: Number, value: 0 },
    size: { type: Number, value: 200 },
    label: { type: String, value: '' },
  },
  data: {
    percentage: 0,
    level: 'safe',
    dashArray: '0 100',
    colors: { safe: '#4ECDC4', half: '#FFE66D', warning: '#FF8C5A', critical: '#FF4757', over: '#FF4757' },
  },
  observers: {
    'spent, budget': function (spent, budget) {
      const pct = calculateBudgetProgress(spent, budget);
      const level = getBudgetWarningLevel(pct);
      this.setData({ percentage: pct, level, dashArray: `${pct} ${100 - pct}` });
    },
  },
  methods: {
    getColor() {
      return this.data.colors[this.data.level];
    },
  },
});
```

- [ ] **Step 2: 创建组件模板**

```xml
<!-- components/budget-ring/budget-ring.wxml -->
<view class="budget-ring-container" style="width: {{size}}rpx; height: {{size}}rpx;">
  <svg viewBox="0 0 100 100" class="ring-svg">
    <circle cx="50" cy="50" r="42" class="ring-bg" />
    <circle cx="50" cy="50" r="42" class="ring-progress"
      style="stroke: {{getColor()}}; stroke-dasharray: {{dashArray}};" />
  </svg>
  <view class="ring-center">
    <text class="ring-percentage">{{percentage}}%</text>
    <text class="ring-label" wx:if="{{label}}">{{label}}</text>
  </view>
</view>
```

- [ ] **Step 3: 创建组件样式**

```css
/* components/budget-ring/budget-ring.wxss */
.budget-ring-container { position: relative; display: flex; align-items: center; justify-content: center; }
.ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ring-bg { fill: none; stroke: #F0F0F0; stroke-width: 8; }
.ring-progress { fill: none; stroke-width: 8; stroke-linecap: round; transition: stroke-dasharray 0.5s ease; }
.ring-center { position: absolute; display: flex; flex-direction: column; align-items: center; }
.ring-percentage { font-size: 36rpx; font-weight: bold; color: var(--text); }
.ring-label { font-size: 22rpx; color: var(--text-secondary); margin-top: 4rpx; }
```

- [ ] **Step 4: Commit**

```bash
git add components/budget-ring/
git commit -m "feat: add budget ring progress component"
```

### Task 4.2: 分类选择器组件 category-picker

**Files:**
- Create: `miniprogram/components/category-picker/category-picker.js`
- Create: `miniprogram/components/category-picker/category-picker.json`
- Create: `miniprogram/components/category-picker/category-picker.wxml`
- Create: `miniprogram/components/category-picker/category-picker.wxss`

- [ ] **Step 1: 创建组件 JS**

```javascript
// components/category-picker/category-picker.js
const categoriesData = require('../../data/categories.json');

Component({
  properties: {
    type: { type: String, value: 'expense' },
    selectedL1: { type: String, value: '' },
    selectedL2: { type: String, value: '' },
  },
  data: {
    categories: [],
    expandedIndex: -1,
  },
  lifetimes: {
    attached() {
      this.updateCategories();
    },
  },
  observers: {
    'type': function () { this.updateCategories(); },
  },
  methods: {
    updateCategories() {
      this.setData({ categories: categoriesData[this.properties.type] || [], expandedIndex: -1 });
    },
    onTapCategory(e) {
      const index = e.currentTarget.dataset.index;
      this.setData({ expandedIndex: this.data.expandedIndex === index ? -1 : index });
    },
    onSelectSub(e) {
      const { l1, l2 } = e.currentTarget.dataset;
      this.setData({ selectedL1: l1, selectedL2: l2 });
      this.triggerEvent('select', { categoryL1: l1, categoryL2: l2 });
      this.setData({ expandedIndex: -1 });
    },
  },
});
```

- [ ] **Step 2: 创建组件模板**

```xml
<!-- components/category-picker/category-picker.wxml -->
<view class="category-picker">
  <view class="category-grid">
    <view class="category-item {{expandedIndex === index ? 'active' : ''}}"
      wx:for="{{categories}}" wx:key="id"
      data-index="{{index}}"
      bindtap="onTapCategory">
      <view class="cat-icon" style="background: {{item.color}}20;">
        <image src="/assets/icons/categories/{{item.icon}}.png" mode="aspectFit" />
      </view>
      <text class="cat-name">{{item.name}}</text>
    </view>
  </view>

  <view class="subcategory-panel {{expandedIndex >= 0 ? 'show' : ''}}">
    <view class="sub-item {{selectedL2 === child.id ? 'selected' : ''}}"
      wx:for="{{categories[expandedIndex].children}}" wx:key="id"
      data-l1="{{categories[expandedIndex].id}}"
      data-l2="{{item.id}}"
      bindtap="onSelectSub">
      <text>{{item.name}}</text>
    </view>
  </view>
</view>
```

- [ ] **Step 3: Commit**

```bash
git add components/category-picker/
git commit -m "feat: add category picker component (two-level)"
```

---

## Phase 5: 核心页面

### Task 5.1: 记账弹窗 add-record

**Files:**
- Create: `miniprogram/pages/add-record/add-record.js`
- Create: `miniprogram/pages/add-record/add-record.json`
- Create: `miniprogram/pages/add-record/add-record.wxml`
- Create: `miniprogram/pages/add-record/add-record.wxss`

- [ ] **Step 1: 实现记账逻辑**

```javascript
// pages/add-record/add-record.js
const { addBill } = require('../../utils/db');
const { getAdventureAction } = require('../../utils/adventure');

Page({
  data: {
    type: 'expense',
    amount: '',
    categoryL1: '',
    categoryL2: '',
    date: '',
    time: '',
    note: '',
    showCategoryPicker: false,
    submitting: false,
  },
  onLoad() {
    const now = new Date();
    this.setData({
      date: now.toISOString().slice(0, 10),
      time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    });
  },
  onTapDigit(e) {
    const digit = e.currentTarget.dataset.digit;
    const current = this.data.amount;
    if (digit === '.') {
      if (current.includes('.')) return;
      this.setData({ amount: current + '.' });
    } else if (digit === 'del') {
      this.setData({ amount: current.slice(0, -1) });
    } else {
      if (current === '0' && digit !== '.') {
        this.setData({ amount: digit });
      } else {
        this.setData({ amount: current + digit });
      }
    }
  },
  switchType(e) {
    this.setData({ type: e.currentTarget.dataset.type, categoryL1: '', categoryL2: '' });
  },
  onSelectCategory(e) {
    this.setData({ categoryL1: e.detail.categoryL1, categoryL2: e.detail.categoryL2, showCategoryPicker: false });
  },
  async onSubmit() {
    const { type, amount, categoryL1, categoryL2, date, time, note } = this.data;
    if (!amount || !categoryL1 || !categoryL2) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    try {
      const timestamp = new Date(`${date}T${time}:00`).getTime();
      await addBill({
        type,
        amount: Math.round(parseFloat(amount) * 100), // yuan to fen
        categoryL1,
        categoryL2,
        date,
        timestamp,
        note,
      });

      // Trigger animation
      this.triggerSuccessAnimation();
      wx.showToast({ title: '记好啦！', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 600);
    } catch (e) {
      wx.showToast({ title: '记录失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
  triggerSuccessAnimation() {
    // Pet cheer animation triggered via event
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('recordAdded', { type: this.data.type, categoryL1: this.data.categoryL1 });
    }
  },
});
```

- [ ] **Step 2: 记账页面模板/样式**

```xml
<!-- pages/add-record/add-record.wxml -->
<view class="add-record">
  <!-- Type Toggle -->
  <view class="type-toggle">
    <view class="type-btn {{type === 'expense' ? 'active expense' : ''}}" data-type="expense" bindtap="switchType">支出</view>
    <view class="type-btn {{type === 'income' ? 'active income' : ''}}" data-type="income" bindtap="switchType">收入</view>
  </view>

  <!-- Amount Display -->
  <view class="amount-display">
    <text class="currency">¥</text>
    <text class="amount-value">{{amount || '0'}}</text>
  </view>

  <!-- Category Selection -->
  <view class="field" bindtap="onTapCategorySelect">
    <text class="field-label">分类</text>
    <text class="field-value {{categoryL2 ? '' : 'placeholder'}}">
      {{categoryL2 ? categoriesData[type].find(c => c.id === categoryL1).name + ' · ' + categoriesData[type].find(c => c.id === categoryL1).children.find(s => s.id === categoryL2).name : '选择分类'}}
    </text>
  </view>

  <!-- Category Picker (shown conditionally) -->
  <category-picker wx:if="{{showCategoryPicker}}" type="{{type}}" bind:select="onSelectCategory" />

  <!-- Date & Time -->
  <view class="field-row">
    <picker mode="date" value="{{date}}" bindchange="onDateChange">
      <text>{{date}}</text>
    </picker>
    <picker mode="time" value="{{time}}" bindchange="onTimeChange">
      <text>{{time}}</text>
    </picker>
  </view>

  <!-- Note -->
  <input class="note-input" placeholder="添加备注..." value="{{note}}" bindinput="onNoteInput" />

  <!-- Submit -->
  <button class="submit-btn {{submitting ? 'submitting' : ''}}" bindtap="onSubmit" disabled="{{submitting}}">
    记一笔 ✨
  </button>

  <!-- Number Pad -->
  <view class="number-pad">
    <view class="pad-row" wx:for="{{[['1','2','3'],['4','5','6'],['7','8','9'],['.','0','del']]}}" wx:key="index">
      <view class="pad-key {{item === 'del' ? 'del' : ''}}" wx:for="{{item}}" wx:key="*this" data-digit="{{item}}" bindtap="onTapDigit">{{item === 'del' ? '⌫' : item}}</view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: Commit**

```bash
git add pages/add-record/
git commit -m "feat: add expense recording page with number pad"
```

### Task 5.2: 记录列表页 records

**Files:**
- Create: `miniprogram/pages/records/records.js`
- Create: `miniprogram/pages/records/records.json`
- Create: `miniprogram/pages/records/records.wxml`
- Create: `miniprogram/pages/records/records.wxss`

- [ ] **Step 1: 实现记录列表**

```javascript
// pages/records/records.js
const { getBillsByDateRange, deleteBill } = require('../../utils/db');

Page({
  data: {
    bills: [],
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
  async loadBills() {
    this.setData({ loading: true });
    try {
      const [year, month] = this.data.currentMonth.split('-').map(Number);
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
      const bills = await getBillsByDateRange(startDate, endDate);
      const grouped = this.groupByDate(bills);
      this.setData({ bills, groupedBills: grouped, isEmpty: bills.length === 0, loading: false });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },
  groupByDate(bills) {
    const groups = {};
    bills.forEach(b => {
      const key = b.date;
      if (!groups[key]) groups[key] = { date: key, total: 0, items: [] };
      groups[key].total += b.type === 'expense' ? -b.amount : b.amount;
      groups[key].items.push(b);
    });
    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  },
  onMonthChange(e) {
    this.setData({ currentMonth: e.detail.value });
    this.loadBills();
  },
  async onDeleteBill(e) {
    const { id } = e.currentTarget.dataset;
    const result = await wx.showModal({ title: '确认删除', content: '删除后无法恢复' });
    if (result.confirm) {
      await deleteBill(id);
      wx.showToast({ title: '已删除', icon: 'success' });
      this.loadBills();
    }
  },
  onTapBill(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/add-record/add-record?editId=${id}` });
  },
});
```

- [ ] **Step 2: 记录页面模板**

```xml
<!-- pages/records/records.wxml -->
<view class="records-page">
  <picker mode="date" fields="month" value="{{currentMonth}}" bindchange="onMonthChange">
    <view class="month-header">{{currentMonth}} ▼</view>
  </picker>

  <view wx:if="{{isEmpty}}" class="empty-state">
    <image src="/assets/sprites/pet-idle.gif" mode="aspectFit" />
    <text>还没有冒险记录哦~\n来记一笔吧！</text>
  </view>

  <view class="bill-groups" wx:else>
    <view class="bill-group" wx:for="{{groupedBills}}" wx:key="date">
      <view class="group-header">
        <text class="group-date">{{item.date}}</text>
        <text class="group-total {{item.total >= 0 ? 'income' : 'expense'}}">
          {{item.total >= 0 ? '+' : ''}}{{item.total / 100}}
        </text>
      </view>
      <view class="bill-item" wx:for="{{item.items}}" wx:key="_id" data-id="{{item._id}}" bindtap="onTapBill">
        <image class="bill-icon" src="/assets/icons/categories/{{item.categoryL1}}.png" />
        <view class="bill-info">
          <text class="bill-category">{{item.categoryL1}} · {{item.categoryL2}}</text>
          <text class="bill-note" wx:if="{{item.note}}">{{item.note}}</text>
        </view>
        <text class="bill-amount {{item.type === 'income' ? 'income' : 'expense'}}">
          {{item.type === 'income' ? '+' : '-'}}¥{{(item.amount / 100).toFixed(2)}}
        </text>
        <view class="bill-delete" catchtap="onDeleteBill" data-id="{{item._id}}">✕</view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: Commit**

```bash
git add pages/records/
git commit -m "feat: add bill records list page with date grouping"
```

### Task 5.3: 统计页 statistics

**Files:**
- Create: `miniprogram/pages/statistics/statistics.js`
- Create: `miniprogram/pages/statistics/statistics.json`
- Create: `miniprogram/pages/statistics/statistics.wxml`
- Create: `miniprogram/pages/statistics/statistics.wxss`

- [ ] **Step 1: 实现统计页核心逻辑**

```javascript
// pages/statistics/statistics.js
const { getBillsByDateRange } = require('../../utils/db');
const { calculateDailyStats, calculateWeeklyStats, calculateMonthlyStats, calculateYearlyStats, groupByCategory } = require('../../utils/stats');
const { getBudget } = require('../../utils/db');
const { calculateBudgetProgress } = require('../../utils/budget');

Page({
  data: {
    period: 'month', // 'day', 'week', 'month', 'year'
    periods: [
      { key: 'day', label: '日' },
      { key: 'week', label: '周' },
      { key: 'month', label: '月' },
      { key: 'year', label: '年' },
    ],
    stats: null,
    budget: null,
    budgetPercentage: 0,
    categoryBreakdown: [],
    loading: false,
  },
  onShow() { this.loadData(); },
  async loadData() {
    this.setData({ loading: true });
    try {
      const now = new Date();
      let startDate, endDate, stats;
      const year = now.getFullYear();

      if (this.data.period === 'day') {
        startDate = endDate = now.toISOString().slice(0, 10);
        const bills = await getBillsByDateRange(startDate, endDate);
        stats = calculateDailyStats(bills, startDate);
      } else if (this.data.period === 'week') {
        stats = calculateWeeklyStats(await this.getWeekBills(), now.toISOString().slice(0, 10));
      } else if (this.data.period === 'month') {
        const month = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const monthBills = await this.getMonthBills(year, now.getMonth() + 1);
        stats = calculateMonthlyStats(monthBills, month);
      } else {
        const yearBills = await this.getYearBills(year);
        stats = calculateYearlyStats(yearBills, String(year));
      }

      const budget = await getBudget();
      const budgetPct = budget ? calculateBudgetProgress(stats.totalExpense, budget.totalBudget) : 0;

      this.setData({
        stats,
        budget,
        budgetPercentage: budgetPct,
        categoryBreakdown: stats.categoryBreakdown || [],
        loading: false,
      });
    } catch (e) {
      console.error(e);
      this.setData({ loading: false });
    }
  },
  async getWeekBills() {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return getBillsByDateRange(monday.toISOString().slice(0, 10), sunday.toISOString().slice(0, 10));
  },
  async getMonthBills(year, month) {
    const start = `${year}-${String(month).padStart(2, '0')}-01`;
    const end = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
    return getBillsByDateRange(start, end);
  },
  async getYearBills(year) {
    return getBillsByDateRange(`${year}-01-01`, `${year}-12-31`);
  },
  onPeriodChange(e) {
    this.setData({ period: e.currentTarget.dataset.key });
    this.loadData();
  },
  onTapAdventureDiary() {
    wx.navigateTo({ url: '/pages/adventure-diary/adventure-diary' });
  },
});
```

- [ ] **Step 2: 统计页模板**

```xml
<!-- pages/statistics/statistics.wxml -->
<view class="statistics-page">
  <!-- Period Tabs -->
  <view class="period-tabs">
    <view class="period-tab {{period === item.key ? 'active' : ''}}"
      wx:for="{{periods}}" wx:key="key" data-key="{{item.key}}" bindtap="onPeriodChange">
      {{item.label}}
    </view>
  </view>

  <view wx:if="{{!stats}}" class="loading">加载中...</view>

  <view wx:else class="stats-content">
    <!-- Overview Card -->
    <view class="card overview-card">
      <view class="overview-item expense">
        <text class="ov-label">支出</text>
        <text class="ov-value">¥{{(stats.totalExpense / 100).toFixed(2)}}</text>
      </view>
      <view class="overview-item income">
        <text class="ov-label">收入</text>
        <text class="ov-value">¥{{(stats.totalIncome / 100).toFixed(2)}}</text>
      </view>
      <view class="overview-item balance">
        <text class="ov-label">结余</text>
        <text class="ov-value">¥{{(stats.balance / 100).toFixed(2)}}</text>
      </view>
    </view>

    <!-- Budget Ring -->
    <view class="card" wx:if="{{budget}}">
      <budget-ring spent="{{stats.totalExpense}}" budget="{{budget.totalBudget}}" label="本月预算" />
    </view>

    <!-- Category Breakdown -->
    <view class="card">
      <view class="section-title">支出分类</view>
      <view class="category-list">
        <view class="category-row" wx:for="{{categoryBreakdown}}" wx:key="category">
          <view class="cat-bar-bg">
            <view class="cat-bar-fill" style="width: {{item.percentage}}%; background: {{item.color || '#FF8C5A'}};" />
          </view>
          <text class="cat-name-text">{{item.category}}</text>
          <text class="cat-amount">¥{{(item.amount / 100).toFixed(2)}}</text>
          <text class="cat-pct">{{item.percentage}}%</text>
        </view>
      </view>
    </view>

    <!-- Adventure Diary Entry -->
    <view class="card adventure-entry" bindtap="onTapAdventureDiary" wx:if="{{period === 'month'}}">
      <text>📖 查看本月冒险日记</text>
      <text class="arrow">→</text>
    </view>
  </view>
</view>
```

- [ ] **Step 3: Commit**

```bash
git add pages/statistics/
git commit -m "feat: add statistics page with day/week/month/year views"
```

### Task 5.4: 小岛首页 island

**Files:**
- Create: `miniprogram/pages/island/island.js`
- Create: `miniprogram/pages/island/island.json`
- Create: `miniprogram/pages/island/island.wxml`
- Create: `miniprogram/pages/island/island.wxss`

- [ ] **Step 1: 实现小岛首页**

```javascript
// pages/island/island.js
const { getBillsByDateRange } = require('../../utils/db');
const { calculateDailyStats } = require('../../utils/stats');
const { getPetById, getPetStage, getPetMood, getMoodEmoji } = require('../../utils/pet');
const { getBudget } = require('../../utils/db');
const { calculateBudgetProgress } = require('../../utils/budget');

Page({
  data: {
    pet: null,
    petStage: 'baby',
    petMood: 'happy',
    moodEmoji: '(◕‿◕)',
    themeName: '糖果王国',
    todayStats: { totalExpense: 0, totalIncome: 0, balance: 0 },
    budgetPercentage: 0,
    adventureProgress: 0,
    recentBills: [],
    showAddRecord: false,
  },
  onShow() {
    this.loadPetData();
    this.loadTodayData();
  },
  loadPetData() {
    const app = getApp();
    const pet = getPetById(app.globalData.currentPet);
    const userDays = app.globalData.totalDays || 0;
    this.setData({
      pet: pet || { name: '胖猫', id: 'fat-cat' },
      petStage: getPetStage(userDays),
      moodEmoji: getMoodEmoji(this.data.petMood),
    });
  },
  async loadTodayData() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const bills = await getBillsByDateRange(today, today);
      const stats = calculateDailyStats(bills, today);
      const budget = await getBudget();
      const budgetPct = budget ? calculateBudgetProgress(stats.totalExpense, budget.totalBudget) : 0;
      const petMood = getPetMood(budgetPct);

      const todayTotal = new Date().getDate();
      const recordDays = new Set(bills.map(b => b.date)).size;
      const adventureProgress = Math.round((recordDays / todayTotal) * 100);

      this.setData({
        todayStats: stats,
        budgetPercentage: budgetPct,
        petMood,
        moodEmoji: getMoodEmoji(petMood),
        adventureProgress,
        recentBills: bills.slice(0, 5),
      });
    } catch (e) {
      console.error(e);
    }
  },
  onPetTap() {
    // Animate pet bounce
    wx.vibrateShort({ type: 'light' });
  },
  onAddRecord() {
    wx.navigateTo({ url: '/pages/add-record/add-record' });
  },
});
```

- [ ] **Step 2: 小岛首页模板**

```xml
<!-- pages/island/island.wxml -->
<view class="island-page" style="background: var(--bg);">
  <!-- Theme Scene -->
  <view class="scene">
    <view class="pet-area" bindtap="onPetTap">
      <image class="pet-sprite" src="/assets/sprites/{{pet.id}}-{{petStage}}.gif" mode="aspectFit" />
      <text class="pet-mood">{{moodEmoji}}</text>
    </view>
    <view class="pet-info">
      <text class="pet-name">{{pet.name}} Lv.{{petStage === 'adult' ? 'MAX' : petStage === 'young' ? '2' : '1'}}</text>
      <text class="theme-tag">{{themeName}}</text>
    </view>
  </view>

  <!-- Today Overview -->
  <view class="card today-card">
    <view class="today-row">
      <view class="today-item expense"><text class="t-label">今日支出</text><text class="t-value">¥{{(todayStats.totalExpense / 100).toFixed(2)}}</text></view>
      <view class="today-item income"><text class="t-label">今日收入</text><text class="t-value">¥{{(todayStats.totalIncome / 100).toFixed(2)}}</text></view>
    </view>
    <budget-ring spent="{{todayStats.totalExpense}}" budget="{{budget.totalBudget}}" size="{{120}}" label="预算" wx:if="{{budget}}" />
  </view>

  <!-- Adventure Progress -->
  <view class="card">
    <text class="section-title">本月冒险进度</text>
    <view class="progress-bar">
      <view class="progress-fill" style="width: {{adventureProgress}}%;" />
    </view>
    <text class="progress-text">{{adventureProgress}}%</text>
  </view>

  <!-- Recent Bills -->
  <view class="card" wx:if="{{recentBills.length > 0}}">
    <text class="section-title">今日冒险碎片</text>
    <view class="recent-list">
      <view class="recent-item" wx:for="{{recentBills}}" wx:key="_id">
        <text>{{item.categoryL1}} · {{item.categoryL2}}</text>
        <text class="{{item.type === 'income' ? 'income' : 'expense'}}">{{item.type === 'income' ? '+' : '-'}}¥{{(item.amount / 100).toFixed(2)}}</text>
      </view>
    </view>
  </view>

  <!-- FAB Add Button -->
  <view class="fab" bindtap="onAddRecord">
    <text class="fab-text">+</text>
  </view>
</view>
```

- [ ] **Step 3: Commit**

```bash
git add pages/island/
git commit -m "feat: add island home page with pet interaction"
```

### Task 5.5: 我的页面 profile

**Files:**
- Create: `miniprogram/pages/profile/profile.js`
- Create: `miniprogram/pages/profile/profile.json`
- Create: `miniprogram/pages/profile/profile.wxml`
- Create: `miniprogram/pages/profile/profile.wxss`

- [ ] **Step 1: 实现我的页面**

```javascript
// pages/profile/profile.js
Page({
  data: {
    achievements: [
      { id: 'first-record', name: '初次冒险', desc: '完成第一笔记账', unlocked: true },
      { id: 'streak-7', name: '坚持不懈', desc: '连续记账7天', unlocked: false },
      { id: 'streak-30', name: '月度勇士', desc: '连续记账30天', unlocked: false },
      { id: 'records-100', name: '百记达人', desc: '累计记账100笔', unlocked: false },
      { id: 'records-1000', name: '记账大师', desc: '累计记账1000笔', unlocked: false },
      { id: 'budget-master', name: '预算管家', desc: '连续3月达成预算', unlocked: false },
    ],
    menuItems: [
      { icon: 'pet', label: '精灵收藏馆', url: '/pages/collection/collection' },
      { icon: 'diary', label: '冒险相册', url: '/pages/adventure-diary/adventure-diary' },
      { icon: 'theme', label: '主题切换', url: '/pages/profile/profile?tab=theme' },
      { icon: 'budget', label: '预算设置', url: '/pages/budget/budget' },
      { icon: 'category', label: '分类管理', url: '/pages/category-mgmt/category-mgmt' },
      { icon: 'export', label: '数据导出', url: '' },
    ],
  },
  onTapMenu(e) {
    const { url } = e.currentTarget.dataset;
    if (url) wx.navigateTo({ url });
  },
  onTapExport() {
    wx.showToast({ title: '数据导出功能开发中', icon: 'none' });
  },
});
```

- [ ] **Step 2: 我的页面模板**

```xml
<!-- pages/profile/profile.wxml -->
<view class="profile-page">
  <!-- Profile Header -->
  <view class="card profile-header">
    <image class="avatar" src="/assets/sprites/current-pet.png" mode="aspectFit" />
    <view class="profile-info">
      <text class="profile-name">我的小精灵</text>
      <text class="profile-stats">已记账 X 天 · 共 X 笔</text>
    </view>
  </view>

  <!-- Menu Items -->
  <view class="card menu-list">
    <view class="menu-item" wx:for="{{menuItems}}" wx:key="icon" data-url="{{item.url}}" bindtap="onTapMenu">
      <text>{{item.label}}</text>
      <text class="arrow">→</text>
    </view>
  </view>

  <!-- Achievements -->
  <view class="card">
    <text class="section-title">成就徽章</text>
    <view class="achievement-grid">
      <view class="achievement-item {{item.unlocked ? 'unlocked' : 'locked'}}" wx:for="{{achievements}}" wx:key="id">
        <view class="badge">{{item.unlocked ? '🌟' : '🔒'}}</view>
        <text class="achieve-name">{{item.name}}</text>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 3: Commit**

```bash
git add pages/profile/
git commit -m "feat: add profile page with menu and achievements"
```

---

## Phase 6: 辅助页面

### Task 6.1: 预算设置页 budget

**Files:**
- Create: `miniprogram/pages/budget/budget.js`
- Create: `miniprogram/pages/budget/budget.json`
- Create: `miniprogram/pages/budget/budget.wxml`
- Create: `miniprogram/pages/budget/budget.wxss`

- [ ] **Step 1: 实现预算设置**

```javascript
// pages/budget/budget.js
const { getBudget, saveBudget } = require('../../utils/db');
const categoriesData = require('../../data/categories.json');

Page({
  data: {
    period: 'monthly',
    totalBudget: '',
    categoryBudgets: {},
    saving: false,
  },
  onShow() { this.loadBudget(); },
  async loadBudget() {
    const budget = await getBudget();
    if (budget) {
      this.setData({
        period: budget.period || 'monthly',
        totalBudget: budget.totalBudget ? String(budget.totalBudget / 100) : '',
        categoryBudgets: budget.categoryBudgets || {},
      });
    }
  },
  onPeriodChange(e) { this.setData({ period: e.detail.value }); },
  onTotalInput(e) { this.setData({ totalBudget: e.detail.value }); },
  onCategoryInput(e) {
    const { cat } = e.currentTarget.dataset;
    const value = e.detail.value;
    this.setData({ [`categoryBudgets.${cat}`]: value ? Math.round(parseFloat(value) * 100) : undefined });
  },
  async onSave() {
    this.setData({ saving: true });
    try {
      await saveBudget({
        period: this.data.period,
        totalBudget: Math.round(parseFloat(this.data.totalBudget || '0') * 100),
        categoryBudgets: this.data.categoryBudgets,
        updatedAt: new Date().toISOString(),
      });
      wx.showToast({ title: '预算已保存', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add pages/budget/
git commit -m "feat: add budget settings page"
```

### Task 6.2: 精灵收藏馆 collection

**Files:**
- Create: `miniprogram/pages/collection/collection.js`
- Create: `miniprogram/pages/collection/collection.json`
- Create: `miniprogram/pages/collection/collection.wxml`
- Create: `miniprogram/pages/collection/collection.wxss`

- [ ] **Step 1: 实现收藏馆逻辑**

```javascript
// pages/collection/collection.js
const { ALL_PETS, checkPetUnlock } = require('../../utils/pet');

Page({
  data: {
    pets: [],
    currentPetId: '',
    activeTab: 'pets', // 'pets', 'skins', 'accessories'
  },
  onShow() {
    const app = getApp();
    const userStats = app.globalData.userStats || { totalRecords: 0, consecutiveDays: 0 };
    const pets = ALL_PETS.map(p => ({
      ...p,
      unlocked: checkPetUnlock(p.id, userStats).unlocked,
    }));
    this.setData({ pets, currentPetId: app.globalData.currentPet });
  },
  onSelectPet(e) {
    const { id } = e.currentTarget.dataset;
    const pet = this.data.pets.find(p => p.id === id);
    if (!pet || !pet.unlocked) {
      wx.showToast({ title: '尚未解锁', icon: 'none' });
      return;
    }
    const app = getApp();
    app.globalData.currentPet = id;
    this.setData({ currentPetId: id });
    wx.showToast({ title: `已切换为${pet.name}`, icon: 'success' });
  },
  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add pages/collection/
git commit -m "feat: add pet collection gallery page"
```

### Task 6.3: 冒险日记页 adventure-diary

**Files:**
- Create: `miniprogram/pages/adventure-diary/adventure-diary.js`
- Create: `miniprogram/pages/adventure-diary/adventure-diary.json`
- Create: `miniprogram/pages/adventure-diary/adventure-diary.wxml`
- Create: `miniprogram/pages/adventure-diary/adventure-diary.wxss`

- [ ] **Step 1: 实现冒险日记**

```javascript
// pages/adventure-diary/adventure-diary.js
const { getAdventure } = require('../../utils/db');
const { generateMonthStory } = require('../../utils/adventure');

Page({
  data: {
    adventures: [],
    loading: false,
    isEmpty: true,
  },
  onShow() { this.loadAdventures(); },
  async loadAdventures() {
    this.setData({ loading: true });
    try {
      const months = this.getRecentMonths(12);
      const results = [];
      for (const month of months) {
        const adv = await getAdventure(month);
        if (adv) results.push(adv);
      }
      this.setData({ adventures: results, isEmpty: results.length === 0, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  getRecentMonths(count) {
    const months = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  },
  onTapAdventure(e) {
    const { month } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/adventure-diary/adventure-diary?month=${month}` });
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add pages/adventure-diary/
git commit -m "feat: add adventure diary page"
```

---

## Phase 7: 云函数

### Task 7.1: 月度冒险日记生成云函数

**Files:**
- Create: `cloudfunctions/generateAdventure/index.js`
- Create: `cloudfunctions/generateAdventure/package.json`
- Create: `cloudfunctions/generateAdventure/config.json`

- [ ] **Step 1: 创建云函数**

```javascript
// cloudfunctions/generateAdventure/index.js
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // previous month is complete
  const monthStr = `${year}-${String(month === 0 ? 12 : month).padStart(2, '0')}`;
  const targetYear = month === 0 ? year - 1 : year;
  const targetMonth = month === 0 ? 12 : month;

  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${lastDay}`;

  // Get all users
  const usersResult = await db.collection('users').get();
  const users = usersResult.data;

  for (const user of users) {
    try {
      const billsResult = await db.collection('bills')
        .where({ _openid: user._openid, date: _.gte(startDate).and(_.lte(endDate)) })
        .get();

      const bills = billsResult.data;
      const totalExpense = bills.filter(b => b.type === 'expense').reduce((s, b) => s + b.amount, 0);
      const totalIncome = bills.filter(b => b.type === 'income').reduce((s, b) => s + b.amount, 0);

      // Find top category
      const catMap = {};
      bills.filter(b => b.type === 'expense').forEach(b => {
        catMap[b.categoryL1] = (catMap[b.categoryL1] || 0) + b.amount;
      });
      const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

      await db.collection('adventures').add({
        data: {
          _openid: user._openid,
          month: monthStr,
          themeId: user.currentTheme || 'candy-kingdom',
          totalExpense,
          totalIncome,
          topCategory: topCategory ? topCategory[0] : null,
          topCategoryAmount: topCategory ? topCategory[1] : 0,
          recordDays: new Set(bills.map(b => b.date)).size,
          totalRecords: bills.length,
          createdAt: db.serverDate(),
        },
      });
    } catch (e) {
      console.error(`Failed for user ${user._openid}:`, e);
    }
  }

  return { success: true, month: monthStr, userCount: users.length };
};
```

```json
// cloudfunctions/generateAdventure/package.json
{
  "name": "generateAdventure",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "latest"
  }
}
```

```json
// cloudfunctions/generateAdventure/config.json
{
  "triggers": [
    {
      "name": "monthlyTrigger",
      "type": "timer",
      "config": "0 0 9 1 * * *"
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add cloudfunctions/generateAdventure/
git commit -m "feat: add monthly adventure generation cloud function"
```

---

## Phase 8: 整体联调 & 完善

### Task 8.1: 全局样式完善

- [ ] 统一所有页面的糖果色主题变量
- [ ] 确保所有卡片圆角 24rpx、阴影一致
- [ ] 全局字体大小阶梯（22/28/32/36/48 rpx）
- [ ] 空状态组件复用
- [ ] 错误状态组件复用

### Task 8.2: 动画效果

- [ ] 记账成功粒子动画（CSS animation + canvas 粒子）
- [ ] Tab 切换弹跳动画（transition + transform）
- [ ] 精灵表情切换过渡动画
- [ ] 数字翻滚效果（countUp 动画）

### Task 8.3: 完整流程测试

- [ ] 记账 → 查看记录 → 查看统计，完整链路
- [ ] 预算设置 → 超支 → 提醒，预算链路
- [ ] 精灵切换 → 主题切换，系统设置链路
- [ ] 空数据首次使用体验
- [ ] 网络断开错误处理

---

## 验证清单

- [ ] `npx jest tests/utils/` 全部通过
- [ ] 记账一笔后，云数据库 bills 集合有记录
- [ ] 统计页日/周/月/年数据正确
- [ ] 预算环进度显示正确
- [ ] 四级预算提醒触发正确
- [ ] 精灵切换、主题切换功能正常
- [ ] 冒险日记生成云函数可手动触发并正确写入
- [ ] 空状态和错误状态显示正确
- [ ] 微信开发者工具真机调试通过
