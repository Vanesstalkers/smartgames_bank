() =>
  class BankGameSession extends lib.game.sessionClass() {
    getUserClass() {
      return domain.user.class();
    }
  };
