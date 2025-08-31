(function ({}, player) {
  const offersMap = {};

  const handCards = player.getHandCards();
  const productCards = handCards.filter((c) => c.subtype === 'product');
  const serviceCards = handCards.filter((c) => c.subtype === 'service');

  for (const product of productCards) {
    const offerKey = [product, ...serviceCards].map((c) => c.name).join('+');
    offersMap[offerKey] = { player, productCards: [product], serviceCards };
  }

  return offersMap;
});
