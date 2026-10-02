import BoardModel, {
  initBoard,
  populateBoard,
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
    this.ticksToNextState = this.autoRestartDelay();
  }

  autoRestartDelay(won = true) {
    const shortDelay = 4 * 10;
    const longDelay = shortDelay * this.unlocks.automationSpeed();
    if (won && this.unlocks.isUnlocked("autoRestart2")) return shortDelay;
    if (!won && this.unlocks.isUnlocked("autoRestart3")) return longDelay;
    if (won && this.unlocks.isUnlocked("autoRestart")) return longDelay;

    return undefined;
  }

  startGame(width, height, mines, comboBonusMult) {
    if (this.boardModel !== null) return;

    this.state = "running";

    this.boardModel = new BoardModel(width, height, mines, (won) =>
      this.onGameCompleted(won)
    );
    initBoard(this.boardModel);
    populateBoard(this.boardModel);
    const startWithZero = this.unlocks.isUnlocked("startWithRevealedZero");

    if (this.unlocks.isUnlocked("startWithRevealedSquare") || startWithZero) {
      revealStartingSpace(this.boardModel, startWithZero);
    }

    this.boardPlayer = new BoardPlayer(this.boardModel, this.unlocks, false);
    this.reverseBoardPlayer = new BoardPlayer(
      this.boardModel,
      this.unlocks,
      true
    );

    this.boardModel.comboBonusMult = comboBonusMult;
    return this.boardModel;
  }

  onGameCompleted(won) {
    this.state = "waitingToFinish";
    this.ticksToNextState = this.autoRestartDelay(won);
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
    this.ticksToNextState = this.autoRestartDelay();
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
          this.ticksToNextState = this.autoRestartDelay();
        }
        this.ticksToNextState--;
        if (this.ticksToNextState <= 0) {
          this.startLargestUnlockedGame();
        }
      } else if (this.state === "running") {
        // Nothing here
      } else if (this.state === "waitingToFinish") {
        if (this.ticksToNextState === undefined) {
          this.ticksToNextState = this.autoRestartDelay(this.boardModel.isWon);
        }
        this.ticksToNextState--;
        if (this.ticksToNextState <= 0) {
          this.completeGame();
        }
      }
    }
  }
}
