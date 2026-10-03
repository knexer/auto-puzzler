import React from "react";
import { useSnapshot } from "valtio";
import {
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import unlockConfig from "../UnlockConfig";

const renderUnlockable = (unlockable, unlockStateSnap, money, gameState) => {
  return (
    <ListItem key={unlockable.key}>
      <Paper elevation={1}>
        <ListItemButton
          disabled={
            unlockable.cost > money ||
            unlockStateSnap.isUnlocked(unlockable.key)
          }
          onClick={() => {
            gameState.unlocks.unlockUpgrade(unlockable.key);
            gameState.money -= unlockable.cost;
          }}
        >
          <ListItemText
            primary={"$" + unlockable.cost + ": " + unlockable.title}
            secondary={unlockable.desc}
          />
        </ListItemButton>
      </Paper>
    </ListItem>
  );
};

export default function AutomationUnlockPanel(props) {
  const gameStateSnap = useSnapshot(props.gameState);
  const unlockStateSnap = gameStateSnap.unlocks;

  const availableUnlockables = [];
  const purchasedUnlockables = [];
  for (const key of unlockConfig.unlockables.keys()) {
    const unlockable = unlockConfig.getUnlockable(key);
    const renderedUnlockable = renderUnlockable(
      unlockable,
      unlockStateSnap,
      gameStateSnap.money,
      props.gameState
    );
    if (unlockStateSnap.isUnlocked(key)) {
      purchasedUnlockables.push(renderedUnlockable);
    } else if (unlockStateSnap.isAvailable(key)) {
      availableUnlockables.push(renderedUnlockable);
    }
  }

  availableUnlockables.sort(
    (a, b) =>
      unlockConfig.getUnlockable(a.key).cost -
      unlockConfig.getUnlockable(b.key).cost
  );

  return (
    <div className="left-panel">
      <Typography variant="h3" className="header">
        auto-sweeper <div className="money">${gameStateSnap.money}</div>
      </Typography>
      {unlockStateSnap.isUnlocked("combo") && (
        <Paper className="combo-panel" elevation={4}>
          x{gameStateSnap.getComboMult()} Mult ({gameStateSnap.combo} Combo)
          <div></div>
        </Paper>
      )}
      <Accordion disableGutters elevation={4} defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h5">Upgrades:</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List
            dense
            disablePadding
            style={{ maxHeight: 300, overflow: "auto" }}
          >
            {availableUnlockables}
          </List>
        </AccordionDetails>
      </Accordion>
      {purchasedUnlockables.length > 0 && (
        <Accordion disableGutters elevation={4}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">Purchased Upgrades:</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List
              dense
              disablePadding
              style={{ maxHeight: 270, overflow: "auto" }}
            >
              {purchasedUnlockables}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
      <div>
        Autosaves every 5 seconds.{" "}
        <Button
          variant="text"
          color="error"
          size="small"
          onClick={props.resetSave}
        >
          !!! Reset Save !!!
        </Button>
      </div>
    </div>
  );
}
