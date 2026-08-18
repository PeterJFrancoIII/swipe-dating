import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TESTING_CARD_BANNER, testingBanner } from "./testingCard.ts";

describe("testing cards", () => {
  it("uses the exact internal-testing banner", () => {
    assert.equal(TESTING_CARD_BANNER, "FAKE - For Internal System Testing Only");
    assert.equal(testingBanner({ synthetic: true }), TESTING_CARD_BANNER);
    assert.equal(testingBanner({ testing_banner: TESTING_CARD_BANNER }), TESTING_CARD_BANNER);
    assert.equal(testingBanner({ synthetic: false }), "");
    assert.equal(testingBanner(null), "");
  });
});
