import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";

import { FORM_UPLOAD_TIMEOUT_MESSAGE, FORM_UPLOAD_TIMEOUT_MS, withTimeout } from "./requestTimeout.ts";

describe("form upload timeout", () => {
  afterEach(() => {
    mock.timers.reset();
  });

  it("uses the 90s network envelope, not 25s", () => {
    assert.equal(FORM_UPLOAD_TIMEOUT_MS, 90_000);
    assert.ok(FORM_UPLOAD_TIMEOUT_MS > 25_000);
  });

  it("does not time out a form request that lasts longer than 25s", async () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    let finished = false;
    const pending = withTimeout(
      new Promise<string>((resolve) => {
        setTimeout(() => {
          finished = true;
          resolve("ok");
        }, 26_000);
      }),
      FORM_UPLOAD_TIMEOUT_MS,
      FORM_UPLOAD_TIMEOUT_MESSAGE,
    );
    mock.timers.tick(26_000);
    assert.equal(await pending, "ok");
    assert.equal(finished, true);
  });

  it("still times out after the 90s envelope", async () => {
    mock.timers.enable({ apis: ["setTimeout"] });
    const pending = withTimeout(
      new Promise<string>(() => {
        /* hangs until the envelope */
      }),
      FORM_UPLOAD_TIMEOUT_MS,
      FORM_UPLOAD_TIMEOUT_MESSAGE,
    );
    mock.timers.tick(90_000);
    await assert.rejects(pending, { message: FORM_UPLOAD_TIMEOUT_MESSAGE });
  });
});
