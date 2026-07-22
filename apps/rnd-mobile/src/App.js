import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  blockConversation,
  createConversationState,
  getSuppressedCandidateIds,
  recordInterest,
  recordPass,
  receiveSyntheticReply,
  sendMessage,
  undoLastDecision,
  unmatchConversation,
} from "@swipe/rnd-conversations";
import {
  GENDER_DISCOVERY_CATEGORIES,
  LOOKING_FOR_MODES,
  PROXIMITY_DISCLOSURE,
  decideProximityEvent,
  isAdultOn,
} from "@swipe/rnd-domain";
import { createDefaultLocalState } from "@swipe/rnd-storage";

import { ConversationsView } from "./ConversationsView.js";
import { IntentDiscoveryView } from "./IntentDiscoveryView.js";
import { createMobileLocalStateRepository } from "./local-storage.js";
import { QUESTIONNAIRE, SKIN_ITEMS, SYNTHETIC_PROFILES } from "./mock-data.js";

const TODAY = "2026-07-22";
const TABS = ["Discover", "Matches", "My Profile", "Preferences", "Skin Shop", "Matched Map"];

export default function App() {
  const repository = useMemo(() => createMobileLocalStateRepository(), []);
  const [localState, setLocalState] = useState(createDefaultLocalState);
  const [activeTab, setActiveTab] = useState("Discover");
  const [storageReady, setStorageReady] = useState(false);
  const [storageStatus, setStorageStatus] = useState("Loading saved profile…");
  const [exportPreview, setExportPreview] = useState("");

  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [adultAccepted, setAdultAccepted] = useState(false);
  const [getFkdEnabled, setGetFkdEnabled] = useState(false);
  const [disclosure, setDisclosure] = useState(PROXIMITY_DISCLOSURE.PROMPT_BEFORE_SHARING);
  const [selectedIntents, setSelectedIntents] = useState(new Set(["dating"]));
  const [selectedGenders, setSelectedGenders] = useState(new Set());
  const [answers, setAnswers] = useState({});
  const [locationChoice, setLocationChoice] = useState("none");

  const [conversationState, setConversationState] = useState(createConversationState);
  const [restoreToken, setRestoreToken] = useState(null);

  const ownedSkins = useMemo(
    () => new Set(localState.cosmetics.ownedSkinIds),
    [localState.cosmetics.ownedSkinIds],
  );
  const suppressedCandidateIds = useMemo(
    () => getSuppressedCandidateIds(conversationState),
    [conversationState],
  );

  useEffect(() => {
    let cancelled = false;

    repository
      .load()
      .then((result) => {
        if (cancelled) return;
        setLocalState(result.state);
        setActiveTab(result.state.ui.lastTab);
        setStorageStatus(
          result.recovered
            ? "Saved data was invalid or incompatible and was safely reset."
            : result.savedAt
              ? `Restored local profile saved ${formatSavedAt(result.savedAt)}.`
              : "No saved local profile yet.",
        );
        setStorageReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setStorageStatus("Local storage is unavailable. Changes will remain in memory for this session.");
        setStorageReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  useEffect(() => {
    if (!storageReady) return undefined;

    setStorageStatus("Saving approved local fields…");
    const timer = setTimeout(() => {
      repository
        .save(localState)
        .then((result) => setStorageStatus(`Saved locally ${formatSavedAt(result.savedAt)}.`))
        .catch(() => setStorageStatus("Save failed. Current changes remain in memory only."));
    }, 250);

    return () => clearTimeout(timer);
  }, [localState, repository, storageReady]);

  function updateProfile(patch) {
    setLocalState((current) => ({
      ...current,
      profile: { ...current.profile, ...patch },
    }));
  }

  function updateUi(patch) {
    setLocalState((current) => ({
      ...current,
      ui: { ...current.ui, ...patch },
    }));
  }

  function selectTab(value) {
    setActiveTab(value);
    if (value !== "Matches") {
      updateUi({ lastTab: value });
    }
  }

  function submitAdultGate() {
    if (!isAdultOn(birthDate, TODAY)) {
      Alert.alert("Adults only", "You must be at least 18 years old to continue.");
      return;
    }
    setAdultAccepted(true);
  }

  async function simulateProximity() {
    const decision = decideProximityEvent({
      adultCredentialValid: adultAccepted,
      disclosure: getFkdEnabled ? disclosure : PROXIMITY_DISCLOSURE.OFF,
      independentlyCompatible: true,
    });
    if (decision === "suppress") {
      Alert.alert("No nearby event", "Get fk'd is off or eligibility is unavailable.");
      return;
    }
    if (localState.ui.hapticsEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(
      "Nearby adult detected — synthetic",
      decision === "buzz_and_prompt"
        ? "Your profile remains hidden until you approve sharing."
        : "A short-lived compatible-user profile capability would be shared in the future BLE build.",
    );
  }

  function handlePass({ candidateId }) {
    const result = recordPass(conversationState, { candidateId });
    setConversationState(result.state);
    return result.outcome;
  }

  function handleInterest({ candidate, starterTag }) {
    const result = recordInterest(conversationState, {
      candidate,
      starterTag,
      reciprocalLike: Boolean(candidate.syntheticReciprocalLike),
    });
    setConversationState(result.state);
    if (result.outcome.matched) {
      setActiveTab("Matches");
    }
    return result.outcome;
  }

  function handleUndo() {
    const result = undoLastDecision(conversationState);
    setConversationState(result.state);
    if (result.outcome.restoredCandidateId) {
      setRestoreToken({
        candidateId: result.outcome.restoredCandidateId,
        sequence: Date.now(),
      });
      setActiveTab("Discover");
    }
    return result.outcome;
  }

  function handleSend(payload) {
    const result = sendMessage(conversationState, payload);
    setConversationState(result.state);
    return result.message;
  }

  function handleSyntheticReply(payload) {
    const result = receiveSyntheticReply(conversationState, payload);
    setConversationState(result.state);
    return result.message;
  }

  function handleUnmatch(matchId) {
    const result = unmatchConversation(conversationState, { matchId });
    setConversationState(result.state);
    return result.outcome;
  }

  function handleBlock(matchId) {
    const result = blockConversation(conversationState, { matchId });
    setConversationState(result.state);
    return result.outcome;
  }

  async function resetSavedProfile() {
    await repository.clear();
    setLocalState(createDefaultLocalState());
    setActiveTab("Discover");
    setExportPreview("");
    setStorageStatus("Saved profile and UI settings were cleared.");
    Alert.alert(
      "Local data cleared",
      "Only approved profile, cosmetic, and UI fields were removed. Adult, intent, questionnaire, discovery, proximity, match, message, block, and location state was never stored here.",
    );
  }

  async function showExportPreview() {
    setExportPreview(await repository.exportText());
  }

  if (!adultAccepted) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="auto" />
        <View style={styles.gate}>
          <Text style={styles.title}>Swipe Dating — JavaScript R&D</Text>
          <Text style={styles.warning}>Adults 18+ only. No parental-consent bypass.</Text>
          <TextInput
            accessibilityLabel="Date of birth"
            autoCapitalize="none"
            inputMode="numeric"
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
            value={birthDate}
          />
          <ActionButton label="Continue" onPress={submitAdultGate} primary />
          <Text style={styles.caption}>
            Synthetic research build. Date of birth and adult-gate status are session-only and are not saved by the R&D profile store.
          </Text>
          <Text style={styles.storageStatus}>{storageStatus}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {localState.profile.displayName ? `Swipe R&D · ${localState.profile.displayName}` : "Swipe R&D"}
        </Text>
        <Text style={styles.staging}>JAVASCRIPT · SYNTHETIC ONLY</Text>
      </View>
      <View style={styles.tabBar}>
        {TABS.map((value) => (
          <Pressable key={value} onPress={() => selectTab(value)} style={styles.tabButton}>
            <Text style={[styles.tabText, activeTab === value && styles.tabTextActive]}>
              {tabLabel(value)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === "Discover" && (
          <>
            <Section title="Get fk'd">
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>Nearby compatibility</Text>
                  <Text style={styles.caption}>
                    Off by default. Identical privacy defaults for every gender. Real Bluetooth remains disabled.
                  </Text>
                </View>
                <Switch value={getFkdEnabled} onValueChange={setGetFkdEnabled} />
              </View>
              {getFkdEnabled && (
                <View style={styles.choiceRow}>
                  <Choice
                    label="Prompt first"
                    selected={disclosure === PROXIMITY_DISCLOSURE.PROMPT_BEFORE_SHARING}
                    onPress={() => setDisclosure(PROXIMITY_DISCLOSURE.PROMPT_BEFORE_SHARING)}
                  />
                  <Choice
                    label="Auto-share compatible"
                    selected={disclosure === PROXIMITY_DISCLOSURE.AUTO_SHARE_COMPATIBLE}
                    onPress={() => setDisclosure(PROXIMITY_DISCLOSURE.AUTO_SHARE_COMPATIBLE)}
                  />
                </View>
              )}
              <ActionButton label="Simulate nearby adult" onPress={simulateProximity} />
            </Section>

            <IntentDiscoveryView
              excludedCandidateIds={suppressedCandidateIds}
              hapticsEnabled={localState.ui.hapticsEnabled}
              onInterest={handleInterest}
              onPass={handlePass}
              profiles={SYNTHETIC_PROFILES}
              restoreToken={restoreToken}
              selectedSkinId={localState.cosmetics.selectedSkinId}
            />
          </>
        )}

        {activeTab === "Matches" && (
          <ConversationsView
            conversationState={conversationState}
            onBlock={handleBlock}
            onSend={handleSend}
            onSyntheticReply={handleSyntheticReply}
            onUndo={handleUndo}
            onUnmatch={handleUnmatch}
          />
        )}

        {activeTab === "My Profile" && (
          <>
            <Section title="My local R&D profile">
              <Text style={styles.caption}>
                These presentation fields are stored locally on this device. They are not uploaded by the current build.
              </Text>
              <FieldLabel text="Display name" />
              <TextInput
                accessibilityLabel="Display name"
                maxLength={64}
                onChangeText={(displayName) => updateProfile({ displayName })}
                placeholder="Your display name"
                style={styles.input}
                value={localState.profile.displayName}
              />
              <FieldLabel text="Pronouns" />
              <TextInput
                accessibilityLabel="Pronouns"
                maxLength={40}
                onChangeText={(pronouns) => updateProfile({ pronouns })}
                placeholder="Optional"
                style={styles.input}
                value={localState.profile.pronouns}
              />
              <FieldLabel text="About" />
              <TextInput
                accessibilityLabel="About profile"
                maxLength={500}
                multiline
                onChangeText={(about) => updateProfile({ about })}
                placeholder="Tell people about yourself"
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                value={localState.profile.about}
              />
            </Section>

            <Section title="Local app settings">
              <View style={styles.rowBetween}>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>Haptic feedback</Text>
                  <Text style={styles.caption}>Persisted locally. Does not enable Bluetooth scanning.</Text>
                </View>
                <Switch
                  value={localState.ui.hapticsEnabled}
                  onValueChange={(hapticsEnabled) => updateUi({ hapticsEnabled })}
                />
              </View>
              <Text style={styles.storageStatus}>{storageStatus}</Text>
            </Section>

            <Section title="Persistence boundary">
              <Text style={styles.warning}>
                AsyncStorage is unencrypted. The store excludes adult status, intent and boundary settings, questionnaire answers, discovery history, likes, matches, messages, blocks, location, and proximity identifiers. Even the Matches tab is session-only.
              </Text>
              <View style={styles.choiceRow}>
                <ActionButton label="View redacted export" onPress={showExportPreview} />
                <ActionButton label="Reset saved profile" onPress={resetSavedProfile} />
              </View>
              {exportPreview ? (
                <TextInput
                  accessibilityLabel="Redacted local export"
                  editable={false}
                  multiline
                  style={[styles.exportBox, styles.monospace]}
                  value={exportPreview}
                />
              ) : null}
            </Section>
          </>
        )}

        {activeTab === "Preferences" && (
          <>
            <Section title="Looking For">
              <Text style={styles.caption}>
                Sexual intent is private and disclosed only to independently compatible adults. These selections remain session-only.
              </Text>
              <WrapChoices
                values={LOOKING_FOR_MODES}
                selected={selectedIntents}
                onToggle={(value) => setSelectedIntents(toggleSet(selectedIntents, value))}
              />
            </Section>
            <Section title="Show me">
              <Text style={styles.caption}>
                Private feed controls. Other people are not told why they were excluded. These selections remain session-only.
              </Text>
              <WrapChoices
                values={GENDER_DISCOVERY_CATEGORIES}
                selected={selectedGenders}
                onToggle={(value) => setSelectedGenders(toggleSet(selectedGenders, value))}
              />
            </Section>
            <Section title="Alignment questionnaire">
              <Text style={styles.caption}>
                Answers remain in memory for this session. Purchases and protected traits never affect rank.
              </Text>
              {QUESTIONNAIRE.map((question) => (
                <View key={question.id} style={styles.question}>
                  <Text style={styles.questionText}>{question.prompt}</Text>
                  <WrapChoices
                    values={question.options}
                    selected={new Set(answers[question.id] ? [answers[question.id]] : [])}
                    onToggle={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                  />
                </View>
              ))}
            </Section>
          </>
        )}

        {activeTab === "Skin Shop" && (
          <Section title="Skin Shop">
            <Text style={styles.caption}>
              Synthetic catalog only. Mock ownership is restored across restarts but never changes dating reach or safety access.
            </Text>
            {SKIN_ITEMS.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.caption}>{item.type} · {item.price}</Text>
                </View>
                <ActionButton
                  label={
                    localState.cosmetics.selectedSkinId === item.id
                      ? "Applied"
                      : ownedSkins.has(item.id)
                        ? "Apply"
                        : "Get mock"
                  }
                  disabled={localState.cosmetics.selectedSkinId === item.id}
                  onPress={() => {
                    setLocalState((current) => {
                      const ownedSkinIds = Array.from(new Set([...current.cosmetics.ownedSkinIds, item.id]));
                      return {
                        ...current,
                        cosmetics: { ownedSkinIds, selectedSkinId: item.id },
                      };
                    });
                  }}
                />
              </View>
            ))}
          </Section>
        )}

        {activeTab === "Matched Map" && (
          <Section title="Matched Map">
            <Text style={styles.caption}>
              Matching never shares location automatically. No coordinates are collected or persisted in this build.
            </Text>
            {[
              ["none", "Not now"],
              ["approximate_match_area", "Approximate match area"],
              ["meeting_pin", "Meeting pin"],
              ["live_15_minutes", "Live location — 15 minutes"],
            ].map(([value, label]) => (
              <Choice
                key={value}
                label={label}
                selected={locationChoice === value}
                onPress={() => setLocationChoice(value)}
              />
            ))}
            <Text style={styles.warning}>
              Precise modes require second confirmation, E2EE, expiry, a visible active-share state, and immediate revocation before real use.
            </Text>
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function FieldLabel({ text }) {
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

function WrapChoices({ values, selected, onToggle }) {
  return (
    <View style={styles.wrap}>
      {values.map((value) => (
        <Choice
          key={value}
          label={String(value).replaceAll("_", " ")}
          selected={selected.has(value)}
          onPress={() => onToggle(value)}
        />
      ))}
    </View>
  );
}

function Choice({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({ label, onPress, primary = false, disabled = false }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.action, primary && styles.actionPrimary, disabled && styles.disabled]}
    >
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

function toggleSet(current, value) {
  const next = new Set(current);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function tabLabel(value) {
  const labels = {
    "My Profile": "Profile",
    "Matched Map": "Map",
  };
  return labels[value] ?? value;
}

function formatSavedAt(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "recently"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1115" },
  gate: { flex: 1, justifyContent: "center", gap: 14, padding: 24 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "800" },
  staging: { color: "#ffb45c", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  tabBar: { flexDirection: "row", borderBottomColor: "#292d36", borderBottomWidth: 1 },
  tabButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 2 },
  tabText: { color: "#969eaa", fontSize: 9, textAlign: "center" },
  tabTextActive: { color: "#ff6d9e", fontWeight: "800" },
  content: { gap: 14, padding: 16, paddingBottom: 40 },
  title: { color: "white", fontSize: 28, fontWeight: "800" },
  warning: { color: "#ffb45c", lineHeight: 20 },
  caption: { color: "#aeb5c1", lineHeight: 19 },
  storageStatus: { color: "#69e7c3", fontSize: 12, lineHeight: 18 },
  fieldLabel: { color: "#dfe4eb", fontSize: 13, fontWeight: "700", marginTop: 4 },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: { minHeight: 110 },
  exportBox: {
    backgroundColor: "#0e1014",
    borderColor: "#383f4a",
    borderRadius: 10,
    borderWidth: 1,
    color: "#cbd2dc",
    minHeight: 150,
    padding: 12,
  },
  monospace: { fontFamily: "monospace", fontSize: 11 },
  card: { backgroundColor: "#191d24", borderRadius: 16, gap: 10, padding: 16 },
  sectionTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  choiceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  choice: { borderColor: "#49505d", borderRadius: 99, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  choiceSelected: { backgroundColor: "#ff6d9e", borderColor: "#ff6d9e" },
  choiceText: { color: "#d3d8e0", textTransform: "capitalize" },
  choiceTextSelected: { color: "#17191e", fontWeight: "800" },
  action: { borderColor: "#6c7482", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  actionPrimary: { backgroundColor: "#ff6d9e", borderColor: "#ff6d9e" },
  actionText: { color: "white", fontWeight: "700", textAlign: "center" },
  actionTextPrimary: { color: "#17191e" },
  disabled: { opacity: 0.5 },
  question: { borderTopColor: "#303641", borderTopWidth: 1, gap: 8, marginTop: 8, paddingTop: 12 },
  questionText: { color: "white", fontWeight: "700" },
  listItem: { alignItems: "center", borderTopColor: "#303641", borderTopWidth: 1, flexDirection: "row", gap: 12, paddingVertical: 12 },
  flex: { flex: 1 },
  itemTitle: { color: "white", fontSize: 17, fontWeight: "800" },
});
