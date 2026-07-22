import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import { createRequestHandler } from "../src/app.js";

function request(method, path, value) {
  const stream = Readable.from(value === undefined ? [] : [Buffer.from(JSON.stringify(value))]);
  stream.method = method;
  stream.url = path;
  return stream;
}

test("health endpoint identifies synthetic JavaScript mode", async () => {
  const handle = createRequestHandler();
  const response = await handle(request("GET", "/healthz"));
  assert.equal(response.status, 200);
  assert.match(response.body, /javascript-rnd-synthetic-only/);
});

test("presence, discovery, reciprocal likes, and immediate withdrawal", async () => {
  const nowMs = 1_700_000_000_000;
  const handle = createRequestHandler({ now: () => nowMs });
  const credential = (subjectId) => ({
    subjectId,
    issuedAtMs: nowMs,
    expiresAtMs: nowMs + 3_600_000,
    issuer: "staging-mock",
    revoked: false,
  });
  for (const profileId of ["a", "b"]) {
    const response = await handle(
      request("PUT", "/v1/presence", {
        profileId,
        region: "rnd:test",
        issuedAtMs: nowMs,
        expiresAtMs: nowMs + 120_000,
        adultCredential: credential(profileId),
      }),
    );
    assert.equal(response.status, 200);
  }

  const discovery = await handle(
    request("GET", "/v1/discovery?region=rnd%3Atest&requesterProfileId=a"),
  );
  assert.deepEqual(JSON.parse(discovery.body), { profileIds: ["b"] });

  const firstLike = await handle(
    request("POST", "/v1/likes", { senderProfileId: "a", recipientProfileId: "b" }),
  );
  assert.equal(JSON.parse(firstLike.body).matched, false);
  const secondLike = await handle(
    request("POST", "/v1/likes", { senderProfileId: "b", recipientProfileId: "a" }),
  );
  assert.equal(JSON.parse(secondLike.body).matched, true);

  const withdrawal = await handle(request("DELETE", "/v1/presence/b"));
  assert.deepEqual(JSON.parse(withdrawal.body), { withdrawn: true });
});
