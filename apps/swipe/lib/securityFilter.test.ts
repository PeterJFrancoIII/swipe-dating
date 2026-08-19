import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isSecurityControlRequest } from "./securityFilter.ts";

describe("security hold", () => {
  it("holds cybersecurity and age-gate bypass asks, not ordinary product ideas", () => {
    assert.equal(isSecurityControlRequest("please weaken encryption"), true);
    assert.equal(isSecurityControlRequest("bypass age so teens can join"), true);
    assert.equal(isSecurityControlRequest("getfkd://settings/distance", "cyber security audit from users"), true);
    assert.equal(isSecurityControlRequest("getfkd://swipe/deck/like", "the heart button is too small"), false);
  });
});
