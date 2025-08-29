(class Card extends lib.game._objects.Card {
  constructor(data, { parent }) {
    super(data, { parent });
    this.broadcastableFields(
      this.broadcastableFields().concat(
        // добавляем недостающие поля
        ['price', 'money', 'group', 'stars', 'risk', 'priceGroup', 'depositIncome', 'present', 'crossSales']
      )
    );

    this.set(data);
  }
});
