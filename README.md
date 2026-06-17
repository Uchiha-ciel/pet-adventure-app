# 🐱 钱罐小精灵 — 宠物冒险记账小程序

一款以「宠物养成 + 冒险故事」为核心玩法的微信记账小程序。记账 = 喂养小精灵 + 开启月度冒险，让每一笔收支都变得有趣。

## ✨ 核心玩法

- **记账 = 冒险燃料**：每记一笔账，小精灵获得冒险能量。收入是发现金币宝藏，消费是探索世界
- **月度冒险章节**：每月一个随机主题（糖果王国、海底奇遇、星空漫游…），月底生成冒险日记回顾
- **精灵养成**：12 种基础精灵 + 12 种稀有/节日限定精灵，记账解锁
- **丰富收集**：每种精灵 6 种配色、30+ 配饰、20 个常驻主题 + 10 个节日主题

## 📱 功能

| 功能 | 说明 |
|------|------|
| 记账 | 两级分类（支出 10 大类 42 细分 + 收入 6 大类 18 细分），数字键盘，日期备注 |
| 预算 | 月/周总预算 + 分类预算，50%/80%/100%/超支四级精灵提醒 |
| 统计 | 日/周/月/年收支统计，分类排行，趋势对比，糖果色图表 |
| 小岛 | 精灵互动首页，今日速览，冒险进度，心情表情 |
| 记录 | 日历热力图，日期分组账单，搜索筛选，左滑删除 |
| 收藏馆 | 精灵切换，皮肤配色，配饰搭配 |
| 冒险日记 | 月度故事回顾，精灵冒险插画 |
| 成就 | 记账里程碑徽章，连续天数奖励 |

## 🛠 技术栈

- **前端**：微信原生小程序 + WeUI 扩展
- **后端**：微信云开发（云数据库 + 云函数 + 云存储）
- **测试**：Jest，45 个测试用例，TDD 开发
- **数据库**：MongoDB 文档型（云开发数据库）

## 📂 项目结构

```
miniprogram/
├── pages/
│   ├── island/           # 小岛首页（精灵互动）
│   ├── statistics/       # 统计页（日/周/月/年）
│   ├── records/          # 记录列表
│   ├── profile/          # 我的（菜单+成就）
│   ├── add-record/       # 记账弹窗
│   ├── budget/           # 预算设置
│   ├── adventure-diary/  # 冒险日记
│   ├── collection/       # 精灵收藏馆
│   └── category-mgmt/    # 分类管理
├── components/
│   ├── budget-ring/      # 预算进度环
│   └── category-picker/  # 分类选择器
├── utils/                # 工具模块（stats/budget/pet/adventure/db）
├── data/                 # 静态数据（categories/pets/themes）
├── tests/                # Jest 测试（4 套件 45 测试）
└── cloudfunctions/
    └── generateAdventure/ # 月度冒险日记生成（定时触发）
```

## 🚀 快速开始

### 前置条件

1. 注册[微信小程序](https://mp.weixin.qq.com/)，获取 AppID
2. 开通云开发，获取环境 ID
3. 安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 配置

1. 将 AppID 填入 `miniprogram/project.config.json` 的 `appid` 字段
2. 将云环境 ID 填入 `miniprogram/app.js` 的 `env` 字段
3. 在云开发控制台创建数据库集合：`bills`、`budgets`、`users`、`adventures`
4. 用微信开发者工具打开 `miniprogram/` 目录

### 运行测试

```bash
cd miniprogram
npm install
npx jest tests/utils/ --verbose
```

### 部署云函数

在微信开发者工具中，右键 `cloudfunctions/generateAdventure` → 上传并部署。

## 🎨 配色

| 用途 | 色值 |
|------|------|
| 主色（草莓粉） | `#FF6B8A` |
| 收入（薄荷绿） | `#4ECDC4` |
| 支出（蜜橘橙） | `#FF8C5A` |
| 背景（奶油白） | `#FFF8F0` |
| 强调（柠檬黄） | `#FFE66D` |

## 📝 开发方式

本项目采用 **TDD（测试驱动开发）**，所有工具函数先写测试，确认失败后再实现：

```
RED → Verify RED → GREEN → Verify GREEN → REFACTOR → Commit
```

## 📄 License

MIT
