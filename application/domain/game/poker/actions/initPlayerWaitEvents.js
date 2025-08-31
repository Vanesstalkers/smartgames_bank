(function () {
  this.initEvent(
    {
      name: 'initPlayerWaitEvents',
      data: {
        readyPlayers: [],
      },
      init() {
        const { game, player } = this.eventContext();
        this.realStatusLabel = game.statusLabel;

        if (game.restorationMode) {
          this.restoredActivePlayers = game
            .getActivePlayers()
            .map((player) => ({ player, controlBtn: player.eventData.controlBtn }));
        }

        game.set({ statusLabel: 'Ожидание игроков', status: 'WAIT_FOR_PLAYERS' });
      },
      handlers: {
        PLAYER_JOIN({ initPlayer: player }) {
          const { game } = this.eventContext();

          // !!! можно сделать, но нужно корректно учесть количество ready-игроков перед восстановлением (проблема в том, что где-то после инициации восстановления сбрасывается флаг ready)
          // if (game.restorationMode) return this.emit('TRIGGER', {}, player);
          if (player.ai) return this.emit('TRIGGER', {}, player);

          player.activate({
            notifyUser: game.restorationMode
              ? 'Для возобновления игры нажми кнопку "Готов" и ожидай остальных игроков'
              : 'Для начала игры нажми кнопку "Готов" и ожидай остальных игроков',
            setData: { eventData: { playDisabled: null, controlBtn: { label: 'Готов', triggerEvent: true } } },
          });
          player.setEventWithTriggerListener(this);

          return { preventListenerRemove: true };
        },
        TRIGGER({ initPlayer: player }) {
          const { game } = this.eventContext();

          player.set(
            { ready: true, timerEndTime: null, staticHelper: null, eventData: { controlBtn: null } },
            { reset: ['eventData.controlBtn'] }
          );
          player.deactivate();
          this.data.readyPlayers.push(player.id());

          player.removeEvent(this);
          player.removeEventWithTriggerListener();

          if (this.data.readyPlayers.length < game.minPlayersToStart) return { preventListenerRemove: true };

          this.emit('RESET'); // в startGame появится betEvent['TRIGGER'] - оно не должно сброситься через player.removeEventWithTriggerListener()

          if (game.status === 'WAIT_FOR_PLAYERS') {
            try {
              game.run('initPrepareGameEvents');
            } catch (err) {
              // может не быть обработчика
              game.run('startGame');
            }
          } else if (game.restorationMode) {
            // восстанавливаем активных игроков (активация сбросилась после нажатия кнопки "Готов")
            for (const { player, controlBtn } of this.restoredActivePlayers) {
              player.activate({ setData: { eventData: { controlBtn } } });
              player.initEvent(domain.game.poker.events.betEvent()); // !!! не факт что должно быть здесь
            }

            return game.restart();
          }

          if (this.data.readyPlayers.length === game.maxPlayersInGame) {
            for (const player of game.players({ readyOnly: false })) {
              if (!player.ready) {
                player.deactivate({
                  notifyUser: 'Игра началась без тебя. Для более удобного просмотра перейди в режим наблюдателя.',
                  setData: { eventData: { controlBtn: { leaveGame: true } } },
                });
              }
            }
          }
        },
        RESET() {
          const { game } = this.eventContext();
          game.set({ statusLabel: this.realStatusLabel });
          this.destroy();
        },
      },
    },
    { publicHandlers: ['PLAYER_JOIN', 'TRIGGER'] }
  );
});
