import assert from "node:assert/strict";
import test from "node:test";

import {
  LOCATION_MODE,
  PROXIMITY_DECISION,
  PROXIMITY_DISCLOSURE,
  RISK_ACTION,
  RendezvousStore,
  assessRisk,
  createAdultCredential,
  decideProximityEvent,
  filterKeyAllowed,
  isAdultOn,
  issueLocationGrant,
  locationGrantIsActive,
  revokeLocationGrant,
  scoreAlignment,
  validateSkinManifest,
} from "../src/index.js";

test("exact eighteenth-birthday boundary rejects tomorrow and accepts today", () => {
  assert.equal(isAdultOn("2008-07-22", "2026-07-21"), false);
  assert.equal(isAdultOn("2008-07-21", "2026-07-21"), true);
  assert.equal(isAdultOn("not-a-date", "2026-07-21"), false);
});

test("alignment uses reciprocal weights and dealbreakers", () => {
  const left = {
    questionnaireId: "v1",
    answers: {
      values: { answerId: "health", importance: 5 },
      structure: { answerId: "monogamy", importance: 5, dealbreaker: true },
    },
  };
  const right = {
    questionnaireId: "v1",
    answers: {
      values: { answerId: "health", importance: 2 },
      structure: { answerId: "polyamory", importance: 4 },
    },
  };
  const result = scoreAlignment(left, right);
  assert.equal(result.scorePercent, 0);
  assert.equal(result.dealbreakerConflict, true);
  assert.equal(result.matchedWeight, 2);
});

test("protected and inferred traits are never valid filters", () => {
  assert.equal(filterKeyAllowed("race"), false);
  assert.equal(filterKeyAllowed("inferred_intelligence"), false);
  assert.equal(filterKeyAllowed("activity_level"), true);
});

test("proximity is suppressed by default and prompt-first when enabled", () => {
  assert.equal(
    decideProximityEvent({ adultCredentialValid: true }),
    PROXIMITY_DECISION.SUPPRESS,
  );
  assert.equal(
    decideProximityEvent({
      adultCredentialValid: true,
      disclosure: PROXIMITY_DISCLOSURE.PROMPT_BEFORE_SHARING,
      independentlyCompatible: true,
    }),
    PROXIMITY_DECISION.BUZZ_AND_PROMPT,
  );
  assert.equal(
    decideProximityEvent({
      adultCredentialValid: true,
      disclosure: PROXIMITY_DISCLOSURE.AUTO_SHARE_COMPATIBLE,
      independentlyCompatible: false,
    }),
    PROXIMITY_DECISION.BUZZ_ONLY,
  );
});

test("precise location requires confirmation, expires, and revokes", () => {
  assert.throws(
    () =>
      issueLocationGrant({
        shareId: "s1",
        senderProfileId: "a",
        recipientProfileId: "b",
        mode: LOCATION_MODE.LIVE_15_MINUTES,
        issuedAtMs: 1_000,
        sequence: 1,
      }),
    /second explicit confirmation/,
  );
  const grant = issueLocationGrant({
    shareId: "s1",
    senderProfileId: "a",
    recipientProfileId: "b",
    mode: LOCATION_MODE.LIVE_15_MINUTES,
    issuedAtMs: 1_000,
    sequence: 1,
    preciseConfirmation: true,
  });
  assert.equal(locationGrantIsActive(grant, 1_000 + 14 * 60_000), true);
  assert.equal(locationGrantIsActive(grant, 1_000 + 15 * 60_000), false);
  assert.equal(locationGrantIsActive(revokeLocationGrant(grant, 2_000), 3_000), false);
});

test("skin manifests reject executable formats and remote references", () => {
  const result = validateSkinManifest({
    assetId: "x",
    creatorId: "c",
    mimeType: "text/html",
    byteLength: 10,
    width: 10,
    height: 10,
    frameCount: 1,
    integritySha256: "a".repeat(64),
    remoteReferences: ["https://example.invalid/script.js"],
  });
  assert.equal(result.valid, false);
  assert.ok(result.reasons.includes("mime_not_allowed"));
  assert.ok(result.reasons.includes("remote_references_forbidden"));
});

test("normal human activity is allowed and automated abuse receives friction", () => {
  assert.equal(
    assessRisk({
      adultCredentialValid: true,
      attestation: "hardware_backed",
      discoveryRequestsMinute: 4,
      likesMinute: 2,
    }).action,
    RISK_ACTION.ALLOW,
  );
  assert.equal(
    assessRisk({
      adultCredentialValid: false,
      attestation: "hardware_backed",
    }).action,
    RISK_ACTION.DENY,
  );
  assert.notEqual(
    assessRisk({
      adultCredentialValid: true,
      attestation: "unsupported",
      discoveryRequestsMinute: 500,
      profileFetchesMinute: 500,
      bleReplayHits24h: 2,
    }).action,
    RISK_ACTION.ALLOW,
  );
});

test("rendezvous presence is adult-bound, ephemeral, self-filtered, and reciprocal", () => {
  const nowMs = 1_700_000_000_000;
  const store = new RendezvousStore();
  const credentialA = createAdultCredential({
    subjectId: "a",
    issuedAtMs: nowMs,
    expiresAtMs: nowMs + 60 * 60_000,
  });
  const credentialB = createAdultCredential({
    subjectId: "b",
    issuedAtMs: nowMs,
    expiresAtMs: nowMs + 60 * 60_000,
  });
  assert.throws(
    () =>
      store.publishPresence({
        profileId: "a",
        region: "rnd:test",
        issuedAtMs: nowMs,
        expiresAtMs: nowMs + 120_000,
        adultCredential: credentialB,
      }),
    /subject-bound/,
  );
  store.publishPresence({
    profileId: "a",
    region: "rnd:test",
    issuedAtMs: nowMs,
    expiresAtMs: nowMs + 120_000,
    adultCredential: credentialA,
  });
  store.publishPresence({
    profileId: "b",
    region: "rnd:test",
    issuedAtMs: nowMs,
    expiresAtMs: nowMs + 120_000,
    adultCredential: credentialB,
  });
  assert.deepEqual(store.discover({ region: "rnd:test", requesterProfileId: "a", nowMs }), ["b"]);
  assert.equal(store.recordLike({ senderProfileId: "a", recipientProfileId: "b", nowMs }), null);
  assert.deepEqual(
    store.recordLike({ senderProfileId: "b", recipientProfileId: "a", nowMs }),
    { profileA: "a", profileB: "b", matchedAtMs: nowMs },
  );
  assert.equal(store.withdrawPresence("b"), true);
  assert.deepEqual(store.discover({ region: "rnd:test", requesterProfileId: "a", nowMs }), []);
});
