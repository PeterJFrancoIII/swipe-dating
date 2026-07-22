import assert from "node:assert/strict";
import test from "node:test";

import {
  DEEPEN_PROMPTS,
  RELATIONSHIP_PHASE,
  answerDeepenPrompt,
  clearDeepenPromptAnswer,
  createRelationshipPhaseState,
  getRelationshipPhase,
  listAvailableDeepenPrompts,
  requestDeepen,
  respondToDeepen,
  returnToCasual,
  terminateRelationshipPhase,
  withdrawDeepenRequest,
} from "../src/index.js";

const MATCH_ID = "match:p1";

function createDeepenedState() {
  const local = requestDeepen(createRelationshipPhaseState(), {
    matchId: MATCH_ID,
    actor: "local",
  });
  return requestDeepen(local.state, {
    matchId: MATCH_ID,
    actor: "candidate",
  }).state;
}

function createAnsweredState(promptId = "communication_style") {
  return answerDeepenPrompt(createDeepenedState(), {
    matchId: MATCH_ID,
    promptId,
    answer: "A private answer for this synthetic session.",
  }).state;
}

test("one-sided deepen request remains pending", () => {
  const result = requestDeepen(createRelationshipPhaseState(), {
    matchId: MATCH_ID,
    actor: "local",
  });
  const phase = getRelationshipPhase(result.state, MATCH_ID);

  assert.equal(result.outcome.kind, "request_pending");
  assert.equal(phase.phase, RELATIONSHIP_PHASE.CASUAL);
  assert.equal(phase.localRequested, true);
  assert.equal(phase.candidateRequested, false);
});

test("mutual explicit requests unlock the deepened phase", () => {
  const state = createDeepenedState();

  assert.equal(getRelationshipPhase(state, MATCH_ID).phase, RELATIONSHIP_PHASE.DEEPENED);
  assert.equal(listAvailableDeepenPrompts(state, MATCH_ID).length, DEEPEN_PROMPTS.length);
});

test("candidate request can be accepted by the local user", () => {
  const candidate = requestDeepen(createRelationshipPhaseState(), {
    matchId: MATCH_ID,
    actor: "candidate",
  });
  const local = respondToDeepen(candidate.state, {
    matchId: MATCH_ID,
    actor: "local",
    accept: true,
  });

  assert.equal(local.outcome.kind, "deepened");
});

test("decline resets both requests without retaining a reason", () => {
  const pending = requestDeepen(createRelationshipPhaseState(), {
    matchId: MATCH_ID,
    actor: "local",
  });
  const declined = respondToDeepen(pending.state, {
    matchId: MATCH_ID,
    actor: "candidate",
    accept: false,
  });
  const phase = getRelationshipPhase(declined.state, MATCH_ID);

  assert.equal(declined.outcome.kind, "declined");
  assert.equal(phase.localRequested, false);
  assert.equal(phase.candidateRequested, false);
  assert.equal(Object.hasOwn(phase, "declineReason"), false);
});

test("a pending request can be withdrawn before mutual acceptance", () => {
  const pending = requestDeepen(createRelationshipPhaseState(), {
    matchId: MATCH_ID,
    actor: "local",
  });
  const withdrawn = withdrawDeepenRequest(pending.state, {
    matchId: MATCH_ID,
    actor: "local",
  });

  assert.equal(withdrawn.outcome.kind, "request_withdrawn");
  assert.equal(getRelationshipPhase(withdrawn.state, MATCH_ID).localRequested, false);
});

test("deep prompts cannot be answered before mutual acceptance", () => {
  assert.throws(
    () => answerDeepenPrompt(createRelationshipPhaseState(), {
      matchId: MATCH_ID,
      promptId: "communication_style",
      answer: "I need a pause before resolving conflict.",
    }),
    /mutual_deepen_required/,
  );
});

test("deepened matches can answer and clear allowlisted prompts", () => {
  const answered = answerDeepenPrompt(createDeepenedState(), {
    matchId: MATCH_ID,
    promptId: "communication_style",
    answer: "  I need a pause before resolving conflict.  ",
  });

  assert.equal(
    getRelationshipPhase(answered.state, MATCH_ID).promptAnswers.communication_style,
    "I need a pause before resolving conflict.",
  );

  const cleared = clearDeepenPromptAnswer(answered.state, {
    matchId: MATCH_ID,
    promptId: "communication_style",
  });
  assert.equal(
    Object.hasOwn(getRelationshipPhase(cleared.state, MATCH_ID).promptAnswers, "communication_style"),
    false,
  );
});

test("local participant can return the match to casual and clear prompt answers", () => {
  const casual = returnToCasual(createAnsweredState("relationship_direction"), {
    matchId: MATCH_ID,
    actor: "local",
  });
  const phase = getRelationshipPhase(casual.state, MATCH_ID);

  assert.equal(casual.outcome.kind, "returned_to_casual");
  assert.equal(casual.outcome.actor, "local");
  assert.equal(phase.phase, RELATIONSHIP_PHASE.CASUAL);
  assert.deepEqual(phase.promptAnswers, {});
});

test("candidate participant can independently return the match to casual", () => {
  const casual = returnToCasual(createAnsweredState("values_in_practice"), {
    matchId: MATCH_ID,
    actor: "candidate",
  });
  const phase = getRelationshipPhase(casual.state, MATCH_ID);

  assert.equal(casual.outcome.kind, "returned_to_casual");
  assert.equal(casual.outcome.actor, "candidate");
  assert.equal(phase.phase, RELATIONSHIP_PHASE.CASUAL);
  assert.deepEqual(phase.promptAnswers, {});
});

test("unmatch ends the phase, clears answers, and rejects future requests", () => {
  const ended = terminateRelationshipPhase(createAnsweredState("future_boundaries"), {
    matchId: MATCH_ID,
    reason: "unmatched",
  });
  const phase = getRelationshipPhase(ended.state, MATCH_ID);

  assert.equal(phase.phase, RELATIONSHIP_PHASE.ENDED);
  assert.equal(phase.endedReason, "unmatched");
  assert.deepEqual(phase.promptAnswers, {});
  assert.throws(
    () => requestDeepen(ended.state, { matchId: MATCH_ID, actor: "local" }),
    /match_phase_ended/,
  );
});

test("block ends the phase and clears sensitive answers", () => {
  const ended = terminateRelationshipPhase(createAnsweredState("time_and_energy"), {
    matchId: MATCH_ID,
    reason: "blocked",
  });
  const phase = getRelationshipPhase(ended.state, MATCH_ID);

  assert.equal(phase.phase, RELATIONSHIP_PHASE.ENDED);
  assert.equal(phase.endedReason, "blocked");
  assert.deepEqual(phase.promptAnswers, {});
});

test("unknown prompts and overlong answers fail closed", () => {
  const state = createDeepenedState();

  assert.throws(
    () => answerDeepenPrompt(state, {
      matchId: MATCH_ID,
      promptId: "secret_prompt",
      answer: "No",
    }),
    /unknown_deepen_prompt/,
  );
  assert.throws(
    () => answerDeepenPrompt(state, {
      matchId: MATCH_ID,
      promptId: "communication_style",
      answer: "x".repeat(301),
    }),
    /answer_too_long/,
  );
});
