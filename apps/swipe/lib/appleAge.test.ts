import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { appleAgeFailureCopy, readAppleAgeNativeResult } from "./appleAgeResult.ts";

describe("readAppleAgeNativeResult", () => {
  it("keeps unavailable distinct from declined", () => {
    assert.deepEqual(readAppleAgeNativeResult({ shared: false, reason: "apple_age_unavailable" }), {
      ok: false,
      reason: "apple_age_unavailable",
    });
    assert.deepEqual(readAppleAgeNativeResult({ shared: false, reason: "apple_age_declined" }), {
      ok: false,
      reason: "apple_age_declined",
    });
    assert.deepEqual(readAppleAgeNativeResult({ shared: false }), {
      ok: false,
      reason: "apple_age_unavailable",
    });
  });

  it("fails closed under 18 and accepts 18+", () => {
    assert.deepEqual(readAppleAgeNativeResult({ shared: true, lowerBound: 17 }), {
      ok: false,
      reason: "adult_only",
    });
    assert.deepEqual(readAppleAgeNativeResult({ shared: true, lowerBound: 18 }), {
      ok: true,
      lowerBound: 18,
    });
  });
});

describe("appleAgeFailureCopy", () => {
  it("calls the closed gate a finished age check, not a crash", () => {
    assert.match(appleAgeFailureCopy("apple_age_unavailable").body, /not a crash/i);
    assert.match(appleAgeFailureCopy("apple_age_unavailable").body, /Declared Age Range/i);
    assert.equal(appleAgeFailureCopy("apple_age_unavailable").retry, true);
    assert.equal(appleAgeFailureCopy("adult_only").retry, false);
    assert.match(appleAgeFailureCopy("adult_only").title, /18/);
  });
});
