export default [
  {
    path: '/game/bank/poker/:id',
    name: 'Bank Poker Game',
    component: function () {
      return import('./pokerGame.vue');
    },
  },
  {
    path: '/game/bank/:type/:id',
    name: 'Bank Game',
    component: function () {
      return import('./Game.vue');
    },
  },
];
