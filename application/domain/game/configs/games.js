() => ({
  sales: {
    ...{ title: 'Банк-продаж', icon: ['fas', 'cash-register'] },
    items: {
      default: {
        title: 'Дуэль',
      },
      ai: {
        title: 'Один игрок',
        difficulty: [
          { code: 'weak', title: 'Слабый' },
          { code: 'strong', title: 'Сильный' },
        ],
      },
      // добавить два уровня сложности: с подсказками (расчет текущей суммы сделки) и без них
    },
    itemsDefault: {
      timer: (baseTimer) => {
        return {
          DEFAULT: baseTimer,
          CROSS_SALES: Math.ceil(baseTimer / 2),
          PRESENT: Math.ceil(baseTimer / 3),
          SHOW_RESULTS: Math.max(5, Math.ceil(baseTimer / 5)),
          CARD_DROP: Math.max(5, Math.ceil(baseTimer / 5)),
        };
      },
      winMoneySum: 2000,
      cardsToRemove: [],
      playerHand: {
        product: {
          start: 5,
          limit: 7,
        },
        service: {
          start: 5,
          limit: 7,
        },
      },
      autoFinishAfterRoundsOverdue: 10,
      centralBankRate: 18,

      playerList: [
        {
          _code: 1,
          active: true,
          deckList: [
            { type: 'card', subtype: 'product' },
            { type: 'card', subtype: 'service' },
            { type: 'card', subtype: 'played', placement: 'table' },
          ],
        },
        {
          _code: 2,
          active: true,
          deckList: [
            { type: 'card', subtype: 'product' },
            { type: 'card', subtype: 'service' },
            { type: 'card', subtype: 'played', placement: 'table' },
          ],
        },
      ],
      deckList: [
        { type: 'card', subtype: 'product', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'service', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'client', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'feature', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'drop', placement: 'drop' },
        { type: 'card', subtype: 'zone_client', placement: 'table', access: 'all' },
        { type: 'card', subtype: 'zone_feature', placement: 'table' },
      ],
    },
  },
  poker: {
    ...{ title: 'Бизнес-покер', icon: ['fas', 'fa-coins'] },
    items: {
      default: {
        title: 'Стандарт',
        maxPlayersInGame: '2-8',
        minPlayersToStart: 2,
      },
    },
    itemsDefault: {
      timer: (baseTimer) => {
        return {
          DEFAULT: baseTimer,
          SHOW_RESULTS: Math.max(15, Math.ceil(baseTimer / 2)),
        };
      },
      cardsToRemove: [
        ...['friend1', 'friend2', 'present1', 'present2', 'problem1', 'problem2', 'problem3', 'problem4'],
        ...['credit_limit1', 'credit_limit2', 'credit_limit3', 'credit_limit4', 'credit_limit5', 'credit_limit6'],
        ...['cross_sale1', 'cross_sale2', 'cross_sale3', 'cross_sale4', 'cross_sale5', 'cross_sale6'],
      ],
      playerHand: {},
      autoFinishAfterRoundsOverdue: 10,
      playerStartMoney: 10000,
      bigBlindSum: 100,
      centralBankRate: 18,

      playerTemplates: {
        default: {
          deckList: [
            { type: 'card', subtype: 'hand' },
            { type: 'card', subtype: 'played', placement: 'table', access: 'all' },
          ],
        },
      },

      playerList: [],
      deckList: [
        { type: 'card', subtype: 'product', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'service', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'client', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'feature', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'scoring', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'zone_flop', placement: 'table' },
        { type: 'card', subtype: 'zone_turn', placement: 'table' },
        { type: 'card', subtype: 'zone_river', placement: 'table' },
      ],
    },
  },
});
