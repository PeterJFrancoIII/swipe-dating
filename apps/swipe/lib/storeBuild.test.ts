import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isInternalDogfoodBuild } from "./storeBuild.ts";

describe("store build", () => {
  it("treats the Node test runner as a store binary", () => {
    assert.equal(isInternalDogfoodBuild(), false);
  });

  it("hides dogfood chrome when store screenshots are requested", () => {
    const previous = process.env.EXPO_PUBLIC_STORE_SCREENSHOTS;
    process.env.EXPO_PUBLIC_STORE_SCREENSHOTS = "1";
    assert.equal(isInternalDogfoodBuild(), false);
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_STORE_SCREENSHOTS;
    } else {
      process.env.EXPO_PUBLIC_STORE_SCREENSHOTS = previous;
    }
  });
});
