import * as Haptics from "expo-haptics";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import {
  BOUNDARY_TAGS,
  DEFAULT_RANKING_WEIGHTS,
  IMMEDIATE_INTENTS,
  RANKING_DIMENSIONS,
  RELATIONAL_OPENNESS,
  advanceProfileReveal,
  normalizeRankingWeights,
  rankDiscoveryCandidates,
} from "@swipe/rnd-discovery";

const INITIAL_BOUNDARIES = ["condoms_required", "public_first_meet", "no_drugs"];

export function IntentDiscoveryView({
  profiles,
  hapticsEnabled,
  selectedSkinId,
  excludedCandidateIds = [],
  restoreToken = null,
  onPass,
  onInterest,
}) {
  const [immediateIntent, setImmediateIntent] = useState("casual_dating");
  const [relationalOpenness, setRelationalOpenness] = useState("open_to_more");
  const [requiredBoundaries, setRequiredBoundaries] = useState(new Set(INITIAL_BOUNDARIES));
  const [weights, setWeights] = useState({ ...DEFAULT_RANKING_WEIGHTS });
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [revealStages, setRevealStages] = useState({});
  const [selectedStarter, setSelectedStarter] = useState(null);

  useEffect(() => {
    if (!restoreToken?.candidateId) return;
    setDismissedIds((ids) => {
      const next = new Set(ids);
      next.delete(restoreToken.candidateId);
      return next;
    });
  }, [restoreToken]);

  const viewer = useMemo(
    () => ({
      id: "local-viewer",
      immediateIntent,
      relationalOpenness,
      acceptedImmediateIntents: [...IMMEDIATE_INTENTS],
      acceptedRelationalOpenness: [...RELATIONAL_OPENNESS],
      boundaries: [...requiredBoundaries],
      requiredBoundaries: [...requiredBoundaries],
      lifestyleTags: ["hiking", "movie_night", "live_music", "gaming"],
      maxDistanceKm: 40,
    }),
    [immediateIntent, relationalOpenness, requiredBoundaries],
  );

  const excluded = useMemo(() => new Set(excludedCandidateIds), [excludedCandidateIds]);
  const ranked = useMemo(
    () =>
      rankDiscoveryCandidates({ viewer, candidates: profiles, weights }).filter(
        ({ candidate }) => !dismissedIds.has(candidate.id) && !excluded.has(candidate.id),
      ),
    [dismissedIds, excluded, profiles, viewer, weights],
  );

  const current = ranked[0] ?? null;
  const normalizedWeights = useMemo(() => normalizeRankingWeights(weights), [weights]);
  const revealStage = current ? revealStages[current.candidate.id] ?? current.result.revealStage : "hidden";

  function toggleBoundary(boundary) {
    setRequiredBoundaries((currentSet) => {
      const next = new Set(currentSet);
      if (next.has(boundary)) next.delete(boundary);
      else next.add(boundary);
      return next;
    });
    setDismissedIds(new Set());
  }

  function adjustWeight(key, delta) {
    setWeights((currentWeights) => ({
      ...currentWeights,
      [key]: Math.max(0, Math.min(100, currentWeights[key] + delta)),
    }));
    setDismissedIds(new Set());
  }

  function inspectProfile(interaction) {
    if (!current) return;
    const next = advanceProfileReveal(revealStage, interaction);
    setRevealStages((stages) => ({ ...stages, [current.candidate.id]: next }));
  }

  async function recordInterest() {
    if (!current) return;
    if (!selectedStarter) {
      Alert.alert(
        "Choose shared ground first",
        "Select one visible tag to reference before recording synthetic interest.",
      );
      return;
    }
    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const outcome = onInterest?.({
      candidate: current.candidate,
      starterTag: selectedStarter,
    });

    Alert.alert(
      outcome?.matched ? "It’s a match — synthetic" : "Interest recorded — synthetic",
      outcome?.matched
        ? `Mutual interest created a session-only match around ${formatLabel(selectedStarter)}.`
        : "The interest is pending. A reciprocal authenticated like is still required.",
    );
    dismissCurrent();
  }

  function passCurrent() {
    if (!current) return;
    onPass?.({ candidateId: current.candidate.id });
    dismissCurrent();
  }

  function dismissCurrent() {
    if (!current) return;
    setDismissedIds((ids) => new Set([...ids, current.candidate.id]));
    setSelectedStarter(null);
  }

  function resetQueue() {
    setDismissedIds(new Set());
    setSelectedStarter(null);
  }

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Intent-driven discovery</Text>
        <Text style={styles.caption}>
          Immediate desire and relational openness are separate. All controls are session-only in this synthetic build.
        </Text>

        <Text style={styles.label}>What fits right now?</Text>
        <ChoiceWrap
          values={IMMEDIATE_INTENTS}
          selected={new Set([immediateIntent])}
          onPress={(value) => {
            setImmediateIntent(value);
            setDismissedIds(new Set());
          }}
        />

        <Text style={styles.label}>What could this become?</Text>
        <ChoiceWrap
          values={RELATIONAL_OPENNESS}
          selected={new Set([relationalOpenness])}
          onPress={(value) => {
            setRelationalOpenness(value);
            setDismissedIds(new Set());
          }}
        />

        <Text style={styles.label}>Required boundaries</Text>
        <Text style={styles.caption}>
          Selected boundaries are hard exclusions, not soft ranking boosts. They are not disclosed as rejection reasons.
        </Text>
        <ChoiceWrap values={BOUNDARY_TAGS} selected={requiredBoundaries} onPress={toggleBoundary} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Choose your algorithm</Text>
        <Text style={styles.caption}>
          Ranking is transparent and excludes protected traits, inferred attractiveness, popularity, and purchases.
        </Text>
        {RANKING_DIMENSIONS.map((key) => (
          <View key={key} style={styles.weightRow}>
            <Text style={styles.weightLabel}>{formatLabel(key)}</Text>
            <View style={styles.weightControls}>
              <SmallButton label="−" onPress={() => adjustWeight(key, -5)} />
              <Text style={styles.weightValue}>{normalizedWeights[key]}%</Text>
              <SmallButton label="+" onPress={() => adjustWeight(key, 5)} />
            </View>
          </View>
        ))}
        <Pressable onPress={() => setWeights({ ...DEFAULT_RANKING_WEIGHTS })} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Reset balanced weights</Text>
        </Pressable>
      </View>

      {current ? (
        <View style={[styles.profileCard, selectedSkinId === "neon-orbit" && styles.neonCard]}>
          <Text style={styles.syntheticLabel}>SYNTHETIC · BIO-FIRST</Text>
          <Text style={styles.score}>{current.result.score}% compatible</Text>

          <View style={[styles.mediaPlaceholder, revealStage === "photo_revealed" && styles.mediaRevealed]}>
            <Text style={styles.mediaText}>
              {revealStage === "photo_revealed"
                ? `${current.candidate.displayName.slice(0, 1)} · SYNTHETIC VISUAL REVEALED`
                : "PHOTO HIDDEN · INSPECT BIO OR TAGS"}
            </Text>
          </View>

          <Text style={styles.profileName}>
            {revealStage === "photo_revealed" ? current.candidate.displayName : "Profile preview"}
          </Text>
          <Text style={styles.profileMeta}>
            {current.candidate.ageBand} · {formatLabel(current.candidate.immediateIntent)} · {formatLabel(current.candidate.relationalOpenness)}
          </Text>
          <Text style={styles.profileAbout}>{current.candidate.about}</Text>

          <Pressable onPress={() => inspectProfile("read_bio")} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>I read the bio</Text>
          </Pressable>

          <Text style={styles.label}>Lifestyle and shared-ground tags</Text>
          <ChoiceWrap
            values={current.candidate.lifestyleTags}
            selected={new Set(selectedStarter ? [selectedStarter] : [])}
            onPress={(value) => {
              setSelectedStarter(value);
              inspectProfile("inspect_tags");
            }}
          />

          <Text style={styles.label}>Boundary alignment</Text>
          <View style={styles.wrap}>
            {current.candidate.boundaries.map((value) => (
              <View key={value} style={styles.staticTag}>
                <Text style={styles.staticTagText}>{formatLabel(value)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.label}>Why this profile ranked here</Text>
          {current.result.explanation.slice(0, 3).map((item) => (
            <Text key={item.key} style={styles.caption}>
              {formatLabel(item.key)}: {item.component}/100 at {item.weight}% weight
            </Text>
          ))}

          <View style={styles.actionRow}>
            <Pressable onPress={passCurrent} style={styles.actionButton}>
              <Text style={styles.actionText}>Pass</Text>
            </Pressable>
            <Pressable onPress={recordInterest} style={[styles.actionButton, styles.primaryButton]}>
              <Text style={[styles.actionText, styles.primaryButtonText]}>Interested</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>No eligible synthetic profiles</Text>
          <Text style={styles.caption}>
            Current mutual-intent, boundary, prior-decision, match, and block rules excluded or exhausted the fixtures. No rule was silently relaxed.
          </Text>
          <Pressable onPress={resetQueue} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Reset local view</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

function ChoiceWrap({ values, selected, onPress }) {
  return (
    <View style={styles.wrap}>
      {values.map((value) => (
        <Pressable
          key={value}
          onPress={() => onPress(value)}
          style={[styles.choice, selected.has(value) && styles.choiceSelected]}
        >
          <Text style={[styles.choiceText, selected.has(value) && styles.choiceTextSelected]}>
            {formatLabel(value)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function SmallButton({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.smallButton}>
      <Text style={styles.smallButtonText}>{label}</Text>
    </Pressable>
  );
}

function formatLabel(value) {
  return String(value).replaceAll("_", " ");
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#191d24", borderRadius: 16, gap: 10, padding: 16 },
  sectionTitle: { color: "white", fontSize: 20, fontWeight: "800" },
  caption: { color: "#aeb5c1", lineHeight: 19 },
  label: { color: "#dfe4eb", fontSize: 13, fontWeight: "800", marginTop: 6 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: { borderColor: "#49505d", borderRadius: 99, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  choiceSelected: { backgroundColor: "#ff6d9e", borderColor: "#ff6d9e" },
  choiceText: { color: "#d3d8e0", textTransform: "capitalize" },
  choiceTextSelected: { color: "#17191e", fontWeight: "800" },
  weightRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  weightLabel: { color: "#dfe4eb", textTransform: "capitalize" },
  weightControls: { alignItems: "center", flexDirection: "row", gap: 8 },
  weightValue: { color: "white", fontVariant: ["tabular-nums"], minWidth: 42, textAlign: "center" },
  smallButton: { alignItems: "center", borderColor: "#5b6370", borderRadius: 8, borderWidth: 1, height: 32, justifyContent: "center", width: 32 },
  smallButtonText: { color: "white", fontSize: 20, fontWeight: "800" },
  secondaryButton: { borderColor: "#6c7482", borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  secondaryButtonText: { color: "white", fontWeight: "700", textAlign: "center" },
  profileCard: { backgroundColor: "#242936", borderRadius: 22, gap: 10, padding: 20 },
  neonCard: { borderColor: "#b76cff", borderWidth: 3, shadowColor: "#5be7ff", shadowOpacity: 0.8, shadowRadius: 18 },
  syntheticLabel: { color: "#69e7c3", fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  score: { color: "#ff9fc0", fontSize: 22, fontWeight: "900" },
  mediaPlaceholder: { alignItems: "center", backgroundColor: "#11141a", borderColor: "#3a414d", borderRadius: 16, borderStyle: "dashed", borderWidth: 1, height: 180, justifyContent: "center", padding: 18 },
  mediaRevealed: { backgroundColor: "#30233d", borderColor: "#b76cff", borderStyle: "solid" },
  mediaText: { color: "#cbd2dc", fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textAlign: "center" },
  profileName: { color: "white", fontSize: 30, fontWeight: "900" },
  profileMeta: { color: "#ff9fc0", fontSize: 14, fontWeight: "700", textTransform: "capitalize" },
  profileAbout: { color: "white", fontSize: 17, lineHeight: 24 },
  staticTag: { backgroundColor: "#343b47", borderRadius: 99, paddingHorizontal: 11, paddingVertical: 8 },
  staticTagText: { color: "#dce2ea", textTransform: "capitalize" },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionButton: { borderColor: "#6c7482", borderRadius: 10, borderWidth: 1, flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  primaryButton: { backgroundColor: "#ff6d9e", borderColor: "#ff6d9e" },
  actionText: { color: "white", fontWeight: "800", textAlign: "center" },
  primaryButtonText: { color: "#17191e" },
});
