(function ({ cardId, targetPlayerId }, player) {
  this.run('domain.playCard', { cardId, targetPlayerId }, player);

  const card = this.get(cardId);

  if (card.group === 'service') {
    if (this.roundStep === 'SECOND_OFFER') {
      // все карты на столе уже visible = true
      card.set({ visible: true });
    }
  }
  if (this.roundStep === 'CROSS_SALES') {
    const round = this.rounds[this.round];
    card.set({ visible: true });


    // for (const card of player.decks.product.items()) {
    //   card.set({
    //     eventData: {
    //       playDisabled: null,
    //       activeEvents: [this],
    //       cardClass: 'alert',
    //       buttonText: 'Сбросить карту',
    //     },
    //   });
    // }
  }
});
