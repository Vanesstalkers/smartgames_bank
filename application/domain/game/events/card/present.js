() => ({
  name: 'present',
  present: true,
  init({ message = 'Клиенту пообещали подарок.' } = {}) {
    const { game, player, source } = this.eventContext();

    this.presentNotGiven = true;

    player.decks.product.set({ eventData: { playDisabled: null } });
    player.decks.service.set({ eventData: { playDisabled: null } });

    const cards = [...player.decks.product.items(), ...player.decks.service.items()];
    for (const card of cards) {
      if (!card.present) {
        card.set({ eventData: { playDisabled: true } });
        continue;
      }

      card.set({
        eventData: {
          playDisabled: null,
          activeEvents: [this],
          cardClass: 'danger', // дополнительный css-класс карты
          buttonText: 'Подарить', // тест кнопки на карте
        },
      });
    }

    lib.store.broadcaster.publishData(`gameuser-${player.userId}`, {
      helper: {
        text: `
          ${message} У тебя есть выбор: подарить (один из сервисов на выбор), либо пропустить следующий раунд.
        `,
        superPos: true,
        hideTime: null,
        buttons: [
          { text: 'Выбрать подарок', action: 'exit' },
          { text: 'Не буду дарить', action: 'cancel' },
        ],
        actions: {
          cancel: (async () => {
            await api.action
              .call({
                path: 'game.api.action',
                args: [{ name: 'roundEnd' }],
              })
              .catch(prettyAlert);

            return { exit: true };
          }).toString(),
        },
      },
    });
  },
  handlers: {
    RESET() {
      const { game, player } = this.eventContext();

      player.decks.product.set({ eventData: { playDisabled: true } });
      player.decks.service.set({ eventData: { playDisabled: true } });
      player.decks.product.updateAllItems({
        eventData: { playDisabled: true, activeEvents: [], cardClass: null, buttonText: null },
      });
      player.decks.service.updateAllItems({
        eventData: { playDisabled: true, activeEvents: [], cardClass: null, buttonText: null },
      });

      if (this.presentNotGiven) {
        game.logs({
          msg: `Игрок {{player}} не стал дарить подарок и пропускает следующий ход.`,
          userId: player.userId,
        });
        player.set({ eventData: { skipTurn: true } });
      }

      lib.store.broadcaster.publishData(`gameuser-${player.userId}`, {
        helper: null,
      });

      this.destroy();
    },
    TRIGGER({ target: card }) {
      const { game, player } = this.eventContext();

      this.presentNotGiven = false;
      card.set({ eventData: { activeEvents: [], cardClass: null, buttonText: null } });
      card.moveToTarget(game.decks.service_drop);

      this.emit('RESET');

      game.run('roundEnd', {}, player);
    },
    PRESENT() {
      this.emit('RESET');
    },
  },
});
