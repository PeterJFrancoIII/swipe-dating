import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
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
  GENDER_DISCOVERY_CATEGORIES,
  LOOKING_FOR_MODES,
  PROXIMITY_DISCLOSURE,
  decideProximityEvent,
  isAdultOn,
} from "@swipe/rnd-domain";

import { QUESTIONNAIRE, SKIN_ITEMS, SYNTHETIC_PROFILES } from "./mock-data.js";

const TODAY = "2026-07-21";

export default function App() {
  const [birthDate, setBirthDate] = useState("2000-01-01");
  const [adultAccepted, setAdultAccepted] = useState(false);
  const [tab, setTab] = useState("Discover");
  const [getFkdEnabled, setGetFkdEnabled] = useState(false);
  const [disclosure, setDisclosure] = useState(PROXIMITY_DISCLOSURE.PROMPT_BEFORE_SHARING);
  const [selectedIntents, setSelectedIntents] = useState(new Set(["dating"]));
  const [selectedGenders, setSelectedGenders] = useState(new Set());
  const [answers, setAnswers] = useState({});
  const [ownedSkins, setOwnedSkins] = useState(new Set());
  const [selectedSkin, setSelectedSkin] = useState(null);
  const [locationChoice, setLocationChoice] = useState("none");
  const [profileIndex, setProfileIndex] = useState(0);

  const currentProfile = SYNTHETIC_PROFILES[profileIndex % SYNTHETIC_PROFILES.length];
  const tabs = useMemo(() => ["Discover", "Preferences", "Skin Shop", "Matched Map"], []);

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
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Nearby adult detected — synthetic",
      decision === "buzz_and_prompt"
        ? "Your profile remains hidden until you approve sharing."
        : "A short-lived compatible-user profile capability would be shared in the future BLE build.",
    );
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
            Synthetic research build. No real age provider, BLE, location, profiles, purchases, or messages.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swipe R&D</Text>
        <Text style={styles.staging}>JAVASCRIPT · SYNTHETIC ONLY</Text>
      </View>
      <View style={styles.tabBar}>
        {tabs.map((value) => (
          <Pressable key={value} onPress={() => setTab(value)} style={styles.tabButton}>
            <Text style={[styles.tabText, tab === value && styles.tabTextActive]}>{value}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {tab === "Discover" && (
          <>
            <View style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionTitle}>Get fk'd</Text>
                <Switch value={getFkdEnabled} onValueChange={setGetFkdEnabled} />
              </View>
              <Text style={styles.caption}>
                Off by default. Privacy defaults are identical for every gender. Real Bluetooth is disabled.
              </Text>
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
            </View>

            <View style={[styles.profileCard, selectedSkin === "neon-orbit" && styles.neonCard]}>
              <Text style={styles.syntheticLabel}>SYNTHETIC PROFILE</Text>
              <Text style={styles.profileName}>{currentProfile.displayName}</Text>
              <Text style={styles.profileMeta}>
                {currentProfile.ageBand} · {currentProfile.alignment}% aligned
              </Text>
              <Text style={styles.profileAbout}>{currentProfile.about}</Text>
              <Text style={styles.caption}>Looking for: {currentProfile.intents.join(", ")}</Text>
              <View style={styles.choiceRow}>
                <ActionButton
                  label="Pass"
                  onPress={() => setProfileIndex((value) => value + 1)}
                />
                <ActionButton
                  label="Interested"
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Alert.alert("Interest recorded", "A reciprocal authenticated like is still required.");
                    setProfileIndex((value) => value + 1);
                  }}
                  primary
                />
              </View>
            </View>
          </>
        )}

        {tab === "Preferences" && (
          <>
            <Section title="Looking For">
              <Text style={styles.caption}>
                Sexual intent is private and disclosed only to independently compatible adults.
              </Text>
              <WrapChoices
                values={LOOKING_FOR_MODES}
                selected={selectedIntents}
                onToggle={(value) => setSelectedIntents(toggleSet(selectedIntents, value))}
              />
            </Section>
            <Section title="Show me">
              <Text style={styles.caption}>
                Private feed controls. Other people are not told why they were excluded.
              </Text>
              <WrapChoices
                values={GENDER_DISCOVERY_CATEGORIES}
                selected={selectedGenders}
                onToggle={(value) => setSelectedGenders(toggleSet(selectedGenders, value))}
              />
            </Section>
            <Section title="Alignment questionnaire">
              <Text style={styles.caption}>
                Answers remain local in this build. Purchases and protected traits never affect rank.
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

        {tab === "Skin Shop" && (
          <Section title="Skin Shop">
            <Text style={styles.caption}>
              Synthetic catalog only. Cosmetic ownership never changes dating reach or safety access.
            </Text>
            {SKIN_ITEMS.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.caption}>{item.type} · {item.price}</Text>
                </View>
                <ActionButton
                  label={selectedSkin === item.id ? "Applied" : ownedSkins.has(item.id) ? "Apply" : "Get mock"}
                  disabled={selectedSkin === item.id}
                  onPress={() => {
                    setOwnedSkins(new Set([...ownedSkins, item.id]));
                    setSelectedSkin(item.id);
                  }}
                />
              </View>
            ))}
          </Section>
        )}

        {tab === "Matched Map" && (
          <Section title="Matched Map">
            <Text style={styles.caption}>
              Matching never shares location automatically. No coordinates are collected in this build.
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
              Precise modes require a second confirmation, E2EE, expiry, visible active-share state, and immediate revocation before real use.
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0f1115" },
  gate: { flex: 1, justifyContent: "center", gap: 14, padding: 24 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTitle: { color: "white", fontSize: 24, fontWeight: "800" },
  staging: { color: "#ffb45c", fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  tabBar: { flexDirection: "row", borderBottomColor: "#292d36", borderBottomWidth: 1 },
  tabButton: { flex: 1, paddingVertical: 12, paddingHorizontal: 4 },
  tabText: { color: "#969eaa", fontSize: 11, textAlign: "center" },
  tabTextActive: { color: "#ff6d9e", fontWeight: "800" },
  content: { gap: 14, padding: 16, paddingBottom: 40 },
  title: { color: "white", fontSize: 28, fontWeight: "800" },
  warning: { color: "#ffb45c", lineHeight: 20 },
  caption: { color: "#aeb5c1", lineHeight: 19 },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  card: { backgroundColor: "#191d24", borderRadius: 16, gap: 10, padding: 16 },
  profileCard: { backgroundColor: "#242936", borderRadius: 22, gap: 10, minHeight: 330, padding: 20 },
  neonCard: { borderColor: "#b76cff", borderWidth: 3, shadowColor: "#5be7ff", shadowOpacity: 0.8, shadowRadius: 18 },
  syntheticLabel: { color: "#69e7c3", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  profileName: { color: "white", fontSize: 34, fontWeight: "900", marginTop: 110 },
  profileMeta: { color: "#ff9fc0", fontSize: 16, fontWeight: "700" },
  profileAbout: { color: "white", fontSize: 17, lineHeight: 24 },
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
