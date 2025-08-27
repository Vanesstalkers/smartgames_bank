(function ({ offersMap }) {
  const { clientCard, featureCard } = this.rounds[this.round];
  const offers = [];

  const priceGroup = [...clientCard.priceGroup];
  if (featureCard.priceGroup) priceGroup.push(...featureCard.priceGroup);

  for (const { player, productCard, serviceCards } of Object.values(offersMap)) {
    const offer = { player, priceGroup: [] };
    try {
      // offer = this.calcOffer({ player, productCard, serviceCards, featureCard });
      offer.player = player;
      offer.productCard = productCard;
      offer.priceGroup.push(...productCard.priceGroup);
      offer.serviceCards = serviceCards;
      for (const card of serviceCards) {
        if (!card.priceGroup?.length) continue;
        offer.priceGroup.push(...card.priceGroup);
      }
      offer.priceGroupMatches = offer.priceGroup.filter((group) => priceGroup.includes(group));
    } catch (err) {
      if (err === 'no_car') continue;
      else throw err;
    }

    if (offer.priceGroupMatches.length) offers.push(offer);
  }

  const bestOffer = {};
  for (const { player, ...offer } of offers) {
    Object.assign(bestOffer, { player, ...offer });
    break;
    // if (bestOffer.stars < offer.stars || (bestOffer.stars == offer.stars && bestOffer.price > offer.fullPrice)) {
    //   bestOffer.carCard = offer.carCard;
    //   bestOffer.serviceCards = offer.serviceCards;
    //   bestOffer.price = offer.fullPrice;
    //   bestOffer.player = player;
    //   bestOffer.stars = offer.stars;
    // }
  }
  return { bestOffer, relevantOffers: offers };
});
