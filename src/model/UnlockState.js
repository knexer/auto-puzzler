import { proxyMap } from "valtio/utils";

import unlockConfig from "../UnlockConfig";

export default class UnlockState {
  constructor(deserialized = null) {
    const deserializedMap = deserialized
      ? new Map(Object.entries(deserialized))
      : new Map();
    this.unlocks = new proxyMap(
      Array.from(unlockConfig.unlockables.keys()).map((key) => [
        key,
        deserializedMap.get(key),
      ])
    );
  }

  serialize() {
    return this.getUnlockedUpgrades();
  }

  unlockUpgrade(key) {
    this.unlocks.set(key, true);
  }

  getUnlockedUpgrades() {
    return Object.fromEntries(this.unlocks);
  }

  isAvailable(key) {
    const unlockable = unlockConfig.getUnlockable(key);
    return (
      unlockable.reqs.length === 0 ||
      unlockable.reqs.some((req) => this.isUnlocked(req))
    );
  }

  isUnlocked(key) {
    return this.unlocks.get(key);
  }

  automationSpeed() {
    let numIntervalUpgrades = 0;
    const unlocks = this.unlocks;
    if (unlocks.get("autoSpeed1")) numIntervalUpgrades++;
    if (unlocks.get("autoSpeed2")) numIntervalUpgrades++;
    if (unlocks.get("autoSpeed3")) numIntervalUpgrades++;
    if (unlocks.get("autoSpeed4")) numIntervalUpgrades++;
    if (unlocks.get("autoSpeed5")) numIntervalUpgrades += 2;

    // Maxes out at 4ms delay because that's how timers work
    return Math.pow(2, numIntervalUpgrades);
  }
}
