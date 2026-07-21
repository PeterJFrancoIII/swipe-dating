import {
  PROXIMITY_DISCLOSURE,
  RendezvousStore,
  assessRisk,
  createAdultCredential,
  decideProximityEvent,
  isAdultOn,
  scoreAlignment,
} from "@swipe/rnd-domain";
import { deriveRotatingEncounterId } from "@swipe/rnd-crypto-node";

const nowMs = Date.UTC(2026, 6, 21, 16, 0, 0);
const store = new RendezvousStore();
const credential = (subjectId) =>
  createAdultCredential({ subjectId, issuedAtMs: nowMs, expiresAtMs: nowMs + 3_600_000 });

for (const profileId of ["alice", "bob"]) {
  store.publishPresence({
    profileId,
    region: "rnd:test-region",
    issuedAtMs: nowMs,
    expiresAtMs: nowMs + 120_000,
    adultCredential: credential(profileId),
  });
}

const firstLike = store.recordLike({ senderProfileId: "alice", recipientProfileId: "bob", nowMs });
const reciprocalLike = store.recordLike({ senderProfileId: "bob", recipientProfileId: "alice", nowMs });
const alignment = scoreAlignment(
  {
    questionnaireId: "alignment-us-en-v1",
    answers: {
      relationship: { answerId: "dating", importance: 5 },
      health_money: { answerId: "balance", importance: 4 },
    },
  },
  {
    questionnaireId: "alignment-us-en-v1",
    answers: {
      relationship: { answerId: "dating", importance: 4 },
      health_money: { answerId: "balance", importance: 5 },
    },
  },
);

const output = {
  runtime: "JavaScript / Node.js",
  syntheticOnly: true,
  adultBoundary: {
    turns18Today: isAdultOn("2008-07-21", "2026-07-21"),
    turns18Tomorrow: isAdultOn("2008-07-22", "2026-07-21"),
  },
  discoveryForAlice: store.discover({
    region: "rnd:test-region",
    requesterProfileId: "alice",
    nowMs,
  }),
  firstLikeMatches: firstLike !== null,
  reciprocalLikeMatches: reciprocalLike !== null,
  alignmentPercent: alignment.scorePercent,
  proximityDecision: decideProximityEvent({
    adultCredentialValid: true,
    disclosure: PROXIMITY_DISCLOSURE.PROMPT_BEFORE_SHARING,
    independentlyCompatible: true,
  }),
  rotatingEncounterId: deriveRotatingEncounterId({
    secret: Buffer.alloc(32, 7),
    epoch: 1,
    sessionNonceHex: "01".repeat(16),
  }),
  botRisk: assessRisk({
    adultCredentialValid: true,
    attestation: "hardware_backed",
    discoveryRequestsMinute: 8,
    likesMinute: 2,
  }),
};

console.log(JSON.stringify(output, null, 2));
