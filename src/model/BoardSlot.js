import BoardModel, {
  initBoard,
  placeMines,
  hasZero,
  revealStartingSpace,
} from "./BoardModel.js";
import BoardPlayer from "./BoardPlayer.js";

// state can be one of:
// running, waitingToStart, waitingToFinish

export default class BoardSlot {
  constructor(unlocks, notifyGameEnd) {
    this.unlocks = unlocks;
    this.notifyGameEnd = notifyGameEnd;
    this.boardModel = null;
    this.boardPlayer = null;
    this.reverseBoardPlayer = null;
    this.state = "waitingToStart";
    this.maybeAutoRestart();
  }

  maybeAutoRestart(won = true) {
    this.ticksToNextState = this.autoRestartDelay(won);
    this.ticksTotal = this.ticksToNextState;
  }

  autoRestartDelay(won) {
    const shortDelay = 4 * 10;
    const longDelay = shortDelay * this.unlocks.automationSpeed();
    if (won && this.unlocks.isUnlocked("autoRestart2")) return shortDelay;
    if (!won && this.unlocks.isUnlocked("autoRestart3")) return longDelay;
    if (won && this.unlocks.isUnlocked("autoRestart")) return longDelay;

    return undefined;
  }

  get autoRestartFraction() {
    if (!Number.isFinite(this.ticksToNextState)) return null;
    return 1 - this.ticksToNextState / this.ticksTotal;
  }

  startGame(width, height, mines, comboValue) {
    if (this.boardModel !== null) return;

    this.state = "running";

    this.boardModel = new BoardModel(width, height, mines, (won) =>
      this.onGameCompleted(won),
    );
    initBoard(this.boardModel);

    const startWithZero = this.unlocks.isUnlocked("startWithRevealedZero");
    while (startWithZero && !hasZero(this.boardModel)) {
      placeMines(this.boardModel);
    }
    if (this.unlocks.isUnlocked("startWithRevealedSquare") || startWithZero) {
      revealStartingSpace(this.boardModel, startWithZero);
    }

    this.boardPlayer = new BoardPlayer(this.boardModel, this.unlocks, false);
    this.reverseBoardPlayer = new BoardPlayer(
      this.boardModel,
      this.unlocks,
      true,
    );

    this.boardModel.comboValue = comboValue;
    return this.boardModel;
  }

  onGameCompleted(won) {
    this.state = "waitingToFinish";
    this.maybeAutoRestart(won);
  }

  completeGame() {
    if (
      this.boardModel === null ||
      (!this.boardModel.isWon && !this.boardModel.isLost)
    )
      return;

    this.notifyGameEnd(this.boardModel);
    this.boardModel = null;
    this.boardPlayer = null;
    this.reverseBoardPlayer = null;

    this.state = "waitingToStart";
    this.maybeAutoRestart();
  }

  startSmallGame() {
    return this.startGame(4, 4, 3, 0);
  }
  startMediumGame() {
    return this.startGame(6, 6, 7, 1);
  }
  startLargeGame() {
    return this.startGame(9, 9, 14, 2);
  }
  startLargestUnlockedGame() {
    if (this.unlocks.isUnlocked("boardLarge")) {
      this.startLargeGame();
    } else if (this.unlocks.isUnlocked("boardMedium")) {
      this.startMediumGame();
    } else {
      this.startSmallGame();
    }
  }

  handleInterval() {
    if (this.boardPlayer) this.boardPlayer.handleInterval();
    if (this.reverseBoardPlayer) this.reverseBoardPlayer.handleInterval();

    if (this.unlocks.isUnlocked("autoRestart")) {
      if (this.state === "waitingToStart") {
        if (this.ticksToNextState === undefined) {
          this.maybeAutoRestart();
        }
        this.ticksToNextState--;
        if (this.ticksToNextState <= 0) {
          this.startLargestUnlockedGame();
        }
      } else if (this.state === "running") {
        // Nothing here
      } else if (this.state === "waitingToFinish") {
        if (this.ticksToNextState === undefined) {
          this.maybeAutoRestart(this.boardModel.isWon);
        }
        if (this.ticksToNextState !== undefined) {
          this.ticksToNextState--;
        }
        if (this.ticksToNextState <= 0) {
          this.completeGame();
        }
      }
    }
  }
}
