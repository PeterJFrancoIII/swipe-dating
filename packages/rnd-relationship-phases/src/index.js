export const RELATIONSHIP_PHASE = Object.freeze({
  CASUAL: "casual",
  DEEPENED: "deepened",
  ENDED: "ended",
});

export const TRANSITION_OUTCOME = Object.freeze({
  NONE: "none",
  REQUESTED: "requested",
  DEEPENED: "deepened",
  DECLINED: "declined",
  WITHDRAWN: "withdrawn",
  RETURNED_TO_CASUAL: "returned_to_casual",
  ENDED: "ended",
});

export const DEEPEN_PROMPTS = Object.freeze([
  Object.freeze({ id: "communication_style", category: "communication", prompt: "What helps you feel heard during a difficult conversation?" }),
  Object.freeze({ id: "relationship_direction", category: "relationship_goals", prompt: "What kind of connection would you be open to exploring over time?" }),
  Object.freeze({ id: "time_and_energy", category: "availability", prompt: "What amount of time and communication feels sustainable for you?" }),
  Object.freeze({ id: "values_in_practice", category: "values", prompt: "Which values matter most in how a relationship is treated day to day?" }),
  Object.freeze({ id: "future_boundaries", category: "boundaries", prompt: "Which boundaries would need to stay clear if this connection became more serious?" }),
]);

const PROMPT_IDS = new Set(DEEPEN_PROMPTS.map((prompt) => prompt.id));

export function createRelationshipPhaseState() {
  return { byMatchId: {} };
}

export function getRelationshipPhase(state, matchId) {
  return state.byMatchId[matchId] ?? createMatchPhase(matchId);
}

export function requestDeepen(state, { matchId, actor = "local", at = Date.now() }) {
  assertActor(actor);
  const current = requireActivePhase(getRelationshipPhase(state, matchId));
  if (current.phase === RELATIONSHIP_PHASE.DEEPENED) {
    return { state, outcome: { kind: "already_deepened", matchId } };
  }

  const next = {
    ...current,
    localRequested: actor === "local" ? true : current.localRequested,
    candidateRequested: actor === "candidate" ? true : current.candidateRequested,
    lastOutcome: TRANSITION_OUTCOME.REQUESTED,
    updatedAt: toIso(at),
  };

  if (next.localRequested && next.candidateRequested) {
    next.phase = RELATIONSHIP_PHASE.DEEPENED;
    next.lastOutcome = TRANSITION_OUTCOME.DEEPENED;
    next.deepenedAt = toIso(at);
  }

  return {
    state: replacePhase(state, matchId, next),
    outcome: {
      kind: next.phase === RELATIONSHIP_PHASE.DEEPENED ? "deepened" : "request_pending",
      matchId,
      phase: next.phase,
    },
  };
}

export function respondToDeepen(state, { matchId, actor = "candidate", accept, at = Date.now() }) {
  assertActor(actor);
  if (typeof accept !== "boolean") throw new Error("acceptance_required");
  const current = requireActivePhase(getRelationshipPhase(state, matchId));

  if (accept) {
    return requestDeepen(state, { matchId, actor, at });
  }

  const next = {
    ...current,
    phase: RELATIONSHIP_PHASE.CASUAL,
    localRequested: false,
    candidateRequested: false,
    deepenedAt: null,
    promptAnswers: {},
    lastOutcome: TRANSITION_OUTCOME.DECLINED,
    updatedAt: toIso(at),
  };

  return {
    state: replacePhase(state, matchId, next),
    outcome: { kind: "declined", matchId, phase: next.phase },
  };
}

export function withdrawDeepenRequest(state, { matchId, actor = "local", at = Date.now() }) {
  assertActor(actor);
  const current = requireActivePhase(getRelationshipPhase(state, matchId));
  if (current.phase === RELATIONSHIP_PHASE.DEEPENED) {
    throw new Error("already_deepened_use_return_to_casual");
  }

  const next = {
    ...current,
    localRequested: actor === "local" ? false : current.localRequested,
    candidateRequested: actor === "candidate" ? false : current.candidateRequested,
    lastOutcome: TRANSITION_OUTCOME.WITHDRAWN,
    updatedAt: toIso(at),
  };

  return {
    state: replacePhase(state, matchId, next),
    outcome: { kind: "request_withdrawn", matchId },
  };
}

export function returnToCasual(state, { matchId, actor = "local", at = Date.now() }) {
  assertActor(actor);
  const current = requireActivePhase(getRelationshipPhase(state, matchId));
  if (current.phase !== RELATIONSHIP_PHASE.DEEPENED) {
    return { state, outcome: { kind: "already_casual", matchId } };
  }

  const next = {
    ...current,
    phase: RELATIONSHIP_PHASE.CASUAL,
    localRequested: false,
    candidateRequested: false,
    deepenedAt: null,
    promptAnswers: {},
    lastOutcome: TRANSITION_OUTCOME.RETURNED_TO_CASUAL,
    updatedAt: toIso(at),
  };

  return {
    state: replacePhase(state, matchId, next),
    outcome: { kind: "returned_to_casual", matchId, actor },
  };
}

export function answerDeepenPrompt(state, { matchId, promptId, answer, at = Date.now() }) {
  const current = requireActivePhase(getRelationshipPhase(state, matchId));
  if (current.phase !== RELATIONSHIP_PHASE.DEEPENED) {
    throw new Error("mutual_deepen_required");
  }
  if (!PROMPT_IDS.has(promptId)) throw new Error("unknown_deepen_prompt");
  const normalized = normalizeAnswer(answer);

  const next = {
    ...current,
    promptAnswers: {
      ...current.promptAnswers,
      [promptId]: normalized,
    },
    updatedAt: toIso(at),
  };

  return {
    state: replacePhase(state, matchId, next),
    answer: { promptId, answer: normalized },
  };
}

export function clearDeepenPromptAnswer(state, { matchId, promptId, at = Date.now() }) {
  const current = requireActivePhase(getRelationshipPhase(state, matchId));
  if (!PROMPT_IDS.has(promptId)) throw new Error("unknown_deepen_prompt");
  const promptAnswers = { ...current.promptAnswers };
  delete promptAnswers[promptId];

  return {
    state: replacePhase(state, matchId, {
      ...current,
      promptAnswers,
      updatedAt: toIso(at),
    }),
    outcome: { kind: "answer_cleared", matchId, promptId },
  };
}

export function terminateRelationshipPhase(state, { matchId, reason, at = Date.now() }) {
  if (!new Set(["unmatched", "blocked"]).has(reason)) {
    throw new Error("invalid_termination_reason");
  }
  const current = getRelationshipPhase(state, matchId);
  const next = {
    ...current,
    phase: RELATIONSHIP_PHASE.ENDED,
    localRequested: false,
    candidateRequested: false,
    deepenedAt: null,
    promptAnswers: {},
    endedReason: reason,
    endedAt: toIso(at),
    lastOutcome: TRANSITION_OUTCOME.ENDED,
    updatedAt: toIso(at),
  };

  return {
    state: replacePhase(state, matchId, next),
    outcome: { kind: "phase_ended", matchId, reason },
  };
}

export function listAvailableDeepenPrompts(state, matchId) {
  const current = getRelationshipPhase(state, matchId);
  return current.phase === RELATIONSHIP_PHASE.DEEPENED ? DEEPEN_PROMPTS : [];
}

function createMatchPhase(matchId) {
  if (!matchId || typeof matchId !== "string") throw new Error("match_id_required");
  return {
    matchId,
    phase: RELATIONSHIP_PHASE.CASUAL,
    localRequested: false,
    candidateRequested: false,
    promptAnswers: {},
    lastOutcome: TRANSITION_OUTCOME.NONE,
    deepenedAt: null,
    endedAt: null,
    endedReason: null,
    updatedAt: null,
  };
}

function replacePhase(state, matchId, next) {
  return {
    ...state,
    byMatchId: { ...state.byMatchId, [matchId]: next },
  };
}

function requireActivePhase(value) {
  if (value.phase === RELATIONSHIP_PHASE.ENDED) throw new Error("match_phase_ended");
  return value;
}

function assertActor(actor) {
  if (!new Set(["local", "candidate"]).has(actor)) throw new Error("invalid_actor");
}

function normalizeAnswer(value) {
  const answer = typeof value === "string" ? value.trim() : "";
  if (!answer) throw new Error("answer_required");
  if (answer.length > 300) throw new Error("answer_too_long");
  return answer;
}

function toIso(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("invalid_time");
  return date.toISOString();
}
