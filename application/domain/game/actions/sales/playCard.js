(function ({ cardId, targetPlayerId }, player) {
  this.run('domain.playCard', { cardId, targetPlayerId }, player);

  const card = this.get(cardId);

  if (this.roundStep === 'CROSS_SALES') {
    const round = this.rounds[this.round];
    card.set({ visible: true });
  }
});
