import assert from "node:assert/strict";
import test from "node:test";

import {
  MATCH_STATUS,
  blockConversation,
  buildStarterSuggestions,
  createConversationState,
  getSuppressedCandidateIds,
  recordInterest,
  recordPass,
  receiveSyntheticReply,
  sendMessage,
  undoLastDecision,
  unmatchConversation,
} from "../src/index.js";

const CANDIDATE = Object.freeze({
  id: "p1",
  displayName: "Alex",
  ageBand: "25–34",
});

function createMatchedState() {
  return recordInterest(createConversationState(), {
    candidate: CANDIDATE,
    starterTag: "hiking",
    reciprocalLike: true,
    at: Date.UTC(2026, 6, 22, 12),
  });
}

test("unilateral interest remains pending and does not create a match", () => {
  const result = recordInterest(createConversationState(), {
    candidate: CANDIDATE,
    starterTag: "hiking",
    reciprocalLike: false,
  });

  assert.equal(result.outcome.matched, false);
  assert.equal(result.outcome.kind, "interest_pending");
  assert.deepEqual(result.state.matches, {});
});

test("reciprocal interest creates one active match with shared-ground context", () => {
  const result = createMatchedState();
  const match = result.state.matches[result.outcome.matchId];

  assert.equal(result.outcome.matched, true);
  assert.equal(match.status, MATCH_STATUS.ACTIVE);
  assert.equal(match.starterTag, "hiking");
  assert.deepEqual(match.messages, []);
});

test("pass and pending interest decisions can be undone", () => {
  const passed = recordPass(createConversationState(), { candidateId: "p2" }).state;
  const undoPass = undoLastDecision(passed);
  assert.equal(undoPass.outcome.restoredCandidateId, "p2");
  assert.deepEqual(undoPass.state.decisions, []);

  const pending = recordInterest(createConversationState(), {
    candidate: CANDIDATE,
    starterTag: "live_music",
    reciprocalLike: false,
  }).state;
  const undoPending = undoLastDecision(pending);
  assert.equal(undoPending.outcome.kind, "decision_undone");
  assert.equal(undoPending.outcome.restoredCandidateId, "p1");
});

test("a created match requires explicit unmatch rather than swipe undo", () => {
  const matched = createMatchedState();
  const undone = undoLastDecision(matched.state);

  assert.equal(undone.outcome.kind, "match_requires_unmatch");
  assert.equal(undone.state, matched.state);
});

test("the first local message requires the selected shared-ground tag", () => {
  const matched = createMatchedState();
  assert.throws(
    () => sendMessage(matched.state, {
      matchId: matched.outcome.matchId,
      text: "Hello",
    }),
    /opening_context_required/,
  );

  const sent = sendMessage(matched.state, {
    matchId: matched.outcome.matchId,
    text: "What trail do you like?",
    sharedGroundTag: "hiking",
  });
  assert.equal(sent.message.sharedGroundTag, "hiking");
});

test("active matches support local messages and synthetic replies", () => {
  const matched = createMatchedState();
  const sent = sendMessage(matched.state, {
    matchId: matched.outcome.matchId,
    text: "What trail do you like?",
    sharedGroundTag: "hiking",
  });
  const replied = receiveSyntheticReply(sent.state, {
    matchId: matched.outcome.matchId,
    text: "I like the river loop.",
  });

  assert.equal(replied.state.matches[matched.outcome.matchId].messages.length, 2);
  assert.equal(replied.message.sender, "candidate");
});

test("unmatch ends messaging but retains the session transcript", () => {
  const matched = createMatchedState();
  const sent = sendMessage(matched.state, {
    matchId: matched.outcome.matchId,
    text: "What trail do you like?",
    sharedGroundTag: "hiking",
  });
  const ended = unmatchConversation(sent.state, { matchId: matched.outcome.matchId });

  assert.equal(ended.state.matches[matched.outcome.matchId].status, MATCH_STATUS.UNMATCHED);
  assert.equal(ended.state.matches[matched.outcome.matchId].messages.length, 1);
  assert.throws(
    () => sendMessage(ended.state, {
      matchId: matched.outcome.matchId,
      text: "Still there?",
    }),
    /match_not_active/,
  );
});

test("block purges visible content and suppresses rediscovery", () => {
  const matched = createMatchedState();
  const sent = sendMessage(matched.state, {
    matchId: matched.outcome.matchId,
    text: "What trail do you like?",
    sharedGroundTag: "hiking",
  });
  const blocked = blockConversation(sent.state, { matchId: matched.outcome.matchId });
  const match = blocked.state.matches[matched.outcome.matchId];

  assert.equal(match.status, MATCH_STATUS.BLOCKED);
  assert.equal(match.contentPurged, true);
  assert.deepEqual(match.messages, []);
  assert.equal(match.starterTag, null);
  assert.ok(getSuppressedCandidateIds(blocked.state).includes("p1"));
  assert.throws(
    () => recordInterest(blocked.state, {
      candidate: CANDIDATE,
      starterTag: "hiking",
      reciprocalLike: true,
    }),
    /candidate_blocked/,
  );
});

test("starter suggestions are grounded in the selected visible tag", () => {
  const matched = createMatchedState();
  const suggestions = buildStarterSuggestions(
    matched.state.matches[matched.outcome.matchId],
  );

  assert.equal(suggestions.length, 3);
  assert.ok(suggestions.every((value) => value.includes("hiking")));
});
