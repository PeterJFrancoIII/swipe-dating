import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { surfaceFromRoute, surfaceHref, surfaceTag, withSurfaceLine } from "./surfaces.ts";

describe("surface links", () => {
  it("builds getfkd hrefs and keeps them on the report body", () => {
    assert.equal(surfaceHref("swipe", "deck", "like"), "getfkd://swipe/deck/like");
    assert.equal(surfaceFromRoute("/filters").href, "getfkd://route/filters");
    assert.equal(surfaceTag("getfkd://swipe/deck/like"), "surface:swipe-deck-like");
    assert.equal(withSurfaceLine("getfkd://settings/distance"), "Surface: getfkd://settings/distance");
    assert.match(withSurfaceLine("getfkd://chat/send", "The send button lags."), /Surface: getfkd:\/\/chat\/send/);
  });
});
