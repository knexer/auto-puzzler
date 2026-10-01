import React, { StrictMode } from "react";
import { proxy } from "valtio";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Game from "./components/Game.js";
import GameState from "./model/GameState.js";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const gameState = proxy(
  new GameState(JSON.parse(localStorage.getItem("save")))
);
gameState.init();
gameState.startInterval();

window.cheat = function () {
  gameState.money += 100;
};
const resetSave = function () {
  localStorage.removeItem("save");
  window.location.reload();
};

const save = function () {
  localStorage.setItem("save", JSON.stringify(gameState.serialize()));
};

setInterval(save, 5000);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* eslint-disable-next-line valtio/state-snapshot-rule */}
      <Game gameState={gameState} resetSave={resetSave} />
    </ThemeProvider>
  </StrictMode>
);
