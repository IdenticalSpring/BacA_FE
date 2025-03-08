export default {
  install(Vue) {
    Vue.prototype.THEME_LIST = [
      {
        label: 'Mixed Themes',
        key: 'mixins'
      },
      {
        label: 'Light theme',
        key: 'white'
      },
      {
        label: 'Dark theme',
        key: 'dark'
      }
    ];
    Vue.prototype.SKILL_LIST = [
      {
        label: 'Lightning Five Whips',
        key: 1
      },
      {
        label: 'Sneak Attack',
        key: 2
      },
      {
        label: 'Mouse tail juice',
        key: 3
      },
      {
        label: 'Crow on a plane',
        key: 4
      },
      {
        label: 'Tornado destroys parking lot',
        key: 5
      },
      {
        label: 'Awesome',
        key: 6
      },
      {
        label: 'So hi',
        key: 7
      },
      {
        label: 'A werewolf',
        key: 8
      },
      {
        label: 'Rain Girl No Melon',
        key: 9
      },
      {
        label: '996',
        key: 10
      }
    ];

    Vue.prototype.LAYOUT_LIST = [
      {
        label: 'Left navigation',
        key: 'inline'
      },
      {
        label: 'Header Navigation',
        key: 'horizontal'
      }
    ];
  }
};
