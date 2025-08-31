(function ({ offersMap, checkRisk = false }) {
  const { centralBankRate } = this.settings;
  const { clientCard, featureCard, scoringCard } = this.rounds[this.round];
  const offers = [];

  const priceGroup = [...clientCard.priceGroup];
  if (featureCard.priceGroup) priceGroup.push(...featureCard.priceGroup);

  for (const { player, productCards, serviceCards } of Object.values(offersMap)) {
    const offer = { player, priceGroup: [], creditLimit: 1 };
    try {
      offer.player = player;
      offer.productCards = productCards;
      offer.serviceCards = serviceCards;

      offer.priceGroup.push(...productCards.map((card) => card.priceGroup).flat());

      for (const card of serviceCards) {
        if (card.creditLimit) offer.creditLimit += card.creditLimit / 100;
        if (!card.priceGroup?.length) continue;
        offer.priceGroup.push(...card.priceGroup);
      }
      offer.priceGroup = [...new Set(offer.priceGroup)];
      offer.priceGroupMatches = offer.priceGroup.filter((group) => priceGroup.includes(group));

      const offerCards = [...productCards, ...serviceCards];
      offer.stars = offerCards.reduce((sum, card) => sum + (card.stars || 0), 0);
      offer.price = productCards.reduce((sum, card) => {
        const incomeRate = card.depositIncome
          ? centralBankRate - card.price
          : card.risk
          ? card.price - centralBankRate
          : card.price;
        const price = (offer.creditLimit * clientCard.money * incomeRate) / 100;
        return sum + price;
      }, 0);
    } catch (err) {
      if (err === 'no_product') continue;
      else throw err;
    }

    if (offer.priceGroupMatches.length) offers.push(offer);
  }

  const bestOffer = { priceGroupMatchesCount: 0, stars: 0 };
  const riskOffers = [];

  const updateBestOffer = (player, offer) => {
    bestOffer.priceGroupMatchesCount = offer.priceGroupMatches.length;
    bestOffer.player = player;
    bestOffer.productCards = offer.productCards;
    bestOffer.serviceCards = offer.serviceCards;
    bestOffer.price = offer.price;
    bestOffer.stars = offer.stars;
  };

  const shouldUpdateBestOffer = (offer) => {
    const productCard = offer.productCards[0];
    const matchesCount = offer.priceGroupMatches.length;
    const currentMatchesCount = bestOffer.priceGroupMatchesCount;

    if (checkRisk && productCard.risk && productCard.risk + scoringCard.risk < clientCard.risk) {
      riskOffers.push({
        productName: productCard.name,
        productRisk: productCard.risk,
        scoringRisk: scoringCard.risk,
        clientRisk: clientCard.risk,
      });
      return false;
    }

    if (currentMatchesCount < matchesCount) {
      return true;
    }

    if (currentMatchesCount === matchesCount && bestOffer.stars < offer.stars) {
      return true;
    }

    if (currentMatchesCount === matchesCount && bestOffer.stars === offer.stars && bestOffer.price > offer.price) {
      return true;
    }

    return false;
  };

  for (const { player, ...offer } of offers) {
    if (shouldUpdateBestOffer(offer)) {
      updateBestOffer(player, offer);
    }
  }
  return { bestOffer, relevantOffers: offers, riskOffers };
});
