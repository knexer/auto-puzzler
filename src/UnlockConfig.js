class UnlockConfig {
  constructor() {
    this.unlockables = new Map();
    this.addUnlockable(
      "mulligans1",
      "Guess Armor 1",
      "Start each board with one mulligan (🛡️) that saves you if you would trigger a mine. Unused mulligans are worth $1 each if you win.",
      3,
      []
    );
    this.addUnlockable(
      "mulligans2",
      "Guess Armor 2",
      "Get a second mulligan (🛡️).",
      60,
      ["mulligans1"]
    );
    this.addUnlockable(
      "mulligans3",
      "Guess Armor 3",
      "Get a third mulligan (🛡️).",
      100,
      ["mulligans2"]
    );
    this.addUnlockable(
      "automate0",
      "Automate 0s",
      "Clicking a 0 will reveal adjacent squares.",
      3,
      []
    );
    this.addUnlockable(
      "automate1",
      "Automate 1s",
      "Clicking a 1 will flag (if there is only one place the mine could be) or reveal (if there is already an adjacent flag).",
      6,
      ["automate0"]
    );
    this.addUnlockable(
      "automate2",
      "Automate 2s",
      "Clicking a 2 will flag or reveal, if conclusions can be made based on its adjacent squares.",
      12,
      ["automate1"]
    );
    this.addUnlockable(
      "automate3",
      "Automate 3+s",
      "Clicking any number will flag or reveal, if conclusions can be made based on its adjacent squares.",
      25,
      ["automate2"]
    );
    this.addUnlockable(
      "startWithRevealedSquare",
      "Safe Start 1",
      "Start games with one random square revealed.",
      5,
      []
    );
    this.addUnlockable(
      "startWithRevealedZero",
      "Safe Start 2",
      "Start games with one random zero revealed.",
      25,
      ["startWithRevealedSquare"]
    );
    this.addUnlockable(
      "autoClick",
      "Autoclicker",
      "Automatically click on up to four revealed squares per second.",
      6,
      ["automate0"]
    );
    this.addUnlockable(
      "multiBoard1",
      "Multiboard 1",
      "Add a second board with its own autoclicker.",
      20,
      ["autoClick"]
    );
    this.addUnlockable(
      "multiBoard2",
      "Multiboard 2",
      "Add a third board with its own autoclicker.",
      50,
      ["multiBoard1"]
    );
    this.addUnlockable(
      "multiBoard3",
      "Multiboard 3",
      "Add a fourth board with its own autoclicker.",
      80,
      ["multiBoard2"]
    );
    this.addUnlockable(
      "autoRestart",
      "Auto-Restart 1",
      "Automatically restart won boards after 20 seconds, at the largest unlocked size. Does not restart after a loss.",
      50,
      ["multiBoard2"]
    );
    this.addUnlockable(
      "autoRestart2",
      "Auto-Restart 2",
      "Auto restart is affected by automation speed.",
      100,
      ["autoRestart"]
    );
    this.addUnlockable(
      "autoRestart3",
      "Auto-Restart 3",
      "Automatically restart after losing a board. 20 second delay, half of which is not affected by automation speed.",
      100,
      ["autoRestart2"]
    );
    this.addUnlockable(
      "guessWhenStuck",
      "Anti-Stuck 1",
      "When the autoclicker gets stuck, guess randomly after five minutes. Delay is reduced by automation speed.",
      100,
      ["autoRestart"]
    );
    this.addUnlockable(
      "autoSpeed1",
      "Fast Autoclicker 1",
      "Double automation speed.",
      8,
      ["autoClick"]
    );
    this.addUnlockable(
      "autoSpeed2",
      "Fast Autoclicker 2",
      "Double automation speed.",
      16,
      ["autoSpeed1"]
    );
    this.addUnlockable(
      "autoSpeed3",
      "Fast Autoclicker 3",
      "Double automation speed.",
      32,
      ["autoSpeed2"]
    );
    this.addUnlockable(
      "autoSpeed4",
      "Fast Autoclicker 4",
      "Double automation speed.",
      64,
      ["autoSpeed3"]
    );
    this.addUnlockable(
      "autoSpeed5",
      "Fast Autoclicker 5",
      "Ludicrous automation speed (250/s).",
      256,
      ["autoSpeed4"]
    );
    this.addUnlockable(
      "twoWorkers",
      "Two Autoclickers",
      "Add another autoclicker to each board that runs in the opposite direction.",
      50,
      ["autoSpeed1"]
    );
    this.addUnlockable(
      "boardMedium",
      "Medium Board",
      "Play on a bigger board, with more mines, worth more money.",
      8,
      []
    );
    this.addUnlockable(
      "boardLarge",
      "Large Board",
      "Play on an even bigger board, with even more mines, worth even more money.",
      20,
      ["boardMedium"]
    );
  }

  addUnlockable(key, title, desc, cost, reqs) {
    this.unlockables.set(key, {
      key: key,
      title: title,
      desc: desc,
      cost: cost,
      reqs: reqs,
    });
  }

  getUnlockable(key) {
    return this.unlockables.get(key);
  }
}
const unlockConfig = new UnlockConfig();
export default unlockConfig;
