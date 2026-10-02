import { proxy } from "valtio";

import BoardSlot from "./BoardSlot.js";
import UnlockState from "./UnlockState.js";

// A root class for the state of the game as a whole.
// Owns the player's money, the upgrades the player has unlocked, and (shortly) all of the currently going games.
export default class GameState {
  constructor(deserialized = null) {
    this.money = deserialized?.money ?? 0;
    this.combo = deserialized?.combo ?? 0;
    this.unlocks = proxy(new UnlockState(deserialized?.unlocks));
    this.boardSlots = [];
  }

  serialize() {
    return {
      money: this.money,
      combo: this.combo,
      unlocks: this.unlocks.serialize(),
    };
  }

  init() {
    this.addBoardSlot();
    this.addBoardSlot();
    this.addBoardSlot();
    this.addBoardSlot();
  }

  getComboMult() {
    if (this.combo >= 60) return 2;
    if (this.combo >= 28) return 1.75;
    if (this.combo >= 12) return 1.5;
    if (this.combo >= 4) return 1.25;
    return 1;
  }

  onGameEnd(boardModel) {
    if (boardModel.isWon) {
      this.money += boardModel.value(this.getComboMult());
      if (this.unlocks.isUnlocked("combo")) {
        this.combo += boardModel.comboValue;
      }
    } else {
      this.combo = 0;
    }
  }

  addBoardSlot() {
    this.boardSlots.push(
      new BoardSlot(this.unlocks, (boardModel) => this.onGameEnd(boardModel))
    );
  }

  handleInterval() {
    this.timeoutId = null;

    // Restart interval immediately in case we crash below.
    this.startInterval();

    // Skip running for now if automation isn't unlocked yet.
    if (!this.unlocks.isUnlocked("autoClick")) {
      return;
    }

    this.boardSlots.forEach((slot) => slot.handleInterval());
  }

  startInterval() {
    this.stopInterval();
    this.timeoutId = setTimeout(
      () => this.handleInterval(),
      250 / this.unlocks.automationSpeed()
    );
  }

  stopInterval() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
