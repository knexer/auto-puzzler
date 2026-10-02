import React from "react";
import { useSnapshot } from "valtio";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import Board from "./Board.js";

export default function BoardPanel(props) {
  const unlockState = props.unlockState;
  const unlockStateSnap = useSnapshot(unlockState);
  const gameStateSnap = useSnapshot(props.gameState);
  const comboMult = gameStateSnap.getComboMult();
  const boardSlot = props.boardSlot;
  const boardSlotSnap = useSnapshot(props.boardSlot);

  if (boardSlotSnap.boardModel !== null) {
    return (
      <Paper elevation={4} className="board-container">
        <Board
          model={boardSlot.boardModel}
          player={boardSlot.boardPlayer}
          onGameEnd={() => boardSlot.completeGame()}
          automationConfig={unlockStateSnap.getUnlockedUpgrades()}
          comboMult={comboMult}
        />
      </Paper>
    );
  } else {
    const renderNewGameButton = (startGame, text) => {
      return (
        <Button variant="contained" onClick={startGame}>
          {text}
        </Button>
      );
    };
    return (
      <Paper elevation={4} className="board-container">
        {renderNewGameButton(
          () => boardSlot.startSmallGame(),
          "New Smol Board"
        )}
        {unlockStateSnap.isUnlocked("boardMedium")
          ? renderNewGameButton(
              () => boardSlot.startMediumGame(),
              "New Medium Board"
            )
          : ""}
        {unlockStateSnap.isUnlocked("boardLarge")
          ? renderNewGameButton(
              () => boardSlot.startLargeGame(),
              "New Big Board"
            )
          : ""}
      </Paper>
    );
  }
}
