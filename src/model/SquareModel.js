export default class SquareModel {
  mine = false;
  adjacentMines = 0;
  #flagged = false;
  #revealed = false;
  automationFocus = false;
  ticksUntilGuess = undefined;

  constructor(onChange) {
    this.onChange = onChange;
  }

  get flagged() {
    return this.#flagged;
  }
  set flagged(val) {
    if (!this.#revealed && this.#flagged !== val) {
      this.#flagged = val;
      this.onChange();
    }
  }

  get revealed() {
    return this.#revealed;
  }
  set revealed(val) {
    if (!this.#flagged && this.#revealed !== val) {
      this.#revealed = val;
      this.onChange();
    }
  }
}
