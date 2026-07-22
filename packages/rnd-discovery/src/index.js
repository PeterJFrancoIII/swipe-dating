export const IMMEDIATE_INTENTS = Object.freeze([
  "casual_tonight",
  "friends_with_benefits",
  "casual_dating",
  "open_dating",
  "relationship_focused",
  "figuring_it_out",
]);

export const RELATIONAL_OPENNESS = Object.freeze([
  "casual_only",
  "open_to_more",
  "relationship_possible",
  "seeking_relationship",
]);

export const BOUNDARY_TAGS = Object.freeze([
  "condoms_required",
  "recent_testing_discussion",
  "public_first_meet",
  "sober_meetup",
  "no_group_encounters",
  "group_encounter_open",
  "no_smoking",
  "no_drugs",
]);

export const RANKING_DIMENSIONS = Object.freeze([
  "intent",
  "boundaries",
  "lifestyle",
  "alignment",
  "distance",
]);

export const DEFAULT_RANKING_WEIGHTS = Object.freeze({
  intent: 30,
  boundaries: 25,
  lifestyle: 15,
  alignment: 20,
  distance: 10,
});

const FORBIDDEN_RANKING_KEYS = Object.freeze([
  "race",
  "ethnicity",
  "skinColor",
  "disability",
  "height",
  "attractiveness",
  "intelligence",
  "hygiene",
  "sexuality",
  "gender",
  "fitness",
  "grooming",
  "bodyHair",
  "spending",
  "purchases",
  "popularity",
]);

export function normalizeRankingWeights(input = DEFAULT_RANKING_WEIGHTS) {
  const weights = Object.fromEntries(
    RANKING_DIMENSIONS.map((key) => [key, clampNumber(input[key], 0, 100)]),
  );
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

  if (total === 0) return { ...DEFAULT_RANKING_WEIGHTS };

  const normalized = {};
  let assigned = 0;
  RANKING_DIMENSIONS.forEach((key, index) => {
    const value = index === RANKING_DIMENSIONS.length - 1
      ? 100 - assigned
      : Math.round((weights[key] / total) * 100);
    normalized[key] = value;
    assigned += value;
  });
  return normalized;
}

export function assertRankingInputSafe(input) {
  const keys = collectKeys(input);
  const forbidden = FORBIDDEN_RANKING_KEYS.filter((key) => keys.has(key));
  if (forbidden.length > 0) {
    throw new Error(`Forbidden ranking input: ${forbidden.join(", ")}`);
  }
  return true;
}

export function evaluateDiscoveryCandidate({ viewer, candidate, weights }) {
  assertRankingInputSafe({ viewer, candidate });
  const normalizedWeights = normalizeRankingWeights(weights);

  const exclusions = [];
  if (!candidate.acceptedImmediateIntents?.includes(viewer.immediateIntent)) {
    exclusions.push("candidate_does_not_accept_viewer_immediate_intent");
  }
  if (!viewer.acceptedImmediateIntents?.includes(candidate.immediateIntent)) {
    exclusions.push("viewer_does_not_accept_candidate_immediate_intent");
  }
  if (!candidate.acceptedRelationalOpenness?.includes(viewer.relationalOpenness)) {
    exclusions.push("candidate_does_not_accept_viewer_relational_openness");
  }
  if (!viewer.acceptedRelationalOpenness?.includes(candidate.relationalOpenness)) {
    exclusions.push("viewer_does_not_accept_candidate_relational_openness");
  }

  const viewerRequired = new Set(viewer.requiredBoundaries ?? []);
  const candidateBoundaries = new Set(candidate.boundaries ?? []);
  for (const boundary of viewerRequired) {
    if (!candidateBoundaries.has(boundary)) exclusions.push(`missing_boundary:${boundary}`);
  }

  const candidateRequired = new Set(candidate.requiredBoundaries ?? []);
  const viewerBoundaries = new Set(viewer.boundaries ?? []);
  for (const boundary of candidateRequired) {
    if (!viewerBoundaries.has(boundary)) exclusions.push(`viewer_missing_boundary:${boundary}`);
  }

  if (exclusions.length > 0) {
    return {
      eligible: false,
      score: 0,
      exclusions,
      explanation: [],
      revealStage: "hidden",
    };
  }

  const components = {
    intent: intentCompatibility(viewer, candidate),
    boundaries: setOverlapScore(viewer.boundaries, candidate.boundaries),
    lifestyle: setOverlapScore(viewer.lifestyleTags, candidate.lifestyleTags),
    alignment: clampNumber(candidate.alignmentScore, 0, 100),
    distance: distanceScore(candidate.distanceKm, viewer.maxDistanceKm),
  };

  const score = Math.round(
    RANKING_DIMENSIONS.reduce(
      (sum, key) => sum + components[key] * (normalizedWeights[key] / 100),
      0,
    ),
  );

  const explanation = RANKING_DIMENSIONS
    .map((key) => ({ key, component: components[key], weight: normalizedWeights[key] }))
    .sort((a, b) => b.component * b.weight - a.component * a.weight);

  return {
    eligible: true,
    score,
    exclusions: [],
    explanation,
    revealStage: "bio_first",
  };
}

export function rankDiscoveryCandidates({ viewer, candidates, weights }) {
  return candidates
    .map((candidate) => ({
      candidate,
      result: evaluateDiscoveryCandidate({ viewer, candidate, weights }),
    }))
    .filter(({ result }) => result.eligible)
    .sort((a, b) => b.result.score - a.result.score || a.candidate.id.localeCompare(b.candidate.id));
}

export function advanceProfileReveal(currentStage, interaction) {
  if (currentStage === "hidden") return "hidden";
  if (currentStage === "bio_first" && ["read_bio", "inspect_tags", "view_explanation"].includes(interaction)) {
    return "photo_revealed";
  }
  return currentStage;
}

function intentCompatibility(viewer, candidate) {
  let score = 50;
  if (viewer.immediateIntent === candidate.immediateIntent) score += 30;
  if (viewer.relationalOpenness === candidate.relationalOpenness) score += 20;
  return clampNumber(score, 0, 100);
}

function setOverlapScore(left = [], right = []) {
  const a = new Set(left);
  const b = new Set(right);
  if (a.size === 0 && b.size === 0) return 50;
  const union = new Set([...a, ...b]);
  const intersection = [...a].filter((value) => b.has(value));
  return Math.round((intersection.length / Math.max(1, union.size)) * 100);
}

function distanceScore(distanceKm, maxDistanceKm) {
  const max = clampNumber(maxDistanceKm, 1, 500);
  const distance = clampNumber(distanceKm, 0, 10000);
  if (distance > max) return 0;
  return Math.round((1 - distance / max) * 100);
}

function clampNumber(value, minimum, maximum) {
  const number = Number(value);
  if (!Number.isFinite(number)) return minimum;
  return Math.min(maximum, Math.max(minimum, number));
}

function collectKeys(value, keys = new Set()) {
  if (!value || typeof value !== "object") return keys;
  for (const [key, child] of Object.entries(value)) {
    keys.add(key);
    collectKeys(child, keys);
  }
  return keys;
}
