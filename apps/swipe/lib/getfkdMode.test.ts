import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { GETFKD_ENTER_BODY, GETFKD_EXIT_BODY, shouldPromptGetFkdExit } from "./getfkdMode.ts";

describe("Get Fk'd mode copy", () => {
  it("warns that location is only for mutual mode matches", () => {
    assert.match(GETFKD_ENTER_BODY, /location/i);
    assert.match(GETFKD_ENTER_BODY, /both/i);
    assert.match(GETFKD_ENTER_BODY, /1 mile/i);
    assert.match(GETFKD_ENTER_BODY, /Bluetooth/i);
    assert.match(GETFKD_ENTER_BODY, /exact distance/i);
    assert.match(GETFKD_EXIT_BODY, /numbers/i);
  });

  it("skips the exit prompt when the user asked not to see it", () => {
    assert.equal(shouldPromptGetFkdExit(false), true);
    assert.equal(shouldPromptGetFkdExit(true), false);
  });
});
