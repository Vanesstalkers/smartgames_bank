() => ({
  ...lib.game.tutorial.getHelperLinks(),
  opponentCards: {
    selector: '.players .hand-cards.at-table',
    tutorial: 'game-tutorial-links',
    type: 'game',
    pos: { top: true, right: true },
  },
  pokerChipsPanel: {
    selector: '.chips-panel.select-mode',
    tutorial: 'game-tutorial-links',
    type: 'game',
    pos: { bottom: true, left: true },
  },
});
