import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_RANKING_WEIGHTS,
  advanceProfileReveal,
  assertRankingInputSafe,
  evaluateDiscoveryCandidate,
  normalizeRankingWeights,
  rankDiscoveryCandidates,
} from "../src/index.js";

const viewer = Object.freeze({
  id: "viewer",
  immediateIntent: "casual_dating",
  relationalOpenness: "open_to_more",
  acceptedImmediateIntents: ["casual_dating", "friends_with_benefits"],
  acceptedRelationalOpenness: ["open_to_more", "relationship_possible"],
  boundaries: ["condoms_required", "public_first_meet", "no_drugs"],
  requiredBoundaries: ["condoms_required", "public_first_meet"],
  lifestyleTags: ["live_music", "hiking", "movie_night"],
  maxDistanceKm: 40,
});

function candidate(overrides = {}) {
  return {
    id: "candidate-a",
    immediateIntent: "friends_with_benefits",
    relationalOpenness: "relationship_possible",
    acceptedImmediateIntents: ["casual_dating"],
    acceptedRelationalOpenness: ["open_to_more"],
    boundaries: ["condoms_required", "public_first_meet", "no_drugs"],
    requiredBoundaries: ["condoms_required"],
    lifestyleTags: ["live_music", "hiking"],
    alignmentScore: 84,
    distanceKm: 8,
    ...overrides,
  };
}

test("ranking weights always normalize to exactly 100", () => {
  const result = normalizeRankingWeights({ intent: 9, boundaries: 3, lifestyle: 2, alignment: 5, distance: 1 });
  assert.equal(Object.values(result).reduce((sum, value) => sum + value, 0), 100);
  assert.deepEqual(normalizeRankingWeights({}), DEFAULT_RANKING_WEIGHTS);
});

test("mutual immediate and relational intent are required", () => {
  const result = evaluateDiscoveryCandidate({
    viewer,
    candidate: candidate({ acceptedRelationalOpenness: ["casual_only"] }),
  });
  assert.equal(result.eligible, false);
  assert.ok(result.exclusions.includes("candidate_does_not_accept_viewer_relational_openness"));
});

test("required boundary mismatch hard-excludes a candidate", () => {
  const result = evaluateDiscoveryCandidate({
    viewer,
    candidate: candidate({ boundaries: ["condoms_required"] }),
  });
  assert.equal(result.eligible, false);
  assert.ok(result.exclusions.includes("missing_boundary:public_first_meet"));
});

test("eligible candidates receive an explainable score", () => {
  const result = evaluateDiscoveryCandidate({ viewer, candidate: candidate() });
  assert.equal(result.eligible, true);
  assert.ok(result.score >= 0 && result.score <= 100);
  assert.equal(result.explanation.length, 5);
  assert.equal(result.revealStage, "bio_first");
});

test("user weights can change deterministic ordering", () => {
  const closeDifferentLifestyle = candidate({
    id: "close",
    lifestyleTags: ["gaming"],
    alignmentScore: 60,
    distanceKm: 1,
  });
  const fartherAlignedLifestyle = candidate({
    id: "aligned",
    lifestyleTags: ["live_music", "hiking", "movie_night"],
    alignmentScore: 98,
    distanceKm: 30,
  });

  const distanceFirst = rankDiscoveryCandidates({
    viewer,
    candidates: [fartherAlignedLifestyle, closeDifferentLifestyle],
    weights: { intent: 0, boundaries: 0, lifestyle: 0, alignment: 0, distance: 100 },
  });
  assert.equal(distanceFirst[0].candidate.id, "close");

  const compatibilityFirst = rankDiscoveryCandidates({
    viewer,
    candidates: [fartherAlignedLifestyle, closeDifferentLifestyle],
    weights: { intent: 0, boundaries: 0, lifestyle: 50, alignment: 50, distance: 0 },
  });
  assert.equal(compatibilityFirst[0].candidate.id, "aligned");
});

test("profile photos reveal only after a non-visual micro-interaction", () => {
  assert.equal(advanceProfileReveal("bio_first", "swipe_right"), "bio_first");
  assert.equal(advanceProfileReveal("bio_first", "inspect_tags"), "photo_revealed");
  assert.equal(advanceProfileReveal("photo_revealed", "read_bio"), "photo_revealed");
});

test("protected, inferred, popularity, and purchase fields are forbidden ranking inputs", () => {
  assert.throws(
    () => assertRankingInputSafe({ candidate: { attractiveness: 90, purchases: 4 } }),
    /Forbidden ranking input/,
  );
  assert.equal(assertRankingInputSafe({ candidate: { alignmentScore: 90, distanceKm: 3 } }), true);
});
