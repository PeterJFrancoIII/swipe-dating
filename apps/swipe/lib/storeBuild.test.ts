import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isInternalDogfoodBuild } from "./storeBuild.ts";

describe("store build", () => {
  it("treats the Node test runner as a store binary", () => {
    assert.equal(isInternalDogfoodBuild(), false);
  });
});
