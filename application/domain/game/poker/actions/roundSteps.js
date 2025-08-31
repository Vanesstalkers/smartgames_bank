(function () {
  const {
    rounds,
    round: roundNumber,
    decks,
    settings: { timer, bigBlindSum },
  } = this;
  const round = rounds[roundNumber] || {};
  const { currentPlayer, bigBlindPlayer, smallBlindPlayer: prevSmallBlindPlayer } = round;
  const players = Object.keys(round?.bets || {}).map((id) => this.store.player[id]);
  const result = { newRoundLogEvents: [], newRoundNumber: roundNumber };

  function initBetEvent(player) {
    player.initEvent(domain.game.poker.events.betEvent());
  }

  switch (this.roundStep) {
    case 'ROUND_START': {
      const players = this.players();

      result.newRoundNumber++;
      result.newRoundLogEvents.push(`<a>Начало раунда №${result.newRoundNumber}.</a>`);

      this.set({ round: result.newRoundNumber });

      const round = this.prepareRoundObject();
      round.step = 'flop';
      round.pot = 0;

      const handCardsCount = players.length < 5 ? 4 : players.length < 7 ? 3 : 2;

      const requiredCardsCount = handCardsCount * players.length;
      if (decks.product.itemsCount() < requiredCardsCount) decks.product_drop.moveAllItems({ toDeck: true });
      if (decks.service.itemsCount() < requiredCardsCount) decks.service_drop.moveAllItems({ toDeck: true });

      if (decks.client.itemsCount() === 0) decks.client_drop.moveAllItems({ toDeck: true });
      if (decks.feature.itemsCount() === 0) decks.feature_drop.moveAllItems({ toDeck: true });
      if (decks.scoring.itemsCount() === 0) decks.scoring_drop.moveAllItems({ toDeck: true });

      round.bets = {};
      for (const player of players) {
        round.bets[player.id()] = { amount: 0, raiseCount: 0 };

        if (player.money < bigBlindSum) {
          round.bets[player.id()].out = true;
          continue;
        }

        const moveConfig = {
          count: handCardsCount,
          target: player.decks.hand,
          setData: { eventData: { playDisabled: true } },
        };
        decks.product.moveRandomItems(moveConfig);
        decks.service.moveRandomItems(moveConfig);
      }

      round.smallBlindPlayer = prevSmallBlindPlayer ? prevSmallBlindPlayer.nextPlayer() : players[0];
      if (round.smallBlindPlayer === prevSmallBlindPlayer) {
        return this.run('endGame', { winningPlayer: currentPlayer });
      }
      round.smallBlindPlayer.bet(bigBlindSum / 2);
      round.bigBlindPlayer = round.smallBlindPlayer.nextPlayer();
      round.bigBlindPlayer.bet(bigBlindSum);
      round.currentPlayer = round.bigBlindPlayer.nextPlayer();

      round.clientCard = decks.client.getRandomItem();
      round.clientCard.moveToTarget(decks.zone_flop, { setVisible: true });
      round.featureCard = decks.feature.getRandomItem();
      round.featureCard.moveToTarget(decks.zone_turn);
      round.scoringCard = decks.scoring.getRandomItem();
      round.scoringCard.moveToTarget(decks.zone_river);

      round.currentPlayer.activate({
        notifyUser: 'Сделай свою ставку',
        setData: { eventData: { controlBtn: { triggerEvent: true } } },
      });
      round.currentPlayer.initEvent(domain.game.poker.events.betEvent());

      result.statusLabel = `Раунд ${result.newRoundNumber} (Префлоп)`;
      result.roundStep = 'BET';
      return result;
    }
    case 'BET': {
      const { zone_flop: zoneFlop, zone_turn: zoneTurn, zone_river: zoneRiver } = decks;

      const remainingPlayersInRound = players.filter((p) => !round.bets[p.id()]?.out);
      if (remainingPlayersInRound.length === 1) {
        round.roundStepWinner = remainingPlayersInRound[0];
        result.roundStep = 'SHOW_RESULTS';
        return { ...result, forcedEndRound: true };
      }

      const allPlayersReady = players.every((_) => {
        const roundBet = round.bets[_.id()] || {};
        return roundBet.ready || roundBet.out;
      });
      if (allPlayersReady) {
        switch (round.step) {
          case 'flop':
            zoneTurn.setItemVisible(round.featureCard);
            round.step = 'turn';
          // break;

          case 'turn':
            zoneRiver.setItemVisible(round.scoringCard);
            round.step = 'river';
          // break;

          case 'river':
            const offersMap = {};
            for (const player of players) {
              const offers = this.run('getAvailableOffers', {}, player);
              Object.assign(offersMap, offers);
            }

            const { bestOffer, relevantOffers, riskOffers } = this.run('selectBestOffer', {
              offersMap,
              checkRisk: true,
            });
            const {
              player: winner,
              productCards: [productCard],
              serviceCards,
            } = bestOffer;
            round.riskOffers = riskOffers;
            if (winner) {
              round.roundStepWinner = winner;
              round.bestOffer = bestOffer;

              productCard.moveToTarget(winner.decks.played);
              winner.decks.played.setItemVisible(productCard);
              for (const card of serviceCards) {
                card.moveToTarget(winner.decks.played);
                winner.decks.played.setItemVisible(card);
              }
            }

            result.roundStep = 'SHOW_RESULTS';
            break;
        }

        for (const player of players) {
          const bet = round.bets[player.id()];
          if (bet.out) continue;
          bet.ready = false;
        }

        return { ...result, forcedEndRound: true };
      }

      const nextPlayer = currentPlayer.nextPlayer();
      round.currentPlayer = nextPlayer;

      nextPlayer.activate({
        notifyUser: 'Сделай свою ставку',
        setData: { eventData: { controlBtn: { triggerEvent: true } } },
      });
      round.currentPlayer.initEvent(domain.game.poker.events.betEvent());

      result.statusLabel = `Раунд ${result.newRoundNumber} (ставка игрока ${nextPlayer.userName})`;
      result.roundStep = 'BET';

      return { ...result };
    }

    case 'SHOW_RESULTS': {
      const winner = round.roundStepWinner;
      if (winner) {
        result.newRoundLogEvents.push({
          msg: `Игрок {{player}} забирает банк в размере ${round.pot}₽.`,
          userId: winner.userId,
        });
        winner.set({ money: winner.money + round.pot });
      } else {
        const playersInGame = players.filter((p) => !p.out);
        const sharedPot = Math.floor(round.pot / playersInGame.length / 5) * 5;
        for (const player of playersInGame) {
          player.set({ money: player.money + sharedPot });
        }
      }

      this.activatePlayers({
        setData: { eventData: { playDisabled: true, controlBtn: { label: 'Завершить раунд', triggerEvent: null } } },
        disableSkipTurnCheck: true,
      });
      result.roundStep = 'ROUND_END';
      return { ...result, timerRestart: timer.SHOW_RESULTS };
    }

    case 'ROUND_END': {
      const { clientCard, featureCard, scoringCard } = round;

      clientCard.moveToDrop();
      featureCard.moveToDrop();
      scoringCard.moveToDrop();

      for (const player of players) {
        player.decks.hand.moveAllItems({ toDrop: true });
        player.decks.played.moveAllItems({ toDrop: true });
      }

      round.roundStepWinner = null;
      round.bestOffer = null;
      round.riskOffers = null;

      result.roundStep = 'ROUND_START';
      return { ...result, forcedEndRound: true };
    }
  }
});
