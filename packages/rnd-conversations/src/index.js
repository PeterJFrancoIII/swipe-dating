export const MATCH_STATUS = Object.freeze({
  ACTIVE: "active",
  UNMATCHED: "unmatched",
  BLOCKED: "blocked",
});

export const DECISION_KIND = Object.freeze({
  PASS: "pass",
  INTEREST: "interest",
});

export function createConversationState() {
  return {
    decisions: [],
    matches: {},
    blockedCandidateIds: [],
    nextEventSequence: 1,
    nextMessageSequence: 1,
    lastRestoredCandidateId: null,
  };
}

export function recordPass(state, { candidateId, at = Date.now() }) {
  assertCandidateAvailable(state, candidateId);
  const decision = {
    id: `decision-${state.nextEventSequence}`,
    candidateId,
    kind: DECISION_KIND.PASS,
    starterTag: null,
    createsMatch: false,
    at: toIso(at),
  };

  return {
    state: {
      ...state,
      decisions: [...state.decisions, decision],
      nextEventSequence: state.nextEventSequence + 1,
      lastRestoredCandidateId: null,
    },
    outcome: { kind: "passed", candidateId },
  };
}

export function recordInterest(
  state,
  {
    candidate,
    starterTag,
    reciprocalLike = false,
    at = Date.now(),
  },
) {
  const snapshot = sanitizeCandidateSnapshot(candidate);
  assertCandidateAvailable(state, snapshot.id);
  const normalizedStarter = normalizeTag(starterTag);
  if (!normalizedStarter) {
    throw new Error("shared_ground_required");
  }

  const decision = {
    id: `decision-${state.nextEventSequence}`,
    candidateId: snapshot.id,
    kind: DECISION_KIND.INTEREST,
    starterTag: normalizedStarter,
    createsMatch: Boolean(reciprocalLike),
    at: toIso(at),
  };

  if (!reciprocalLike) {
    return {
      state: {
        ...state,
        decisions: [...state.decisions, decision],
        nextEventSequence: state.nextEventSequence + 1,
        lastRestoredCandidateId: null,
      },
      outcome: {
        kind: "interest_pending",
        candidateId: snapshot.id,
        matched: false,
      },
    };
  }

  const matchId = `match:${snapshot.id}`;
  const match = {
    id: matchId,
    candidate: snapshot,
    status: MATCH_STATUS.ACTIVE,
    starterTag: normalizedStarter,
    openedAt: toIso(at),
    endedAt: null,
    contentPurged: false,
    messages: [],
  };

  return {
    state: {
      ...state,
      decisions: [...state.decisions, decision],
      matches: { ...state.matches, [matchId]: match },
      nextEventSequence: state.nextEventSequence + 1,
      lastRestoredCandidateId: null,
    },
    outcome: {
      kind: "match_created",
      candidateId: snapshot.id,
      matchId,
      matched: true,
    },
  };
}

export function undoLastDecision(state) {
  const decision = state.decisions.at(-1);
  if (!decision) {
    return { state, outcome: { kind: "nothing_to_undo", restoredCandidateId: null } };
  }
  if (decision.createsMatch) {
    return {
      state,
      outcome: {
        kind: "match_requires_unmatch",
        restoredCandidateId: null,
        matchId: `match:${decision.candidateId}`,
      },
    };
  }

  return {
    state: {
      ...state,
      decisions: state.decisions.slice(0, -1),
      lastRestoredCandidateId: decision.candidateId,
    },
    outcome: {
      kind: "decision_undone",
      restoredCandidateId: decision.candidateId,
    },
  };
}

export function sendMessage(
  state,
  {
    matchId,
    text,
    sharedGroundTag = null,
    at = Date.now(),
  },
) {
  const match = requireActiveMatch(state, matchId);
  const body = normalizeMessage(text);
  const localMessages = match.messages.filter((message) => message.sender === "local");
  const normalizedSharedGround = normalizeTag(sharedGroundTag);

  if (localMessages.length === 0 && normalizedSharedGround !== match.starterTag) {
    throw new Error("opening_context_required");
  }

  const message = {
    id: `message-${state.nextMessageSequence}`,
    sender: "local",
    body,
    sharedGroundTag: localMessages.length === 0 ? match.starterTag : null,
    sentAt: toIso(at),
  };

  return {
    state: replaceMatch(state, matchId, {
      ...match,
      messages: [...match.messages, message],
    }, { nextMessageSequence: state.nextMessageSequence + 1 }),
    message,
  };
}

export function receiveSyntheticReply(
  state,
  {
    matchId,
    text,
    at = Date.now(),
  },
) {
  const match = requireActiveMatch(state, matchId);
  const message = {
    id: `message-${state.nextMessageSequence}`,
    sender: "candidate",
    body: normalizeMessage(text),
    sharedGroundTag: null,
    sentAt: toIso(at),
  };

  return {
    state: replaceMatch(state, matchId, {
      ...match,
      messages: [...match.messages, message],
    }, { nextMessageSequence: state.nextMessageSequence + 1 }),
    message,
  };
}

export function unmatchConversation(state, { matchId, at = Date.now() }) {
  const match = requireMatch(state, matchId);
  if (match.status !== MATCH_STATUS.ACTIVE) {
    return { state, outcome: { kind: "already_ended", matchId } };
  }

  return {
    state: replaceMatch(state, matchId, {
      ...match,
      status: MATCH_STATUS.UNMATCHED,
      endedAt: toIso(at),
    }),
    outcome: { kind: "unmatched", matchId, candidateId: match.candidate.id },
  };
}

export function blockConversation(state, { matchId, at = Date.now() }) {
  const match = requireMatch(state, matchId);
  const blockedCandidateIds = Array.from(
    new Set([...state.blockedCandidateIds, match.candidate.id]),
  );

  return {
    state: replaceMatch(
      { ...state, blockedCandidateIds },
      matchId,
      {
        ...match,
        status: MATCH_STATUS.BLOCKED,
        starterTag: null,
        endedAt: toIso(at),
        contentPurged: true,
        messages: [],
      },
    ),
    outcome: { kind: "blocked", matchId, candidateId: match.candidate.id },
  };
}

export function buildStarterSuggestions(match) {
  const activeMatch = validateMatchShape(match);
  const label = formatTag(activeMatch.starterTag);
  return [
    `I noticed we both mentioned ${label}. What do you enjoy most about it?`,
    `Your ${label} tag caught my attention. What would a good first conversation look like for you?`,
    `We matched around ${label}. Is there anything you want to clarify before we keep talking?`,
  ];
}

export function listMatches(state) {
  return Object.values(state.matches).sort((left, right) =>
    right.openedAt.localeCompare(left.openedAt),
  );
}

export function getSuppressedCandidateIds(state) {
  return Array.from(
    new Set([
      ...state.blockedCandidateIds,
      ...state.decisions.map((decision) => decision.candidateId),
      ...Object.values(state.matches).map((match) => match.candidate.id),
    ]),
  );
}

export function isCandidateBlocked(state, candidateId) {
  return state.blockedCandidateIds.includes(candidateId);
}

function assertCandidateAvailable(state, candidateId) {
  if (!candidateId || typeof candidateId !== "string") {
    throw new Error("candidate_id_required");
  }
  if (isCandidateBlocked(state, candidateId)) {
    throw new Error("candidate_blocked");
  }
  if (getSuppressedCandidateIds(state).includes(candidateId)) {
    throw new Error("candidate_already_decided");
  }
}

function requireMatch(state, matchId) {
  const match = state.matches[matchId];
  if (!match) throw new Error("match_not_found");
  return match;
}

function requireActiveMatch(state, matchId) {
  const match = requireMatch(state, matchId);
  if (match.status !== MATCH_STATUS.ACTIVE) {
    throw new Error("match_not_active");
  }
  return match;
}

function replaceMatch(state, matchId, match, patch = {}) {
  return {
    ...state,
    ...patch,
    matches: { ...state.matches, [matchId]: match },
  };
}

function sanitizeCandidateSnapshot(candidate) {
  if (!candidate || typeof candidate !== "object") {
    throw new Error("candidate_required");
  }
  const id = String(candidate.id ?? "").trim();
  if (!id) throw new Error("candidate_id_required");
  return {
    id,
    displayName: String(candidate.displayName ?? "Synthetic profile").trim().slice(0, 64),
    ageBand: String(candidate.ageBand ?? "adult").trim().slice(0, 32),
  };
}

function validateMatchShape(match) {
  if (!match || typeof match !== "object" || !match.starterTag) {
    throw new Error("match_starter_missing");
  }
  return match;
}

function normalizeTag(value) {
  return typeof value === "string" ? value.trim().slice(0, 80) : "";
}

function normalizeMessage(value) {
  const body = typeof value === "string" ? value.trim() : "";
  if (!body) throw new Error("message_required");
  if (body.length > 500) throw new Error("message_too_long");
  return body;
}

function formatTag(value) {
  return String(value).replaceAll("_", " ");
}

function toIso(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("invalid_time");
  return date.toISOString();
}
