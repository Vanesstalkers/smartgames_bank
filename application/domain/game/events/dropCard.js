() => ({
  name: 'dropCard',
  init() {
    const { game, player } = this.eventContext();
    const {
      settings: {
        playerHand: {
          product: { limit: productLimit },
          service: { limit: serviceLimit },
        },
      },
    } = game;

    const productCards = player.decks.product.items();
    const serviceCards = player.decks.service.items();

    for (const card of [...productCards, ...serviceCards]) {
      card.set({ eventData: { playDisabled: true } });
    }

    if (productCards.length > productLimit) {
      for (const card of productCards) {
        card.set({
          eventData: {
            playDisabled: null,
            activeEvents: [this],
            cardClass: 'alert',
            buttonText: 'Сбросить карту',
          },
        });
      }
    }
    if (serviceCards.length > serviceLimit) {
      for (const card of serviceCards) {
        card.set({
          eventData: {
            playDisabled: null,
            activeEvents: [this],
            cardClass: 'alert',
            buttonText: 'Сбросить карту',
          },
        });
      }
    }
  },
  handlers: {
    RESET() {
      const { game, player, source, sourceId } = this.eventContext();

      player.decks.product.updateAllItems({
        eventData: { playDisabled: null, activeEvents: [], cardClass: null, buttonText: null },
      });
      player.decks.service.updateAllItems({
        eventData: { playDisabled: null, activeEvents: [], cardClass: null, buttonText: null },
      });

      this.destroy();
    },
    TRIGGER({ target }) {
      const { game, player } = this.eventContext();
      const {
        decks: { drop: dropDeck },
        settings: {
          playerHand: {
            product: { limit: productLimit },
            service: { limit: serviceLimit },
          },
        },
      } = game;

      target.moveToTarget(dropDeck);
      target.set({
        eventData: { cardClass: null, buttonText: null },
      });

      const excessProductCardsCount = player.decks.product.itemsCount() - productLimit;
      const excessServiceCardsCount = player.decks.service.itemsCount() - serviceLimit;

      if (excessProductCardsCount <= 0) {
        player.decks.product.updateAllItems({
          eventData: { playDisabled: true, activeEvents: [], cardClass: null, buttonText: null },
        });
      }
      if (excessServiceCardsCount <= 0) {
        player.decks.service.updateAllItems({
          eventData: { playDisabled: true, activeEvents: [], cardClass: null, buttonText: null },
        });
      }

      if (excessProductCardsCount > 0 || excessServiceCardsCount > 0) {
        return { preventListenerRemove: true };
      }

      this.emit('RESET');
      game.run('roundEnd', {}, player);
    },
    ROUND_END() {
      const { game, player } = this.eventContext();
      const {
        decks: { drop: dropDeck },
        settings: {
          playerHand: {
            product: { limit: productLimit },
            service: { limit: serviceLimit },
          },
        },
      } = game;

      const excessProductCardsCount = player.decks.product.itemsCount() - productLimit;
      const excessServiceCardsCount = player.decks.service.itemsCount() - serviceLimit;

      if (excessProductCardsCount > 0)
        player.decks.product.moveRandomItems({ count: excessProductCardsCount, target: dropDeck });

      if (excessServiceCardsCount > 0)
        player.decks.service.moveRandomItems({ count: excessServiceCardsCount, target: dropDeck });

      this.emit('RESET');
    },
  },
});
