import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { locationConsentShouldPrompt } from "./locationConsent.ts";

describe("location consent", () => {
  it("asks once before the iOS location prompt", () => {
    assert.equal(locationConsentShouldPrompt(null), true);
    assert.equal(locationConsentShouldPrompt("1"), false);
  });
});
