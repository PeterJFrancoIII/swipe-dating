import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DISTANCE_FILTER_ANY,
  DISTANCE_FILTER_CHOICES,
  DISTANCE_FILTER_MAX_MILES,
  DISTANCE_LABELS,
  coarseRegionLabel,
  displayDistance,
  distanceSliderIndex,
  distanceSliderLabel,
  milesFromSliderIndex,
  parseMaxDistanceMiles,
} from "./distance.ts";

describe("distance labels", () => {
  it("never returns a kilometer number or tenths", () => {
    for (const label of [
      ...[1, 8, 9, 20, 21, undefined].map((value) => coarseRegionLabel(value)),
      ...DISTANCE_LABELS,
      displayDistance("Same city"),
      distanceSliderLabel(1),
      distanceSliderLabel(500),
      distanceSliderLabel(null),
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

describe("distance slider miles", () => {
  it("maps 1 through 500, then infinite", () => {
    assert.equal(distanceSliderIndex(1), 0);
    assert.equal(distanceSliderIndex(500), DISTANCE_FILTER_MAX_MILES - 1);
    assert.equal(distanceSliderIndex(null), DISTANCE_FILTER_MAX_MILES);
    assert.equal(milesFromSliderIndex(0), 1);
    assert.equal(milesFromSliderIndex(249), 250);
    assert.equal(milesFromSliderIndex(499), 500);
    assert.equal(milesFromSliderIndex(500), null);
    assert.equal(distanceSliderLabel(1), "1 mile");
    assert.equal(distanceSliderLabel(47), "47 miles");
    assert.equal(distanceSliderLabel(null), "Any distance");
    assert.equal(parseMaxDistanceMiles(75), 75);
    assert.equal(parseMaxDistanceMiles(0), null);
    assert.equal(parseMaxDistanceMiles(null), null);
    assert.equal(parseMaxDistanceMiles(undefined, DISTANCE_FILTER_ANY), null);
    assert.equal(parseMaxDistanceMiles(undefined, "about_15_miles"), 15);
    assert.equal(parseMaxDistanceMiles(null, "about_15_miles"), null);
    assert.equal(parseMaxDistanceMiles(900), 500);
  });
});
