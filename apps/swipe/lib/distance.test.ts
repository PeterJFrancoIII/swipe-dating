import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DISTANCE_FILTER_CHOICES, DISTANCE_LABELS, coarseRegionLabel, displayDistance } from "./distance.ts";

describe("distance labels", () => {
  it("never returns a kilometer number or tenths", () => {
    for (const label of [
      ...[1, 8, 9, 20, 21, undefined].map((value) => coarseRegionLabel(value)),
      ...DISTANCE_LABELS,
      displayDistance("Same city"),
    ]) {
      assert.equal(/km|kilometer|\d+\.\d+/.test(label), false);
    }
    assert.equal(coarseRegionLabel(1), "About 1 mile");
    assert.equal(coarseRegionLabel(undefined), "Distance unavailable");
    assert.equal(displayDistance("About 5 miles"), "About 5 miles");
    assert.equal(displayDistance("Nearby"), "Distance unavailable");
    for (const choice of DISTANCE_FILTER_CHOICES) {
      assert.equal(/km|kilometer|\d+\.\d+/.test(choice.label), false);
    }
  });
});
