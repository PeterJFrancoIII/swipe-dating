import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { signupErrorMessage } from "./signupErrors.ts";

describe("signupErrorMessage", () => {
  it("hides which signal fired", () => {
    assert.equal(signupErrorMessage("signup_unauthentic", "nope"), "This signup could not be verified.");
    assert.equal(signupErrorMessage("signup_rate_limited", "nope"), "Slow down and try again later.");
    assert.equal(signupErrorMessage("photo_reused", "nope"), "Choose a different photo.");
    assert.equal(signupErrorMessage("session_required", "nope"), "Your session expired. Try again.");
    assert.equal(signupErrorMessage("other", "Age check failed."), "Age check failed.");
  });
});
