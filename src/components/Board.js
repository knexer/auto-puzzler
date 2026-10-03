import React from "react";
import { useSnapshot } from "valtio";
import { Button, Paper, Typography } from "@mui/material/";

import Square from "./Square.js";

export default function Board(props) {
  const model = props.model;
  const modelSnap = useSnapshot(model);
  const width = modelSnap.width;
  const height = modelSnap.height;

  const gameWin = modelSnap.isWon;
  const gameLose = modelSnap.isLost;
  const numFlaggedSquares = modelSnap.numFlaggedSquares;

  const mulliganDisplay = () => {
    if (model.mulligans === 0) return "";
    return (
      <div className="mulligan-display">
        <Paper elevation={1}>
          <Typography className="mine-counter">
            {"🛡️".repeat(model.mulligans) + " (+$" + model.mulligans + ")"}
          </Typography>
        </Paper>
      </div>
    );
  };

  const status = () => {
    if (gameLose)
      return (
        <div className="status">
          <Button
            variant="contained"
            color={props.comboMult > 1 ? "error" : "primary"}
            onClick={() => props.onGameEnd(model, false)}
          >
            Abandon Game{props.comboMult > 1 ? ", Reset x" + props.comboMult + " Combo" : ""}
          </Button>
        </div>
      );
    if (gameWin) {
      const {base, mulligans, combo, total} = model.valueBreakdown(props.comboMult);
      return (
        <div className="status">
          <Button
            variant="contained"
            onClick={() => props.onGameEnd(model, true)}
          >
            <span>
              Claim {base} 🚩 + {mulligans} 🛡️{combo > 1 ? ", x" + combo: ""} = <b>${total}</b>
            </span>
          </Button>
        </div>
      );
    }
    const correctFlags = "🚩".repeat(Math.min(model.mines, numFlaggedSquares));
    const excessFlags = "⚠️".repeat(
      Math.max(0, numFlaggedSquares - model.mines)
    );
    const unflaggedMines = "💣".repeat(
      Math.max(0, model.mines - numFlaggedSquares)
    );
    return (
      <div className="status">
        <Paper elevation={1}>
          <Typography className="mine-counter">
            {correctFlags + excessFlags + unflaggedMines}
          </Typography>
        </Paper>
      </div>
    );
  };

  const renderSquare = (x, y) => {
    return (
      <Square
        key={y * width + x}
        onClick={() => props.player.handleClick({ x, y })}
        onFlag={(flagged) => props.player.handleFlag({ x, y }, flagged)}
        gameWin={gameWin}
        gameLose={gameLose}
        model={model.squareAt({ x: x, y: y })}
      />
    );
  };

  const renderRow = (y) => {
    return (
      <div className="board-row" key={y}>
        {Array.from({ length: width }, (_, i) => renderSquare(i, y))}
      </div>
    );
  };

  return (
    <div>
      {mulliganDisplay()}
      <div>{Array.from({ length: height }, (_, i) => renderRow(i))}</div>
      {status()}
    </div>
  );
}
