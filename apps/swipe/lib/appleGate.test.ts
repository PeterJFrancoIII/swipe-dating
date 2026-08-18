import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shouldShowAppleSignIn } from "./appleGate.ts";

describe("shouldShowAppleSignIn", () => {
  it("shows Sign in with Apple on iOS when the session is not bound", () => {
    assert.equal(shouldShowAppleSignIn(false, "ios"), true);
    assert.equal(shouldShowAppleSignIn(true, "ios"), false);
  });

  it("does not hard-stop Metro web", () => {
    assert.equal(shouldShowAppleSignIn(false, "web"), false);
  });
});
