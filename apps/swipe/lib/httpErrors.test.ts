import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { payloadFromFailedResponse } from "./httpErrors.ts";

describe("payloadFromFailedResponse", () => {
  it("keeps a JSON API error", () => {
    assert.deepEqual(payloadFromFailedResponse(400, { error: "Choose a different photo.", code: "photo_reused" }), {
      error: "Choose a different photo.",
      code: "photo_reused",
    });
  });

  it("maps a non-JSON 413 to photo_too_large", () => {
    assert.deepEqual(payloadFromFailedResponse(413, {}), {
      error: "That photo is too large. Try a smaller one.",
      code: "photo_too_large",
    });
  });
});
