import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { adultGate, completedAgeYears, parseDateOnly } from "./adult.ts";

describe("adultGate", () => {
  const today = new Date("2026-08-14T12:00:00Z");

  it("fails closed on missing or invalid dates", () => {
    assert.equal(adultGate("", today).ok, false);
    assert.equal(adultGate("not-a-date", today).ok, false);
    assert.equal(adultGate("2026-02-31", today).ok, false);
  });

  it("fails closed under 18", () => {
    const result = adultGate("2008-08-15", today);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /18/);
    }
  });

  it("accepts an 18th birthday", () => {
    assert.deepEqual(adultGate("2008-08-14", today), { ok: true });
  });

  it("rejects a future birth date", () => {
    const result = adultGate("2026-08-15", today);
    assert.equal(result.ok, false);
  });
});

describe("parseDateOnly and completedAgeYears", () => {
  it("rejects impossible calendar days", () => {
    assert.equal(parseDateOnly("2026-13-01"), null);
    assert.equal(parseDateOnly("2026-02-30"), null);
  });

  it("counts age before the birthday", () => {
    const birth = parseDateOnly("2000-08-15");
    assert.ok(birth);
    assert.equal(completedAgeYears(birth, new Date("2026-08-14T12:00:00Z")), 25);
  });
});
