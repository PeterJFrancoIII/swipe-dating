import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  deckActionsLocked,
  grantedBoostCaption,
  grantedInventoryAvailable,
  isTestingCard,
  swipeReachLabel,
} from "./swipeQuota.ts";

describe("swipe quota", () => {
  it("keeps labeled testing cards unlocked when remaining is 0", () => {
    assert.equal(isTestingCard({ synthetic: true }), true);
    assert.equal(deckActionsLocked(0, { synthetic: true }), false);
    assert.equal(deckActionsLocked(0, { testing_banner: "FAKE - For Internal System Testing Only" }), false);
    assert.equal(deckActionsLocked(0, { synthetic: false }), true);
    assert.equal(deckActionsLocked(3, { synthetic: false }), false);
    assert.equal(deckActionsLocked(undefined, null), false);
  });

  it("says out of swipes only when the real-member deck is locked", () => {
    assert.equal(swipeReachLabel(0, true), "Out of free swipes today");
    assert.equal(swipeReachLabel(0, false), "0 swipes left");
    assert.equal(swipeReachLabel(1, false), "1 swipe left");
  });

  it("treats Boost and Superlike as granted inventory only", () => {
    assert.equal(grantedInventoryAvailable(0), false);
    assert.equal(grantedInventoryAvailable(undefined), false);
    assert.equal(grantedInventoryAvailable(1), true);
    assert.equal(grantedBoostCaption(0), "");
    assert.equal(grantedBoostCaption(1), " · 1 granted Boost");
    assert.equal(grantedBoostCaption(2), " · 2 granted Boosts");
  });
});
