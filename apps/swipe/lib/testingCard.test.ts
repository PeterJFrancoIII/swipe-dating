import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TESTING_CARD_BANNER, testingBanner } from "./testingCard.ts";

describe("testing cards", () => {
  it("uses the exact internal-testing banner only for dogfood", () => {
    assert.equal(TESTING_CARD_BANNER, "FAKE - For Internal System Testing Only");
    assert.equal(testingBanner({ synthetic: true }, { internal: true }), TESTING_CARD_BANNER);
    assert.equal(testingBanner({ testing_banner: TESTING_CARD_BANNER }, { internal: true }), TESTING_CARD_BANNER);
    assert.equal(testingBanner({ synthetic: true }, { internal: false }), "");
    assert.equal(testingBanner({ synthetic: false }, { internal: true }), "");
    assert.equal(testingBanner(null, { internal: true }), "");
  });

  it("hides the banner on store binaries", () => {
    assert.equal(testingBanner({ synthetic: true }), "");
    assert.equal(testingBanner({ testing_banner: TESTING_CARD_BANNER }), "");
  });
});
