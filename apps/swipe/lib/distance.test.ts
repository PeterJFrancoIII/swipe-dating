import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DISTANCE_FILTER_ANY,
  DISTANCE_FILTER_CHOICES,
  DISTANCE_LABELS,
  DISTANCE_SLIDER_STEPS,
  coarseRegionLabel,
  displayDistance,
  distanceBandFromSliderIndex,
  distanceSliderIndex,
  distanceSliderLabel,
} from "./distance.ts";

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
    for (const step of DISTANCE_SLIDER_STEPS) {
      assert.equal(/km|kilometer|\d+\.\d+/.test(step.label), false);
      assert.equal(/km|kilometer|\d+\.\d+/.test(step.tick), false);
    }
  });
});

describe("distance slider steps", () => {
  it("maps a max band from left (closest) to right (any)", () => {
    assert.equal(distanceSliderIndex("about_1_mile"), 0);
    assert.equal(distanceSliderIndex("about_5_miles"), 1);
    assert.equal(distanceSliderIndex(DISTANCE_FILTER_ANY), DISTANCE_SLIDER_STEPS.length - 1);
    assert.equal(distanceSliderIndex(""), DISTANCE_SLIDER_STEPS.length - 1);
    assert.equal(distanceBandFromSliderIndex(0), "about_1_mile");
    assert.equal(distanceBandFromSliderIndex(2), "about_15_miles");
    assert.equal(distanceBandFromSliderIndex(99), DISTANCE_FILTER_ANY);
    assert.equal(distanceSliderLabel("farther"), "Farther");
    assert.equal(distanceSliderLabel("unknown"), "Any distance");
  });
});
