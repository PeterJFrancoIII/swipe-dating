import assert from "node:assert/strict";
import test from "node:test";

import { derivePairwiseQuotaKey, deriveRotatingEncounterId } from "../src/index.js";

test("encounter identifiers rotate by epoch and session", () => {
  const secret = Buffer.alloc(32, 7);
  const first = deriveRotatingEncounterId({
    secret,
    epoch: 10,
    sessionNonceHex: "01".repeat(16),
  });
  const nextEpoch = deriveRotatingEncounterId({
    secret,
    epoch: 11,
    sessionNonceHex: "01".repeat(16),
  });
  const nextSession = deriveRotatingEncounterId({
    secret,
    epoch: 10,
    sessionNonceHex: "02".repeat(16),
  });
  assert.notEqual(first, nextEpoch);
  assert.notEqual(first, nextSession);
  assert.equal(first.length, 32);
});

test("quota identifiers rotate and are scoped by service", () => {
  const serverSecret = Buffer.alloc(32, 9);
  const first = derivePairwiseQuotaKey({
    serverSecret,
    service: "discovery",
    subjectToken: "opaque-user-token",
    epoch: 1,
  });
  const next = derivePairwiseQuotaKey({
    serverSecret,
    service: "discovery",
    subjectToken: "opaque-user-token",
    epoch: 2,
  });
  const otherService = derivePairwiseQuotaKey({
    serverSecret,
    service: "likes",
    subjectToken: "opaque-user-token",
    epoch: 1,
  });
  assert.notEqual(first, next);
  assert.notEqual(first, otherService);
});
