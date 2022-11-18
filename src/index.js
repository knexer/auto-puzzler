import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={this.props.onClick}
        onContextMenu={(e) => {
          e.preventDefault();
          this.props.onClick();
        }}
      >
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.secretSquares = Array.from({ length: props.height }, () =>
      Array(props.width).fill(0)
    );

    const addMine = (x, y) => {
      if (this.secretSquares[y][x] === "X") return false;
      this.secretSquares[y][x] = "X";

      for (let dy = -1; dy <= 1; dy++) {
        const newY = y + dy;
        if (newY < 0 || newY >= this.secretSquares.length) continue;

        for (let dx = -1; dx <= 1; dx++) {
          const newX = x + dx;
          if (newX < 0 || newX >= this.secretSquares[y].length) continue;
          if (isNaN(this.secretSquares[newY][newX])) continue;

          this.secretSquares[newY][newX]++;
        }
      }

      return true;
    };

    for (let i = 0; i < props.mines; i++) {
      const x = Math.floor(Math.random() * props.width);
      const y = Math.floor(Math.random() * props.height);
      if (!addMine(x, y)) {
        i--;
      }
    }

    this.state = {
      squares: Array.from({ length: props.height }, () =>
        Array(props.width).fill()
      ),
    };
  }

  handleClick(x, y) {
    const squares = this.state.squares.slice().map((row) => row.slice());
    squares[y][x] = this.secretSquares[y][x];
    this.setState({ squares: squares });
  }

  renderSquare(x, y) {
    return (
      <Square
        x={x} // debug purposes
        y={y} // debug purposes
        key={x}
        onClick={() => this.handleClick(x, y)}
        value={this.state.squares[y][x]}
      />
    );
  }

  renderRow(y) {
    return (
      <div className="board-row" key={y}>
        {Array.from({ length: this.props.width }, (step, i) =>
          this.renderSquare(i, y)
        )}
      </div>
    );
  }

  render() {
    const status = "Next player: X";

    return (
      <div>
        <div className="status">{status}</div>
        {Array.from({ length: this.props.height }, (element, i) =>
          this.renderRow(i)
        )}
      </div>
    );
  }
}

class Game extends React.Component {
  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board width={4} height={6} mines={3} />
        </div>
        <div className="game-info">
          <div>{/* status */}</div>
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <Game />
  </StrictMode>
);