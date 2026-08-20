import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { photoConsentShouldPrompt } from "./photoConsent.ts";

describe("photo consent", () => {
  it("asks once before the library prompt", () => {
    assert.equal(photoConsentShouldPrompt(null), true);
    assert.equal(photoConsentShouldPrompt("1"), false);
  });
});
