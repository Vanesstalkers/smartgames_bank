(function ({ offersMap }) {
  const { centralBankRate } = this.settings;
  const { clientCard, featureCard } = this.rounds[this.round];
  const offers = [];

  const priceGroup = [...clientCard.priceGroup];
  if (featureCard.priceGroup) priceGroup.push(...featureCard.priceGroup);

  for (const { player, productCards, serviceCards } of Object.values(offersMap)) {
    const offer = { player, priceGroup: [] };
    try {
      offer.player = player;
      offer.productCards = productCards;
      offer.serviceCards = serviceCards;

      offer.priceGroup.push(...productCards.map((card) => card.priceGroup).flat());

      for (const card of serviceCards) {
        if (!card.priceGroup?.length) continue;
        offer.priceGroup.push(...card.priceGroup);
      }
      offer.priceGroupMatches = offer.priceGroup.filter((group) => priceGroup.includes(group));

      const offerCards = [...productCards, ...serviceCards];
      offer.stars = offerCards.reduce((sum, card) => sum + card.stars || 0, 0);
      offer.price = productCards.reduce((sum, card) => {
        const price = (clientCard.money * (card.depositIncome ? centralBankRate - card.price : card.price)) / 100;
        console.info(card.price, price, clientCard.money, card.name);
        return sum + price;
      }, 0);
    } catch (err) {
      if (err === 'no_product') continue;
      else throw err;
    }

    if (offer.priceGroupMatches.length) offers.push(offer);
  }

  const bestOffer = { priceGroupMatchesCount: 0, stars: 0 };
  for (const { player, ...offer } of offers) {
    if (bestOffer.priceGroupMatchesCount < offer.priceGroupMatches.length) {
      bestOffer.priceGroupMatchesCount = offer.priceGroupMatches.length;
      bestOffer.player = player;
      bestOffer.productCards = offer.productCards;
      bestOffer.serviceCards = offer.serviceCards;
      bestOffer.price = offer.price;
    } else if (bestOffer.priceGroupMatchesCount == offer.priceGroupMatches.length && bestOffer.stars < offer.stars) {
      bestOffer.priceGroupMatchesCount = offer.priceGroupMatches.length;
      bestOffer.player = player;
      bestOffer.productCards = offer.productCards;
      bestOffer.serviceCards = offer.serviceCards;
      bestOffer.price = offer.price;
    }
  }
  return { bestOffer, relevantOffers: offers };
});
