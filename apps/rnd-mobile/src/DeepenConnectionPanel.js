import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  RELATIONSHIP_PHASE,
  getRelationshipPhase,
  listAvailableDeepenPrompts,
} from "@swipe/rnd-relationship-phases";

export function DeepenConnectionPanel({
  match,
  relationshipPhaseState,
  onRequest,
  onCandidateRequest,
  onCandidateResponse,
  onLocalResponse,
  onWithdraw,
  onReturnToCasual,
  onAnswer,
  onClearAnswer,
}) {
  const phase = getRelationshipPhase(relationshipPhaseState, match.id);
  const prompts = listAvailableDeepenPrompts(relationshipPhaseState, match.id);
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    setDrafts(phase.promptAnswers);
  }, [phase.promptAnswers]);

  function saveAnswer(promptId) {
    try {
      onAnswer?.({ matchId: match.id, promptId, answer: drafts[promptId] ?? "" });
    } catch (error) {
      Alert.alert("Answer not saved", humanizeError(error));
    }
  }

  if (phase.phase === RELATIONSHIP_PHASE.ENDED) {
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Deepen Connection</Text>
        <Text style={styles.caption}>
          This relationship phase ended with the match. Any session-only deeper prompt answers were cleared.
        </Text>
      </View>
    );
  }

  if (phase.phase === RELATIONSHIP_PHASE.DEEPENED) {
    return (
      <View style={styles.deepenedCard}>
        <Text style={styles.syntheticLabel}>MUTUAL · SYNTHETIC</Text>
        <Text style={styles.sectionTitle}>Deepen Connection</Text>
        <Text style={styles.success}>
          Both sides explicitly opted in. This is match-specific, reversible, and does not change your public profile.
        </Text>
        <Text style={styles.warning}>
          This phase is not consent to sex, exclusivity, media, location, or an offline meeting. Each action still requires separate consent.
        </Text>

        {prompts.map((prompt) => (
          <View key={prompt.id} style={styles.promptBox}>
            <Text style={styles.promptCategory}>{formatLabel(prompt.category)}</Text>
            <Text style={styles.promptText}>{prompt.prompt}</Text>
            <TextInput
              accessibilityLabel={`Deepen connection answer: ${prompt.prompt}`}
              maxLength={300}
              multiline
              onChangeText={(answer) => setDrafts((current) => ({ ...current, [prompt.id]: answer }))}
              placeholder="Private session-only reflection"
              style={styles.input}
              value={drafts[prompt.id] ?? ""}
            />
            <View style={styles.row}>
              <Action label="Save locally for session" onPress={() => saveAnswer(prompt.id)} primary />
              {phase.promptAnswers[prompt.id] ? (
                <Action
                  label="Clear"
                  onPress={() => {
                    onClearAnswer?.({ matchId: match.id, promptId: prompt.id });
                    setDrafts((current) => ({ ...current, [prompt.id]: "" }));
                  }}
                />
              ) : null}
            </View>
          </View>
        ))}

        <Action
          label="Return this match to casual"
          onPress={() =>
            Alert.alert(
              "Return to casual?",
              "Either participant may end the deeper phase. Session-only deeper answers will be cleared.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Return to casual",
                  style: "destructive",
                  onPress: () => onReturnToCasual?.({ matchId: match.id, actor: "local" }),
                },
              ],
            )
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Deepen Connection</Text>
      <Text style={styles.caption}>
        A private, match-specific transition for exploring more emotional or long-term potential. It never activates from message count, time, a meetup, or sexual activity.
      </Text>

      {phase.localRequested && !phase.candidateRequested ? (
        <>
          <Text style={styles.pending}>Your request is pending synthetic reciprocal consent.</Text>
          <View style={styles.row}>
            <Action
              label="Simulate accept"
              onPress={() => onCandidateResponse?.({ matchId: match.id, accept: true })}
              primary
            />
            <Action
              label="Simulate decline"
              onPress={() => onCandidateResponse?.({ matchId: match.id, accept: false })}
            />
            <Action label="Withdraw" onPress={() => onWithdraw?.({ matchId: match.id, actor: "local" })} />
          </View>
          <Text style={styles.caption}>
            Decline reasons are not stored or shown, and declining cannot affect ranking or reach.
          </Text>
        </>
      ) : phase.candidateRequested && !phase.localRequested ? (
        <>
          <Text style={styles.pending}>Synthetic counterpart requested a deeper phase.</Text>
          <View style={styles.row}>
            <Action
              label="Accept"
              onPress={() => onLocalResponse?.({ matchId: match.id, accept: true })}
              primary
            />
            <Action label="Decline" onPress={() => onLocalResponse?.({ matchId: match.id, accept: false })} />
          </View>
        </>
      ) : (
        <>
          <View style={styles.row}>
            <Action
              label="Ask to deepen"
              onPress={() => onRequest?.({ matchId: match.id, actor: "local" })}
              primary
            />
            <Action
              label="Simulate incoming request"
              onPress={() => onCandidateRequest?.({ matchId: match.id, actor: "candidate" })}
            />
          </View>
          {phase.lastOutcome === "declined" ? (
            <Text style={styles.caption}>
              The request was declined. No reason was retained. The match remains in its casual phase.
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

function Action({ label, onPress, primary = false }) {
  return (
    <Pressable onPress={onPress} style={[styles.action, primary && styles.actionPrimary]}>
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

function humanizeError(error) {
  const code = error instanceof Error ? error.message : "unknown_error";
  const messages = {
    mutual_deepen_required: "Both sides must explicitly opt in before deeper prompts unlock.",
    answer_required: "Enter an answer first.",
    answer_too_long: "Answers are limited to 300 characters in this research build.",
    match_phase_ended: "This match phase has ended.",
  };
  return messages[code] ?? "The relationship-phase change could not be applied.";
}

function formatLabel(value) {
  return String(value).replaceAll("_", " ");
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#191d24", borderRadius: 16, gap: 10, padding: 16 },
  deepenedCard: { backgroundColor: "#202636", borderColor: "#69e7c3", borderRadius: 18, borderWidth: 2, gap: 12, padding: 17 },
  sectionTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  syntheticLabel: { color: "#69e7c3", fontSize: 11, fontWeight: "900", letterSpacing: 1.1 },
  caption: { color: "#aeb5c1", lineHeight: 19 },
  success: { color: "#69e7c3", fontWeight: "700", lineHeight: 20 },
  warning: { color: "#ffb45c", lineHeight: 20 },
  pending: { color: "#ff9fc0", fontWeight: "800", lineHeight: 20 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  action: { borderColor: "#6c7482", borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  actionPrimary: { backgroundColor: "#ff6d9e", borderColor: "#ff6d9e" },
  actionText: { color: "white", fontWeight: "800", textAlign: "center" },
  actionTextPrimary: { color: "#17191e" },
  promptBox: { borderTopColor: "#3a424f", borderTopWidth: 1, gap: 8, paddingTop: 12 },
  promptCategory: { color: "#ff9fc0", fontSize: 12, fontWeight: "900", textTransform: "capitalize" },
  promptText: { color: "white", fontSize: 16, fontWeight: "700", lineHeight: 22 },
  input: { backgroundColor: "white", borderRadius: 10, fontSize: 15, minHeight: 84, paddingHorizontal: 12, paddingVertical: 10, textAlignVertical: "top" },
});
