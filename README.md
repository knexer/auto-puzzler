# auto-sweeper

auto-sweeper is an incremental game based on Minesweeper. Solving Minesweeper boards earns money, which can be spent on upgrades which assist you in solving further boards. This virtuous cycle of mine-sweeping currently ends with the purchase of the final upgrade 'Ludicrous Automation Speed'.

Published to https://knexer.itch.io/auto-sweeper (HTML5).

## Gameplay

- **Boards.** Boards are small, ranging from 4x4 to 9x9. Left-click reveals a square and right-click flags it. You win once every mine is flagged and every safe square is revealed, or lose if you reveal a mine.
- **Money.** Winning gives $1 per mine, plus $1 for each unused mulligan, plus a combo bonus on medium and large boards. You spend money on upgrades.
- **Combo.** WIP anti-guessing carrot. Consecutive wins build your combo. Losing resets it, but only after you abandon the game, so the multi-board upgrade effectively gives combo armor.
- **Upgrades.** Two categories here: upgrades that improve the automation (make it smarter or faster) and upgrades that just give straight buffs, like mulligans or extra boards.
- Money, upgrades, and win streak autosave to `localStorage` every 5 seconds. Board state is not saved. I think that would be hard to implement with how the game is set up, but it also isn't that important since boards are so small.

## Development

```sh
npm install
npm start          # dev server on http://localhost:3000
npm run build      # production build into build/
npm run deploy     # builds, then pushes build/ to itch.io via butler
```

`npm run deploy` needs the [butler](https://itch.io/docs/butler/) CLI installed and logged in.

`window.cheat()` in the console adds $100. Good for testing to skip the early game.

Written in JS with React 18 + [valtio](https://github.com/pmndrs/valtio) (proxy-based state management) + MUI starting from Create React App template.
