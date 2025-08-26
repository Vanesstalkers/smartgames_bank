(function () {
  const {
    rounds,
    round: roundNumber,
    decks,
    settings: {
      timer,
      winMoneySum,
      playerHand: {
        product: { limit: productLimitInHand },
      },
    },
  } = this;
  const round = rounds[roundNumber];
  const players = this.players();
  const result = { newRoundLogEvents: [], newRoundNumber: roundNumber };

  const addNewRoundCardsToPlayers = () => {
    const dropCardsPlayers = [];
    for (const player of players) {
      // добавляем новые карты в руку
      const productCard = decks.product.getRandomItem();
      if (productCard) productCard.moveToTarget(player.decks.product);
      const serviceCard = decks.service.getRandomItem();
      if (serviceCard) serviceCard.moveToTarget(player.decks.service);

      const tooManyCardsInHand = player.decks.product.itemsCount() > productLimitInHand;
      if (tooManyCardsInHand) dropCardsPlayers.push(player);
    }
    return { dropCardsPlayers };
  };

  const prepareSecondOfferStep = () => {
    const { roundStepWinner: player } = round;

    player.notifyUser(
      'Добавь в сделку нужное количество сервисов. При превышении бюджета клиента сделка будет отменена.' // TODO
    );
    player.activate({ setData: { eventData: { controlBtn: { label: 'Завершить сделку' } } } });

    result.newRoundLogEvents.push(`Начались кросс-продажи клиенту.`);
    result.statusLabel = this.stepLabel('Кросс-продажи');
    result.roundStep = 'SECOND_OFFER';

    if (player.ai) return { ...result, forcedEndRound: true };
    return { ...result, timerRestart: timer.SECOND_OFFER };
  };

  const showTableCards = () => {
    const { featureCard } = round;
    const { zone_feature: featureZone } = decks;

    featureZone.setItemVisible(featureCard);

    for (const player of players) {
      const tableZones = player.select('Deck').filter(({ placement }) => placement == 'table');
      for (const zone of tableZones) {
        for (const card of zone.select('Card')) {
          zone.setItemVisible(card);
        }
      }
    }
  };

  const restorePlayersHands = () => {
    const { roundStepWinner } = round;
    for (const player of players) {
      if (player === roundStepWinner) continue; // карты победителя сбрасываются
      player.returnTableCardsToHand();
    }
  };

  const removeTableCards = () => {
    const tableDecks = this.select({ className: 'Deck', attr: { placement: 'table' } });
    for (const deck of tableDecks) {
      deck.moveAllItems({ toDrop: true, setData: { visible: false } });
    }
  };

  switch (this.roundStep) {
    case 'ROUND_START': {
      result.newRoundNumber++;
      result.newRoundLogEvents.push(`<a>Начало раунда №${result.newRoundNumber}.</a>`);

      this.set({ round: result.newRoundNumber });
      const round = this.prepareRoundObject();
      const { client: clientDeck, feature: featureDeck } = decks;
      const { zone_client: clientZone, zone_feature: featureZone } = decks;

      round.clientCard = clientDeck.getRandomItem();
      round.clientCard.moveToTarget(clientZone);
      round.featureCard = featureDeck.getRandomItem();
      round.featureCard.moveToTarget(featureZone);

      this.activatePlayers({
        notifyUser: 'Сделай свое предложение клиенту (один продукт и сколько угодно сервисов)',
        setData: {
          eventData: { playDisabled: null, controlBtn: { label: 'Сделать предложение' } },
        },
      });

      result.statusLabel = `Раунд ${result.newRoundNumber} (Первое предложение)`;
      result.roundStep = 'FIRST_OFFER';

      for (const player of this.players({ ai: true })) {
        const cards = [];
        switch (this.difficulty) {
          case 'weak':
            const card = player.decks.product.getRandomItem();
            if (card) cards.push(card);
            break;
          case 'strong':
            const offers = Object.values(player.getAvailableOffers({ clientCard: round.clientCard })); // TODO
            const offer = offers[Math.floor(Math.random() * offers.length)];
            if (offer) {
              cards.push(offer.productCard);
              cards.push(...offer.serviceCards);
            }
            break;
        }
        player.aiActions.push(...cards.map((c) => ({ action: 'playCard', data: { cardId: c.id() } })));
      }

      const notAIPlayers = this.getActivePlayers().filter((p) => !p.ai);
      if (notAIPlayers.length === 0) result.forcedEndRound = true;

      return result;
    }

    case 'FIRST_OFFER': {
      showTableCards();

      const offersMap = {};
      for (const player of players) {
        const productCard = player.decks.played.items().find((c) => c.subtype === 'product');
        if (!productCard) continue;

        offersMap[productCard.id()] = {
          player,
          productCard,
          serviceCards: player.decks.played.items().filter((c) => c.subtype === 'service'),
        };
      }

      // TODO
      /* const { bestOffer, offersCount } = this.selectBestOffer(offersMap);
      const { player, productCard } = bestOffer;

      if (!player) {
        if (offersCount > 0) {
          result.newRoundLogEvents.push(`Клиента не устроило ни одно из предложений.`);
          result.statusLabel = this.stepLabel('Результаты раунда');
          result.roundStep = 'SHOW_RESULTS';
        } else {
          result.roundStep = 'CARD_DROP';
        }
        return { ...result, forcedEndRound: true };
      } */

      const player = players.find((p) => !p.ai);
      const productCard = player.decks.played.items().find((c) => c.subtype === 'product');

      round.roundStepWinner = player;
      result.newRoundLogEvents.push(`Клиента заинтересовал продукт "${productCard.title}".`);

      // у всех карт, выложенных на стол, убираем возможность возврата карты в руку делать через блокировку deck нельзя, потому что позже в нее будут добавляться дополнительные карты
      for (const deck of player.select({ className: 'Deck', attr: { placement: 'table' } })) {
        for (const card of deck.select('Card')) {
          card.set({ eventData: { playDisabled: true } });
        }
      }

      round.featureCard.play({ player });

      if (player.findEvent({ present: true })) {
        result.statusLabel = this.stepLabel('Подарок клиенту');
        result.roundStep = 'PRESENT';
        result.newRoundLogEvents.push(`Происходит выбор подарка клиенту.`);
        player.activate();

        if (player.ai) {
          player.decks.service.set({ eventData: { playDisabled: null } });
          return { ...result, forcedEndRound: true };
        }
        return { ...result, timerRestart: timer.PRESENT };
      }

      return prepareSecondOfferStep();
    }

    case 'PRESENT': {
      const { roundStepWinner: player } = round;

      player.decks.service.set({
        eventData: { playDisabled: null }, // мог быть выставлен playDisabled после present-event
      });

      result.newRoundLogEvents.push(`Начались продажи дополнительных сервисов клиенту.`); // TODO
      result.statusLabel = this.stepLabel('Дополнительные продажи');
      result.roundStep = 'SECOND_OFFER';
      return prepareSecondOfferStep();
    }

    case 'SECOND_OFFER': {
      const { featureCard, roundStepWinner: player } = round;

      // TODO
      /*       const { fullPrice, productTitle } = this.calcOffer({
        player,
        productCard: player.decks.played.items().find((c) => c.subtype === 'product'),
        serviceCards: player.decks.played.items().filter((c) => c.subtype === 'service'),
        featureCard,
      });

      if (fullPrice <= round.clientMoney) {
        // TODO
        result.newRoundLogEvents.push(
          `Клиент приобрел продут "${productTitle}" за ${new Intl.NumberFormat().format((fullPrice || 0) * 1000)}₽.`
        );

        const money = player.money + fullPrice;
        player.set({ money });

        if (money >= winMoneySum) return this.run('endGame', { winningPlayer: player });
      } else {
        result.newRoundLogEvents.push(`Клиент отказался от сделки из-за превышения допустимой стоимости сервисов.`); // TODO
        delete round.roundStepWinner;
      } */

      result.statusLabel = this.stepLabel('Результаты раунда');
      result.roundStep = 'SHOW_RESULTS';
      return { ...result, forcedEndRound: true };
    }

    case 'SHOW_RESULTS': {
      this.activatePlayers({
        setData: { eventData: { playDisabled: true, controlBtn: { label: 'Завершить раунд' } } },
        disableSkipTurnCheck: true,
      });
      result.roundStep = 'CARD_DROP';
      return { ...result, timerRestart: timer.SHOW_RESULTS };
    }

    case 'CARD_DROP': {
      const { roundStepWinner, featureCard } = round;
      const emptyClientDeck = decks.client.itemsCount() === 0;
      const emptyFeatureDeck = decks.feature.itemsCount() === 0;
      if (emptyClientDeck || emptyFeatureDeck) {
        result.newRoundLogEvents.push(`В колоде закончились карты ${emptyClientDeck ? 'клиентов' : 'сервисов'}.`);
        return this.checkWinnerAndFinishGame();
      }

      restorePlayersHands();

      if (roundStepWinner) {
        roundStepWinner.decks.product.set({
          eventData: { playDisabled: null }, // мог быть выставлен playDisabled после present-event
        });
      }

      result.statusLabel = this.stepLabel('Окончание раунда');
      result.roundStep = 'ROUND_END';

      if (featureCard.reference && roundStepWinner) {
        // дополнительный клиент (играем без добавления карт в руку)

        for (const player of players) {
          if (player === roundStepWinner) continue;
          player.set({ eventData: { skipTurn: true } });
        }
      } else {
        // чтобы не было лишней логики в первом раунде, карты в руку добавляем в конце раунда

        const { dropCardsPlayers } = addNewRoundCardsToPlayers();
        if (dropCardsPlayers.length) {
          let onlyAIPlayers = true;

          for (const player of dropCardsPlayers) {
            player.initEvent('dropCard', { player });

            if (player.ai) continue;
            onlyAIPlayers = false;

            player.activate({
              notifyUser: `Выбери карты, которые хочешь сбросить. В руке должно остаться не больше ${productLimitInHand} карт продуктов.`,
              setData: { eventData: { playDisabled: null, controlBtn: { label: 'Сбросить' } } },
            });
          }

          result.forcedEndRound = onlyAIPlayers ? true : false;
          result.timerRestart = onlyAIPlayers ? null : timer.CARD_DROP;
          return result;
        }
      }

      return { ...result, forcedEndRound: true };
    }

    case 'ROUND_END': {
      removeTableCards();
      round.roundStepWinner = null;

      result.roundStep = 'ROUND_START';
      return { ...result, forcedEndRound: true };
    }
  }
});
