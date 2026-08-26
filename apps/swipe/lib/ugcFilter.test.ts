import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { UGC_BLOCKED_NOTICE, ugcRejection } from "./ugcFilter.ts";

describe("ugcRejection", () => {
  it("allows ordinary adult dating and sexual copy", () => {
    assert.equal(ugcRejection("Looking for casual sex with another adult"), null);
    assert.equal(ugcRejection("Come over tonight"), null);
    assert.equal(ugcRejection(""), null);
  });

  it("fails closed on underage and CSAM copy", () => {
    assert.equal(ugcRejection("I am under 18"), UGC_BLOCKED_NOTICE);
    assert.equal(ugcRejection("16 year old"), UGC_BLOCKED_NOTICE);
    assert.equal(ugcRejection("child porn"), UGC_BLOCKED_NOTICE);
    assert.equal(ugcRejection("dating a minor"), UGC_BLOCKED_NOTICE);
  });
});
