export const GUESS_VIZ_DURATION = 4 * 150;

export default class BoardPlayer {
  constructor(model, unlocks, reverse = false) {
    this.model = model;
    this.unlocks = unlocks;
    this.timeoutId = null;
    this.automationIndex = 0;
    this.automationReverse = reverse;
    this.lastStartedVersion = -1;
    this.guessVersion = undefined;
    this.ticksUntilGuess = undefined;
    this.guessLoc = undefined;

    const automationConfig = this.automationConfig;
    this.model.mulligans =
      (automationConfig.mulligans1 ? 1 : 0) +
      (automationConfig.mulligans2 ? 1 : 0) +
      (automationConfig.mulligans3 ? 1 : 0);
  }

  get automationConfig() {
    // TODO this garbage perf
    return this.unlocks.getUnlockedUpgrades();
  }

  get automationLoc() {
    const x = this.automationIndex % this.model.width;
    const y = Math.floor(this.automationIndex / this.model.width);
    return {
      x: this.automationReverse ? this.model.width - 1 - x : x,
      y: this.automationReverse ? this.model.height - 1 - y : y,
    };
  }

  handleClick(loc) {
    const square = this.model.squareAt(loc);
    if (square.flagged) {
      return;
    }

    if (square.revealed) {
      this.applyAutomationRules(loc);
    }

    if (this.model.mulligans > 0 && this.model.squareAt(loc).mine) {
      this.model.squareAt(loc).flagged = true;
      this.model.mulligans--;
    } else {
      this.model.squareAt(loc).revealed = true;
    }
  }

  handleFlag(loc, flagged) {
    if (this.model.squareAt(loc).revealed) {
      this.applyAutomationRules(loc);
    } else {
      this.model.squareAt(loc).flagged = flagged;
    }
  }

  canApplyToSquare(square) {
    const mines = square.adjacentMines;
    if (mines === 0) return this.automationConfig.automate0;
    if (mines === 1) return this.automationConfig.automate1;
    if (mines === 2) return this.automationConfig.automate2;
    return this.automationConfig.automate3;
  }

  applyAutomationRules(loc) {
    const square = this.model.squareAt(loc);

    if (this.canApplyToSquare(square)) {
      if (this.model.revealAdjacentSquaresIsSafe(loc)) {
        this.model.revealAdjacentSquares(loc);
      }

      if (this.model.flagAdjacentSquaresIsSafe(loc)) {
        this.model.flagAdjacentSquares(loc);
      }
    }
  }

  handleInterval() {
    // Nothing to do if the board is finished.
    if (this.model.isWon || this.model.isLost) {
      this.clearGuess();
      return;
    }

    // Nothing to do if we're reverse and reversed autoclicker isn't unlocked yet.
    if (this.automationReverse && !this.automationConfig.twoWorkers) {
      return;
    }

    if (this.automationIndex === 0) {
      // Nothing to do if the board hasn't changed since we started our previous loop.
      if (this.lastStartedVersion === this.model.version) {
        this.model.squareAt(this.automationLoc).automationFocusBlocked = true;

        // Unless guessing is unlocked!
        this.handleGuess();
        return;
      }
      this.model.squareAt(this.automationLoc).automationFocusBlocked =
        undefined;
      this.lastStartedVersion = this.model.version;
      this.clearGuess();
    }

    // Simulate a left and/or right click on the square at the next automation location.
    const square = this.model.squareAt(this.automationLoc);
    if (square.revealed) {
      this.applyAutomationRules(this.automationLoc);
    }

    // Move to the next square.
    if (this.model.squareAt(this.automationLoc).automationFocus > 0)
      this.model.squareAt(this.automationLoc).automationFocus--;
    this.automationIndex =
      (this.automationIndex + 1) % (this.model.width * this.model.height);
    this.model.squareAt(this.automationLoc).automationFocus++;
  }

  clearGuess() {
    this.ticksUntilGuess = undefined;
    if (this.guessLoc !== undefined) {
      this.model.squareAt(this.guessLoc).ticksUntilGuess = undefined;
    }
    this.guessLoc = undefined;
  }

  handleGuess() {
    if (this.automationReverse || !this.automationConfig.guessWhenStuck) return;

    // Start the guess timer if this is the first time we've been stuck on this version.
    if (this.model.version !== this.guessVersion) {
      this.guessVersion = this.model.version;
      this.clearGuess();
      this.ticksUntilGuess = 4 * 300; // 5 minute delay at 1x speed. 18.75s at 16x speed.
    }

    this.ticksUntilGuess--;
    if (this.guessLoc !== undefined) {
      this.model.squareAt(this.guessLoc).ticksUntilGuess = this.ticksUntilGuess;
    }

    if (this.ticksUntilGuess === GUESS_VIZ_DURATION) {
      const candidates = this.model
        .allSquares()
        .filter(({ square }) => !square.revealed && !square.flagged);
      if (candidates.length > 0) {
        this.guessLoc =
          candidates[Math.floor(Math.random() * candidates.length)].loc;
        this.model.squareAt(this.guessLoc).ticksUntilGuess =
          this.ticksUntilGuess;
      }
    }

    if (this.ticksUntilGuess === 0 && this.guessLoc !== undefined) {
      // Time to guess.
      this.handleClick(this.guessLoc);
      this.clearGuess();
    }
  }
}
