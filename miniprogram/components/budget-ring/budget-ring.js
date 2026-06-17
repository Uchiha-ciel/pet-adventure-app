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
    colors: {
      safe: '#4ECDC4',
      half: '#FFE66D',
      warning: '#FF8C5A',
      critical: '#FF4757',
      over: '#FF4757',
    },
  },
  observers: {
    'spent, budget': function (spent, budget) {
      const pct = calculateBudgetProgress(spent, budget);
      const level = getBudgetWarningLevel(pct);
      this.setData({ percentage: pct, level });
    },
  },
  methods: {
    getColor() {
      return this.data.colors[this.data.level] || this.data.colors.safe;
    },
    getDashArray() {
      const pct = this.data.percentage;
      const circumference = 2 * Math.PI * 42;
      const filled = (pct / 100) * circumference;
      return `${filled} ${circumference - filled}`;
    },
  },
});
