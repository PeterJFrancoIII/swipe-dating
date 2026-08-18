import assert from "node:assert/strict";
import { test } from "node:test";

import { shouldPersist, snapshotKey } from "./autosave.ts";

test("autosave compare", () => {
  const key = snapshotKey({ about: "hi", tags: ["a"] });
  assert.equal(shouldPersist(key, { about: "hi", tags: ["a"] }), false);
  assert.equal(shouldPersist(key, { about: "hello", tags: ["a"] }), true);
});
