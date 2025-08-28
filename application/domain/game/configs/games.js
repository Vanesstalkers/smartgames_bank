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
      centralBankRate: 18,
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
      cardsToRemove: [],
      playerHand: {},
      autoFinishAfterRoundsOverdue: 10,
      playerStartMoney: 10000,
      bigBlindSum: 100,

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
        { type: 'card', subtype: 'car', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'service', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'client', placement: 'main', hasDrop: true },
        // { type: 'card', subtype: 'credit', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'feature', placement: 'main', hasDrop: true },
        { type: 'card', subtype: 'zone_client', placement: 'table' },
        { type: 'card', subtype: 'zone_feature', placement: 'table' },
        // { type: 'card', subtype: 'zone_credit', placement: 'table' },
      ],
    },
  },
});
