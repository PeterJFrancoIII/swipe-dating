import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  MATCH_STATUS,
  buildStarterSuggestions,
  listMatches,
} from "@swipe/rnd-conversations";

export function ConversationsView({
  conversationState,
  onUndo,
  onSend,
  onSyntheticReply,
  onUnmatch,
  onBlock,
}) {
  const matches = useMemo(() => listMatches(conversationState), [conversationState]);
  const [selectedMatchId, setSelectedMatchId] = useState(matches[0]?.id ?? null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (selectedMatchId && conversationState.matches[selectedMatchId]) return;
    setSelectedMatchId(matches[0]?.id ?? null);
  }, [conversationState.matches, matches, selectedMatchId]);

  const selectedMatch = selectedMatchId ? conversationState.matches[selectedMatchId] : null;

  function undoDecision() {
    const outcome = onUndo?.();
    const messages = {
      nothing_to_undo: "There is no pass or pending interest to undo.",
      match_requires_unmatch: "A reciprocal match cannot be undone as a swipe. Use Unmatch instead.",
      decision_undone: "The last pass or pending interest was restored to discovery.",
    };
    Alert.alert("Undo", messages[outcome?.kind] ?? "No action was changed.");
  }

  function sendOpeningSuggestion(text) {
    if (!selectedMatch) return;
    try {
      onSend?.({
        matchId: selectedMatch.id,
        text,
        sharedGroundTag: selectedMatch.starterTag,
      });
    } catch (error) {
      Alert.alert("Message not sent", humanizeError(error));
    }
  }

  function sendDraft() {
    if (!selectedMatch || !draft.trim()) return;
    try {
      onSend?.({ matchId: selectedMatch.id, text: draft });
      setDraft("");
    } catch (error) {
      Alert.alert("Message not sent", humanizeError(error));
    }
  }

  function confirmUnmatch() {
    if (!selectedMatch) return;
    Alert.alert(
      "Unmatch synthetic profile?",
      "Messaging will stop. The session transcript remains visible until this R&D session ends.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Unmatch", style: "destructive", onPress: () => onUnmatch?.(selectedMatch.id) },
      ],
    );
  }

  function confirmBlock() {
    if (!selectedMatch) return;
    Alert.alert(
      "Block synthetic profile?",
      "The visible session transcript and shared-ground context will be purged, and this profile will remain suppressed for the session.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Block and purge", style: "destructive", onPress: () => onBlock?.(selectedMatch.id) },
      ],
    );
  }

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Match lifecycle</Text>
        <Text style={styles.caption}>
          Likes, matches, messages, unmatches, and blocks are session-only synthetic state. They are not written to AsyncStorage.
        </Text>
        <Pressable onPress={undoDecision} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Undo last pass or pending interest</Text>
        </Pressable>
      </View>

      {matches.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>No synthetic matches yet</Text>
          <Text style={styles.caption}>
            Discovery interest creates a match only when the fixture also has reciprocal interest. A unilateral like remains pending.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Matches</Text>
            <View style={styles.matchList}>
              {matches.map((match) => (
                <Pressable
                  key={match.id}
                  onPress={() => setSelectedMatchId(match.id)}
                  style={[
                    styles.matchButton,
                    selectedMatchId === match.id && styles.matchButtonSelected,
                  ]}
                >
                  <Text style={styles.matchName}>{match.candidate.displayName}</Text>
                  <Text style={styles.matchStatus}>{formatLabel(match.status)}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {selectedMatch ? (
            <ConversationCard
              match={selectedMatch}
              draft={draft}
              setDraft={setDraft}
              onSendDraft={sendDraft}
              onSendOpening={sendOpeningSuggestion}
              onSyntheticReply={() =>
                onSyntheticReply?.({
                  matchId: selectedMatch.id,
                  text: "Thanks for starting with shared ground. What boundaries or expectations would you like to clarify?",
                })
              }
              onUnmatch={confirmUnmatch}
              onBlock={confirmBlock}
            />
          ) : null}
        </>
      )}
    </>
  );
}

function ConversationCard({
  match,
  draft,
  setDraft,
  onSendDraft,
  onSendOpening,
  onSyntheticReply,
  onUnmatch,
  onBlock,
}) {
  const isActive = match.status === MATCH_STATUS.ACTIVE;
  const hasLocalMessage = match.messages.some((message) => message.sender === "local");
  const suggestions = match.starterTag ? buildStarterSuggestions(match) : [];

  return (
    <View style={styles.conversationCard}>
      <View style={styles.headerRow}>
        <View style={styles.flex}>
          <Text style={styles.profileName}>{match.candidate.displayName}</Text>
          <Text style={styles.caption}>
            {match.candidate.ageBand} · {formatLabel(match.status)}
          </Text>
        </View>
        <Text style={styles.syntheticLabel}>SYNTHETIC</Text>
      </View>

      {match.contentPurged ? (
        <View style={styles.purgedBox}>
          <Text style={styles.warning}>Conversation content was purged after block.</Text>
        </View>
      ) : (
        <>
          {match.starterTag ? (
            <Text style={styles.sharedGround}>
              Shared-ground context: {formatLabel(match.starterTag)}
            </Text>
          ) : null}

          <View style={styles.transcript}>
            {match.messages.length === 0 ? (
              <Text style={styles.caption}>No messages yet.</Text>
            ) : (
              match.messages.map((message) => {
                const candidateMessage = message.sender === "candidate";
                return (
                  <View
                    key={message.id}
                    style={[
                      styles.message,
                      candidateMessage ? styles.candidateMessage : styles.localMessage,
                    ]}
                  >
                    <Text style={[styles.messageSender, candidateMessage && styles.candidateMessageText]}>
                      {candidateMessage ? match.candidate.displayName : "You"}
                    </Text>
                    <Text style={[styles.messageBody, candidateMessage && styles.candidateMessageText]}>
                      {message.body}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {isActive && !hasLocalMessage ? (
            <View style={styles.openerBox}>
              <Text style={styles.label}>Choose a consent-aware opening prompt</Text>
              <Text style={styles.caption}>
                The first message must carry the same visible shared-ground context selected during discovery.
              </Text>
              {suggestions.map((text) => (
                <Pressable key={text} onPress={() => onSendOpening(text)} style={styles.suggestionButton}>
                  <Text style={styles.suggestionText}>{text}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {isActive && hasLocalMessage ? (
            <View style={styles.composer}>
              <TextInput
                accessibilityLabel="Conversation message"
                maxLength={500}
                multiline
                onChangeText={setDraft}
                placeholder="Write a respectful message"
                style={styles.input}
                value={draft}
              />
              <Pressable onPress={onSendDraft} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Send</Text>
              </Pressable>
            </View>
          ) : null}

          {isActive && hasLocalMessage ? (
            <Pressable onPress={onSyntheticReply} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Receive synthetic reply</Text>
            </Pressable>
          ) : null}
        </>
      )}

      <View style={styles.actionRow}>
        {isActive ? (
          <Pressable onPress={onUnmatch} style={styles.dangerButton}>
            <Text style={styles.dangerText}>Unmatch</Text>
          </Pressable>
        ) : null}
        {match.status !== MATCH_STATUS.BLOCKED ? (
          <Pressable onPress={onBlock} style={styles.dangerButton}>
            <Text style={styles.dangerText}>Block and purge</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function humanizeError(error) {
  const code = error instanceof Error ? error.message : "unknown_error";
  const messages = {
    message_required: "Enter a message first.",
    message_too_long: "Messages are limited to 500 characters in this R&D build.",
    match_not_active: "This match is no longer active.",
    opening_context_required: "Choose a shared-ground opener before free-form messaging.",
  };
  return messages[code] ?? "The synthetic message could not be sent.";
}

function formatLabel(value) {
  return String(value).replaceAll("_", " ");
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#191d24", borderRadius: 16, gap: 10, padding: 16 },
  conversationCard: { backgroundColor: "#242936", borderRadius: 20, gap: 12, padding: 18 },
  sectionTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  caption: { color: "#aeb5c1", lineHeight: 19 },
  warning: { color: "#ffb45c", fontWeight: "700", lineHeight: 20 },
  flex: { flex: 1 },
  headerRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  profileName: { color: "white", fontSize: 26, fontWeight: "900" },
  syntheticLabel: { color: "#69e7c3", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  matchList: { gap: 8 },
  matchButton: { alignItems: "center", borderColor: "#454c58", borderRadius: 12, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", padding: 12 },
  matchButtonSelected: { borderColor: "#ff6d9e", borderWidth: 2 },
  matchName: { color: "white", fontSize: 16, fontWeight: "800" },
  matchStatus: { color: "#ff9fc0", fontSize: 12, textTransform: "capitalize" },
  sharedGround: { color: "#69e7c3", fontWeight: "800", textTransform: "capitalize" },
  transcript: { gap: 8 },
  message: { borderRadius: 12, gap: 4, maxWidth: "90%", padding: 11 },
  localMessage: { alignSelf: "flex-end", backgroundColor: "#ff6d9e" },
  candidateMessage: { alignSelf: "flex-start", backgroundColor: "#343b47" },
  messageSender: { color: "#17191e", fontSize: 11, fontWeight: "900" },
  messageBody: { color: "#17191e", lineHeight: 19 },
  candidateMessageText: { color: "white" },
  openerBox: { gap: 8 },
  label: { color: "#dfe4eb", fontSize: 13, fontWeight: "800" },
  suggestionButton: { borderColor: "#6c7482", borderRadius: 10, borderWidth: 1, padding: 12 },
  suggestionText: { color: "white", lineHeight: 20 },
  composer: { gap: 8 },
  input: { backgroundColor: "white", borderRadius: 10, fontSize: 16, minHeight: 76, paddingHorizontal: 14, paddingVertical: 12, textAlignVertical: "top" },
  primaryButton: { backgroundColor: "#ff6d9e", borderRadius: 10, padding: 12 },
  primaryButtonText: { color: "#17191e", fontWeight: "900", textAlign: "center" },
  secondaryButton: { borderColor: "#6c7482", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  secondaryButtonText: { color: "white", fontWeight: "700", textAlign: "center" },
  purgedBox: { backgroundColor: "#11141a", borderRadius: 12, padding: 14 },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dangerButton: { borderColor: "#ff735f", borderRadius: 10, borderWidth: 1, flex: 1, minWidth: 130, padding: 11 },
  dangerText: { color: "#ff9c8d", fontWeight: "800", textAlign: "center" },
});
