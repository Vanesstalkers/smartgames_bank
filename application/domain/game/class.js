(class Game extends lib.game.class() {
  constructor() {
    super(...arguments);
    Object.assign(this, {
      ...lib.chat['@class'].decorate(),
      ...lib.game.decorators['@hasDeck'].decorate(),
    });

    this.defaultClasses({
      Player: domain.game._objects.Player,
      Deck: domain.game._objects.Deck,
      Card: domain.game._objects.Card,
    });
  }

  getFullPrice() {
    const baseSum = 1000;
    const timerMod = 30000 / this.gameTimer;
    const configMod = { blitz: 0.5, standart: 0.75, hardcore: 1 }[this.gameConfig];
    return Math.floor(baseSum * timerMod * configMod);
  }
  stepLabel(label) {
    return `Раунд ${this.round} (${label})`;
  }
});
