import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { DatingCard, ProfileSheet } from "@/components/DatingCard";
import { ActionBang } from "@/components/ReportBugButton";
import { surfaceHref } from "@/lib/surfaces";
import { MatchMoment } from "@/components/MatchMoment";
import { Screen, Toast } from "@/components/Screen";
import { TopChrome } from "@/components/TopChrome";
import { alignmentLabel } from "@/lib/alignment";
import { ApiError, api } from "@/lib/api";
import { displayDistance } from "@/lib/distance";
import { loadDiscoverPack, prefetchCandidatePhotos } from "@/lib/hotDeck";
import { syncLooseLocation } from "@/lib/location";
import { useSession } from "@/lib/session";
import type { DiscoverState, MatchedWith } from "@/lib/types";
import { theme } from "@/lib/theme";

export default function SwipeScreen() {
  const router = useRouter();
  const { reportOptions } = useSession();
  const [state, setState] = useState<DiscoverState | null>(null);
  const [photo, setPhoto] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState(reportOptions[0]?.id ?? "scam");
  const [note, setNote] = useState("");
  const [flash, setFlash] = useState<{ error?: string | null; notice?: string | null }>({});
  const [matchMoment, setMatchMoment] = useState<MatchedWith | null>(null);

  const load = useCallback(async (index = 0) => {
    const next = await loadDiscoverPack(index);
    setState(next);
    setPhoto(next.candidate?.photo_index ?? 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await syncLooseLocation();
        await load(0);
      })().catch((cause) => {
        setFlash({ error: cause instanceof ApiError ? cause.message : "Discover failed." });
      });
    }, [load]),
  );

  async function run(action: () => Promise<DiscoverState>) {
    const liked = candidate;
    try {
      const next = await action();
      setState(next);
      setPhoto(next.candidate?.photo_index ?? 0);
      setReportOpen(false);
      if (next.matched && next.match_id) {
        setMatchMoment(
          next.matched_with ?? {
            match_id: next.match_id,
            display_name: liked?.display_name ?? "Your match",
            age_band: liked?.age_band ?? "",
            photo_url: liked?.photos[0] ?? liked?.photo_url ?? "",
          },
        );
        setFlash({});
      } else {
        setFlash({ notice: next.notice, error: next.error });
      }
      if (next.candidate) {
        void prefetchCandidatePhotos(next.candidate, 1);
      }
      void loadDiscoverPack(0);
    } catch (cause) {
      setFlash({ error: cause instanceof ApiError ? cause.message : "Action failed." });
    }
  }

  const candidate = state?.candidate ?? null;
  const reach = state?.reach;
  const outOfSwipes = reach?.swipes_remaining === 0;

  return (
    <Screen padded={false} footer={false}>
      <TopChrome />
      <View style={styles.stage}>
        <Toast error={flash.error} notice={flash.notice} />
        <View style={styles.reach}>
          {reach?.boost_active ? (
            <Text numberOfLines={1} style={styles.reachText}>
              Boost on · {Math.floor((reach.boost_remaining_ms || 0) / 60000)} min left
            </Text>
          ) : (
            <>
              <Text numberOfLines={1} style={styles.reachText}>
                {outOfSwipes
                  ? "Out of free swipes today"
                  : `${reach?.swipes_remaining ?? "—"} swipe${
                      (reach?.swipes_remaining ?? 0) === 1 ? "" : "s"
                    } left`}{" "}
                · {reach?.boosts ?? 0} Boost{(reach?.boosts ?? 0) === 1 ? "" : "s"}
              </Text>
              <ActionBang href={surfaceHref("swipe", "boost")} label="Boost">
                <Pressable onPress={() => void run(() => api.boost())} style={styles.secondary}>
                  <Text style={styles.secondaryLabel}>Boost</Text>
                </Pressable>
              </ActionBang>
            </>
          )}
        </View>
        {candidate ? (
          <>
            <View style={styles.cardSlot}>
              <DatingCard
                candidate={candidate}
                photoIndex={photo}
                onPhoto={setPhoto}
                onOpen={() => setSheet(true)}
                footerHeight={reportOpen ? 0 : 84}
              />
              {reportOpen ? null : (
                <View style={styles.deck}>
                  <ActionBang href={surfaceHref("swipe", "deck", "undo")} label="Undo">
                    <Pressable accessibilityLabel="Undo last decision" onPress={() => void run(() => api.undo())} style={styles.small}>
                      <Text style={styles.smallMark}>↶</Text>
                    </Pressable>
                  </ActionBang>
                  <ActionBang href={surfaceHref("swipe", "deck", "pass")} label="Pass">
                    <Pressable
                      accessibilityLabel={`Pass ${candidate.display_name}`}
                      disabled={outOfSwipes}
                      onPress={() => void run(() => api.pass(candidate.id))}
                      style={[styles.round, outOfSwipes && styles.deckDisabled]}
                    >
                      <Text style={styles.passMark}>×</Text>
                    </Pressable>
                  </ActionBang>
                  <ActionBang href={surfaceHref("swipe", "deck", "superlike")} label="Superlike">
                    <Pressable
                      accessibilityLabel={`Superlike ${candidate.display_name}`}
                      disabled={outOfSwipes}
                      onPress={() => void run(() => api.superlike(candidate.id))}
                      style={[styles.superlike, outOfSwipes && styles.deckDisabled]}
                    >
                      <Text style={styles.superMark}>★</Text>
                    </Pressable>
                  </ActionBang>
                  <ActionBang href={surfaceHref("swipe", "deck", "like")} label="Like">
                    <Pressable
                      accessibilityLabel={`Like ${candidate.display_name}`}
                      disabled={outOfSwipes}
                      onPress={() => void run(() => api.like(candidate.id))}
                      style={[styles.like, outOfSwipes && styles.deckDisabled]}
                    >
                      <Text style={styles.likeMark}>♥</Text>
                    </Pressable>
                  </ActionBang>
                  <ActionBang href={surfaceHref("swipe", "deck", "more")} label="More actions">
                    <Pressable accessibilityLabel="More actions" onPress={() => setReportOpen(true)} style={styles.small}>
                      <Text style={styles.smallMark}>•••</Text>
                    </Pressable>
                  </ActionBang>
                </View>
              )}
              {reportOpen ? (
                <ScrollView style={styles.report} contentContainerStyle={styles.reportInner}>
                  <View style={styles.reportHead}>
                    <Text style={styles.reportTitle}>Report {candidate.display_name}</Text>
                    <Pressable accessibilityLabel="Close" onPress={() => setReportOpen(false)}>
                      <Text style={styles.reportClose}>Close</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.reportHelp}>
                    Block, report, or both. Blocked people disappear from Discovery. They are not told.
                  </Text>
                  {reportOptions.map((option) => (
                    <Pressable key={option.id} onPress={() => setReason(option.id)}>
                      <Text style={[styles.reason, reason === option.id && styles.reasonOn]}>
                        {reason === option.id ? "● " : "○ "}
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                  <TextInput
                    onChangeText={setNote}
                    placeholder="What looked suspicious?"
                    placeholderTextColor={theme.mute}
                    style={styles.note}
                    value={note}
                  />
                  <Pressable
                    onPress={() => void run(() => api.blockCandidate(candidate.id))}
                    style={styles.danger}
                  >
                    <Text style={styles.dangerLabel}>Block</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void run(() => api.report(candidate.id, reason, note))}
                    style={styles.danger}
                  >
                    <Text style={styles.dangerLabel}>Report</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void run(() => api.report(candidate.id, reason, note, true))}
                    style={styles.danger}
                  >
                    <Text style={styles.dangerLabel}>Report & Block</Text>
                  </Pressable>
                </ScrollView>
              ) : null}
            </View>
            <ProfileSheet
              visible={sheet}
              onClose={() => setSheet(false)}
              name={candidate.display_name}
              age={candidate.age_band}
              genders={candidate.genders}
              looking={candidate.looking}
              habits={candidate.habits}
              about={candidate.about}
              interests={candidate.all_interests}
              turnOns={candidate.turn_ons}
              boosted={candidate.boosted}
              alignment={alignmentLabel(candidate)}
              distance={displayDistance(candidate.distance_label || candidate.region_label)}
              photos={candidate.photos}
              photoIndex={photo}
              onPhoto={setPhoto}
              synthetic={candidate.synthetic}
              testing_banner={candidate.testing_banner}
            />
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyHeart}>♡</Text>
            </View>
            <Text style={styles.emptyTitle}>Nobody new right now.</Text>
            <Text style={styles.emptyCopy}>
              Check back when someone else joins. Cards marked FAKE are for internal
              testing only.
            </Text>
            <Pressable onPress={() => router.push("/filters")} style={styles.secondary}>
              <Text style={styles.secondaryLabel}>Adjust settings</Text>
            </Pressable>
          </View>
        )}
      </View>
      <MatchMoment
        match={matchMoment}
        onChat={() => {
          const id = matchMoment?.match_id;
          setMatchMoment(null);
          if (id) {
            router.push(`/matches/${encodeURIComponent(id)}`);
          }
        }}
        onKeepSwiping={() => setMatchMoment(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 480,
    paddingHorizontal: 10,
    width: "100%",
  },
  reach: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reachText: {
    color: "#5C2A3E",
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  secondary: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  secondaryLabel: {
    color: theme.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  deck: {
    alignItems: "center",
    bottom: 12,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: 10,
    position: "absolute",
    right: 0,
    zIndex: 10,
  },
  round: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 29,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  small: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 23,
    borderWidth: 1,
    height: 45,
    justifyContent: "center",
    width: 45,
  },
  smallMark: {
    color: theme.mute,
    fontSize: 18,
  },
  passMark: {
    color: theme.ink,
    fontSize: 38,
    lineHeight: 38,
  },
  superlike: {
    alignItems: "center",
    backgroundColor: theme.superlike,
    borderColor: theme.superlikeBorder,
    borderRadius: 29,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  superMark: {
    color: "#e8edff",
    fontSize: 22,
  },
  like: {
    alignItems: "center",
    backgroundColor: theme.roseBtn,
    borderRadius: 29,
    height: 58,
    justifyContent: "center",
    shadowColor: theme.roseDeep,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    width: 58,
  },
  likeMark: {
    color: "#fff",
    fontSize: 26,
  },
  deckDisabled: {
    opacity: 0.35,
  },
  cardSlot: {
    flex: 1,
    minHeight: 240,
    position: "relative",
  },
  report: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 22,
    borderWidth: 1,
    zIndex: 12,
  },
  reportInner: {
    gap: 8,
    padding: 18,
  },
  reportHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportTitle: {
    color: theme.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  reportClose: {
    color: theme.mute,
    fontSize: 14,
    fontWeight: "700",
  },
  reportHelp: {
    color: theme.mute,
    fontSize: 12,
    lineHeight: 17,
  },
  reason: {
    color: theme.mute,
    fontSize: 14,
    paddingVertical: 6,
  },
  reasonOn: {
    color: theme.ink,
    fontWeight: "800",
  },
  note: {
    borderColor: theme.line,
    borderRadius: 13,
    borderWidth: 1,
    color: theme.ink,
    minHeight: 80,
    padding: 12,
  },
  danger: {
    alignItems: "center",
    backgroundColor: theme.errorBg,
    borderColor: "#F3A0B4",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
  },
  dangerLabel: {
    color: theme.errorInk,
    fontWeight: "800",
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: "#FFE4EE",
    borderColor: theme.line,
    borderRadius: 26,
    borderWidth: 1,
    height: 70,
    justifyContent: "center",
    marginBottom: 8,
    width: 70,
  },
  emptyHeart: {
    color: "#ff527c",
    fontSize: 34,
  },
  emptyTitle: {
    color: theme.ink,
    fontSize: 29,
    fontWeight: "800",
  },
  emptyCopy: {
    color: theme.mute,
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
});
