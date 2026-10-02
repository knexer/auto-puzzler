# CLAUDE.md

Context for working on this repo. See README.md for gameplay. I write all the code; your job is to review it, help me debug and understand the code (it's been a long time since I first wrote it), and to talk things over with me.

## Status

This is a hobby project, developed mostly from Nov 2022 to Feb 2023. I'm picking it back up now to try to actually publish it. The Github repo is public, and named `auto-puzzler`, but since I've decided to limit the scope to just Minesweeper, the game calls itself "auto-sweeper" in the UI. GitHub issues (knexer/auto-puzzler) for task tracking type stuff, and commit messages reference issue numbers (`Closes #N`, `See #N`).

## Architecture

The code has a model/view split. Everything under `src/model/` is plain JS classes wrapped in valtio `proxy()`. The React components in `src/components/` read state through `useSnapshot()` and mutate the proxies directly.

```
src/index.js            creates the root GameState proxy, loads/saves localStorage, renders <Game>
src/UnlockConfig.js     static upgrade definitions (key, title, desc, cost, reqs); singleton
src/model/
  GameState.js          root: money, UnlockState, 4 BoardSlots, the global tick timer, and the combo streak
  UnlockState.js        purchased upgrades state
  BoardSlot.js          one board: the BoardModel, 2 BoardPlayers for automation; new board state machine
  BoardModel.js         the minesweeper grid: squares, mine placement, win/loss detection, deduction helpers
  BoardPlayer.js        player input handling + automation rules + the autoclicker "worker" + auto-guess
  SquareModel.js        one cell; flagged/revealed setters fire onChange -> BoardModel.handleSquareChanged
src/components/
  Game.js               layout: upgrade panel + up to 4 BoardPanels (gated by multiBoard1..3)
  AutomationUnlockPanel.js  game title, money, combo display, buy upgrades, reset save
  BoardPanel.js         either "New Smol/Medium/Large Board" buttons or a <Board>
  Board.js / Square.js  grid rendering, mine counter, claim/abandon button
```

### The automation tick loop

- `GameState.startInterval()` runs a self-rescheduling `setTimeout`. The delay is based on the automation speed. This is a no-op until `autoClick` is unlocked.
- Ticks propagate to each BoardSlot via `BoardSlot.handleInterval()`. That calls both BoardPlayers (forward and reverse; the reverse one does nothing without `twoWorkers`) and then advances the auto-restart state machine.
- **Worker.** A BoardPlayer has an `automationIndex` that steps one square per tick, applying `applyAutomationRules` to revealed squares. `BoardModel.version` increments when a square changes. If a worker returns to index 0 and the version hasn't changed since its last pass, it is stuck: it marks the square `automationFocusBlocked` (shown red) and calls `handleGuess()`.
- **Auto-guess.** Only the forward worker guesses, and only with `guessWhenStuck`. It counts down 1200 ticks (5 minutes at 1x) and then clicks a random unmarked square.
- **BoardSlot states.** The state machine goes `waitingToStart` (shows buttons for the player to start a new board) → `running` (player is solving the board) → `waitingToFinish` (board is done, player claims the spoils or acknowledges the loss) → `waitingToStart`. Auto-restart has a 10 seconds delay, which is affected by automation speed except in the case of acknowledging a loss.

### Saving

- `localStorage["save"]` holds `{ money, combo, unlocks }` and is written every 5 s from `index.js`. Board state is not saved.
- I don't really plan to handle backwards/forwards compatible saves, because the game is short enough to be mostly completed in one sitting anyways.

## Valtio usage

It took a lot of iteration to get to this point in using Valtio. It's a confusing, somewhat over-engineered-feeling pattern and I'm not sure I'm holding it right. The model and view layers are both kind of thick, which is I think part of what feels wrong.

- Components read from snapshots (`useSnapshot(x)`) for rendering and subscriptions, and write to proxies (`props.model`, `gameState`). Reading from the proxy in render won't subscribe. Writing to a snapshot throws.
- The ESLint config includes `plugin:valtio/recommended`.
- Each `SquareModel` is individually proxied inside the BoardModel, so we have proxies inside proxies. `SquareModel` uses private fields (`#flagged`, `#revealed`) behind getters and setters. The setters refuse to flag a revealed square or reveal a flagged one, and they call `onChange` to trigger win/loss and version updates.

## Known issues / tech debt

- `handleGuess`'s `getRandomUnmarkedLocation` recurses randomly until it finds an unmarked square. If none exists, stack goes boom. That will happen on a board that is fully revealed and has manual mis-flags.
- Profiling and optimizing has not been done, is tracked in #28. Perf isn't obviously terrible on my machine though.
- The `gh-pages` devDependency is unused, left over since deployment moved to itch.
- Create React App is apparently deprecated now. Probably not going to change anything that foundational at this point.

## Approximate roadmap

- Reward careful play so guess-spam isn't the one true strategy. The WIP combo mechanic is trying to do this.
- Add some ending that's more satisfying than just 'you bought all the upgrades, you win'. Thinking of a final challenge mega sized board, maybe something that reveals a message in the mine pattern, like 'GG' or a smileyface or something.
- Change the title/favicon
- Add a confirmation to the Reset Save button
- Show the auto-guess and auto-restart timers for each board
- MAYBE add smarter automation rules, e.g. ones that consider pairs of nearby cells.
- MAYBE Make forced guess boards a) less common or b) feel better or c) give players more mitigation options
