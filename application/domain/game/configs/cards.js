() => ({
  path: (card) => `${card.group}/${card.name}.png`,
  list: [
    {
      ...{ group: 'product', name: 'g_autocredit', title: 'Автокредит' },
      ...{ stars: 2, price: 10, priceGroup: ['cheap'] },
    },
    {
      ...{ group: 'product', name: 'g_mortgage', title: 'Ипотека' },
      ...{ stars: 2, price: 10, priceGroup: ['cheap'] },
    },
    {
      ...{ group: 'product', name: 'g_deposit', title: 'Депозит' },
      ...{ stars: 1, price: 4, priceGroup: ['cheap'], depositIncome: true },
    },
    {
      ...{ group: 'product', name: 'g_credit', title: 'Кредит наличными' },
      ...{ stars: 1, price: 15, priceGroup: ['cheap'] },
    },
    {
      ...{ group: 'product', name: 'g_creditcard', title: 'Кредитная карта' },
      ...{ stars: 1, price: 20, priceGroup: ['cheap'] },
    },
    {
      ...{ group: 'product', name: 'g_bankcard', title: 'Дебетовая карта' },
      ...{ price: 1, priceGroup: ['cheap'], depositIncome: true, present: true },
    },
    { group: 'product', name: 'g_safebox', title: 'Сейфовая ячейка', price: 1, priceGroup: ['cheap'], present: true },
    { group: 'product', name: 'g_exchange', title: 'Обмен валюты', price: 2, priceGroup: ['cheap'] },

    { group: 'service', name: 'mobile_bank1', title: 'Мобильный банк', priceGroup: ['tech'], present: true },
    { group: 'service', name: 'vip1', title: 'VIP обслуживание', priceGroup: ['vip'], present: true },
    { group: 'service', name: 'on_record1', title: 'По записи', priceGroup: ['speed'] },
    { group: 'service', name: 'quick_pass1', title: 'Без очереди', priceGroup: ['speed'] },
    { group: 'service', name: 'event1', title: 'Акция', priceGroup: ['cheap'] },
    { group: 'present', name: 'present1', title: 'Подарок', present: true },
    { group: 'present', name: 'present2', title: 'Подарок', present: true },
    { group: 'present', name: 'present3', title: 'Подарок', present: true },

    { group: 'client', name: 'programmer', title: 'Программист', risk: 1, money: 1500, priceGroup: ['tech'] },
    { group: 'client', name: 'pensioner', title: 'Пенсионер', risk: 1, money: 500, priceGroup: ['speed'] },
    { group: 'client', name: 'entrepreneur', title: 'Предприниматель', risk: 1, money: 2000, priceGroup: ['cheap'] },
    { group: 'client', name: 'major', title: 'Мажор', risk: 3, money: 1500, priceGroup: ['speed', 'vip'] },
    { group: 'client', name: 'director', title: 'Директор завода', risk: 1, money: 2500, priceGroup: ['cheap', 'vip'] },
    { group: 'client', name: 'young_mom', title: 'Молодая мама', risk: 1, money: 500, priceGroup: ['cheap', 'speed'] },

    { group: 'feature', name: 'regular_client', title: 'Постоянный клиент', priceGroup: ['vip'] },
    { group: 'feature', name: 'another_city1', title: 'Живет в другом городе', priceGroup: ['tech'] },
    { group: 'feature', name: 'urgently1', title: 'Нужно срочно', priceGroup: ['speed'] },
    { group: 'feature', name: 'promotion1', title: 'По акции', priceGroup: ['cheap'] },
    { group: 'feature', name: 'friend1', title: 'Привел друга', reference: true },
    { group: 'feature', name: 'problem1', title: 'Проблемный клиент' },
  ],
});
