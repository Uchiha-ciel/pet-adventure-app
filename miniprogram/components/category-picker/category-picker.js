const categoriesData = require('../../data/categories.json');

Component({
  properties: {
    type: { type: String, value: 'expense' },
  },
  data: {
    categories: [],
    expandedIndex: -1,
  },
  lifetimes: {
    attached() {
      this.loadCategories();
    },
  },
  observers: {
    'type': function () {
      this.loadCategories();
    },
  },
  methods: {
    loadCategories() {
      const cats = categoriesData[this.properties.type] || [];
      this.setData({ categories: cats, expandedIndex: -1 });
    },
    onTapCategory(e) {
      const index = e.currentTarget.dataset.index;
      this.setData({
        expandedIndex: this.data.expandedIndex === index ? -1 : index,
      });
    },
    onSelectSub(e) {
      const { l1, l2 } = e.currentTarget.dataset;
      this.triggerEvent('select', { categoryL1: l1, categoryL2: l2 });
      this.setData({ expandedIndex: -1 });
    },
  },
});
