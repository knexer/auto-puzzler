import SquareModel from "./SquareModel.js";
import { proxy } from "valtio";

const randomElement = (list) => {
  return list[Math.floor(Math.random() * list.length)];
};

const initBoard = (boardModel) => {
  boardModel.squares = Array.from({ length: boardModel.height }, (_, y) =>
    Array.from({ length: boardModel.width }, (_, x) =>
      proxy(
        new SquareModel(() => boardModel.handleSquareChanged({ x: x, y: y }))
      )
    )
  );

  placeMines(boardModel);
};

const placeMines = (boardModel) => {
  // Wipe all existing mines
  for (const { square } of boardModel.allSquares()) {
    square.mine = false;
    square.adjacentMines = 0;
  }

  // Place N mines in random empty locations
  for (let i = 0; i < boardModel.mines; i++) {
    const emptySquares = boardModel
      .allSquares()
      .filter(({ square }) => !square.mine);
    const { loc } = randomElement(emptySquares);
    boardModel.tryAddMine(loc);
  }
};

const hasZero = (boardModel) => {
  return boardModel
    .allSquares()
    .some(({ square }) => !square.mine && square.adjacentMines === 0);
};

const revealStartingSpace = (boardModel, mustBeZero) => {
  const randomSquare = randomElement(
    boardModel
      .allSquares()
      .filter(
        ({ square }) =>
          !square.mine && (square.adjacentMines === 0 || !mustBeZero)
      )
  );
  randomSquare.square.revealed = true;
};

export default class BoardModel {
  constructor(width, height, mines, onGameEnd) {
    this.width = width;
    this.height = height;
    this.mines = mines;
    this.onGameEnd = onGameEnd;
    this.isWon = false;
    this.isLost = false;
    this.numFlaggedSquares = 0;
    this.squares = Array[0];
    this.version = 0;
  }

  handleSquareChanged(loc) {
    this.isWon = this.allSquares().every(({ square }) => {
      return square.mine ? square.flagged : square.revealed;
    });

    this.isLost = this.allSquares().some(({ square }) => {
      return square.mine && square.revealed;
    });

    if (this.isWon || this.isLost) {
      this.onGameEnd(this.isWon);
    }

    this.numFlaggedSquares = this.allSquares().filter(
      ({ square }) => square.flagged
    ).length;

    this.version++;
  }

  squareAt({ x, y }) {
    return this.squares[y][x];
  }

  adjacentSquares({ x, y }) {
    let squares = [];
    for (let dy = -1; dy <= 1; dy++) {
      const newY = y + dy;
      if (newY < 0 || newY >= this.height) continue;

      for (let dx = -1; dx <= 1; dx++) {
        const newX = x + dx;
        if (newX < 0 || newX >= this.width) continue;

        squares.push({
          square: this.squareAt({ x: newX, y: newY }),
          x: newX,
          y: newY,
        });
      }
    }
    return squares;
  }

  allSquares() {
    return this.squares.flatMap((arr, y) =>
      arr.map((square, x) => {
        return { square: square, loc: { x: x, y: y } };
      })
    );
  }

  tryAddMine(loc) {
    const square = this.squareAt(loc);

    if (square.mine) return false;
    square.mine = true;

    for (const adjSquare of this.adjacentSquares(loc)) {
      adjSquare.square.adjacentMines++;
    }

    return true;
  }

  revealAdjacentSquares(loc) {
    this.adjacentSquares(loc).forEach(({ square }) => (square.revealed = true));
  }

  revealAdjacentSquaresIsSafe(loc) {
    const adjacentFlagged = this.adjacentSquares(loc).filter(
      ({ square }) => square.flagged
    ).length;
    return adjacentFlagged >= this.squareAt(loc).adjacentMines;
  }

  flagAdjacentSquares(loc) {
    this.adjacentSquares(loc).forEach(({ square }) => (square.flagged = true));
  }

  flagAdjacentSquaresIsSafe(loc) {
    const adjacentFlaggable = this.adjacentSquares(loc).filter(
      ({ square }) => square.flagged || !square.revealed
    ).length;
    return adjacentFlaggable === this.squareAt(loc).adjacentMines;
  }

  value(comboMult) {
    const baseValue = this.mines + (this.mulligans ? this.mulligans : 0);
    if (this.comboValue > 0) {
      return Math.round(baseValue * comboMult);
    }
    return baseValue;
  }

  valueBreakdown(comboMult) {
    return {
      base: this.mines,
      mulligans: (this.mulligans ? this.mulligans : 0),
      combo: (this.comboValue > 0 ? comboMult : 1),
      total: this.value(comboMult)
    };
  }
}

export { initBoard, placeMines, hasZero, revealStartingSpace };
