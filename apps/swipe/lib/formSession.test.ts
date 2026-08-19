import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { attachSessionField, isFormBody } from "./formSession.ts";

describe("attachSessionField", () => {
  it("puts the live token on the multipart session field", () => {
    const form = new FormData();
    form.append("photo", "bytes");
    attachSessionField(form, "  live-token  ");
    assert.deepEqual(form.getAll("session"), ["live-token"]);
  });

  it("does not invent a session when the token is missing", () => {
    const form = new FormData();
    attachSessionField(form, "   ");
    assert.deepEqual(form.getAll("session"), []);
  });

  it("does not append a second session field", () => {
    const form = new FormData();
    attachSessionField(form, "first");
    attachSessionField(form, "second");
    assert.deepEqual(form.getAll("session"), ["first"]);
  });
});

describe("isFormBody", () => {
  it("accepts objects that can append parts, not only instanceof FormData", () => {
    const duck = {
      _parts: [] as Array<[string, string]>,
      append(key: string, value: string) {
        this._parts.push([key, value]);
      },
      getAll(key: string) {
        return this._parts.filter(([name]) => name === key).map(([, value]) => value);
      },
    };
    assert.equal(isFormBody(duck), true);
    assert.equal(isFormBody({}), false);
    assert.equal(isFormBody("token"), false);
  });
});
