import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { currentInstallId, newInstallId, resetInstallIdForTests } from "./installId.ts";

describe("installId", () => {
  it("creates a stable in-memory id until reset", () => {
    resetInstallIdForTests();
    const first = currentInstallId();
    const second = currentInstallId();
    assert.equal(first, second);
    assert.ok(first.length > 8);
  });

  it("mints a new id after reset", () => {
    resetInstallIdForTests();
    const first = newInstallId();
    const second = newInstallId();
    assert.notEqual(first, second);
  });
});
