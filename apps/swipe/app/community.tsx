import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { Screen, Toast } from "@/components/Screen";
import { ApiError, api } from "@/lib/api";
import type { CommunityCase } from "@/lib/types";
import { theme } from "@/lib/theme";

export default function CommunityScreen() {
  const router = useRouter();
  const [cases, setCases] = useState<CommunityCase[]>([]);
  const [flash, setFlash] = useState<{ error?: string | null; notice?: string | null }>({});

  const load = useCallback(async () => {
    const payload = await api.community();
    setCases(payload.cases);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load().catch((cause) => {
        setFlash({ error: cause instanceof ApiError ? cause.message : "Community failed." });
      });
    }, [load]),
  );

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable accessibilityLabel="Back to profile" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backMark}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>Community review</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.eyebrow}>PRIVATE BOT CONTROL</Text>
        <Text style={styles.title}>Trusted community review.</Text>
        <Text style={styles.lede}>
          Eligible reviewers vote Bot, Human, or Unsure. Five suspicious votes are required for community containment.
        </Text>
        <Toast error={flash.error} notice={flash.notice} />
        {cases.length ? (
          cases.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.micro}>{item.id}</Text>
                  <Text style={styles.name}>{item.subject}</Text>
                  <Text style={styles.meta}>
                    {item.age_band} · {item.reason.replace(/_/g, " ")}
                  </Text>
                </View>
                <Text style={styles.status}>{item.status.replace(/_/g, " ")}</Text>
              </View>
              <Text style={styles.about}>{item.about}</Text>
              {item.evidence_note ? <Text style={styles.about}>Reporter note: {item.evidence_note}</Text> : null}
              <Text style={styles.meta}>
                {item.vote_count} / 7 trusted votes · {item.suspicious_votes} suspicious · {item.risk_score} / 100 risk
              </Text>
              {item.reviewers.map((reviewer) => (
                <View key={reviewer.id} style={styles.reviewer}>
                  <View>
                    <Text style={styles.reviewerId}>{reviewer.id}</Text>
                    <Text style={styles.meta}>
                      {reviewer.account_age_days} days · reputation {reviewer.reputation}
                    </Text>
                  </View>
                  <View style={styles.votes}>
                    <Pressable
                      onPress={async () => {
                        const payload = await api.vote(item.id, reviewer.id, "suspicious");
                        setCases(payload.cases);
                        setFlash({ notice: payload.notice });
                      }}
                      style={styles.vote}
                    >
                      <Text style={styles.danger}>Bot-like</Text>
                    </Pressable>
                    <Pressable
                      onPress={async () => {
                        const payload = await api.vote(item.id, reviewer.id, "likely_human");
                        setCases(payload.cases);
                        setFlash({ notice: payload.notice });
                      }}
                      style={styles.vote}
                    >
                      <Text>Likely human</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
              <View style={styles.actions}>
                {item.can_appeal ? (
                  <Pressable
                    onPress={async () => {
                      const payload = await api.appeal(item.id);
                      setCases(payload.cases);
                      setFlash({ notice: payload.notice });
                    }}
                    style={styles.vote}
                  >
                    <Text>Appeal</Text>
                  </Pressable>
                ) : null}
                {item.can_adjudicate ? (
                  <Pressable
                    onPress={async () => {
                      const payload = await api.adjudicate(item.id);
                      setCases(payload.cases);
                      setFlash({ notice: payload.notice });
                    }}
                    style={styles.primary}
                  >
                    <Text style={styles.primaryLabel}>Finish review</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.title}>No open cases.</Text>
            <Text style={styles.lede}>A private community review begins after a user files a report from Swipe or a match.</Text>
            <Pressable onPress={() => router.replace("/")} style={styles.primary}>
              <Text style={styles.primaryLabel}>Return to Swipe</Text>
            </Pressable>
          </View>
        )}
        <View style={styles.policy}>
          <Text style={styles.noteTitle}>Wrong-vote deterrence</Text>
          <Text style={styles.lede}>
            Demonstrated wrong-vote patterns reduce moderation reputation and can remove review privileges. Purchases,
            attractiveness, and dating popularity never grant moderation power.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  back: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 14,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  backMark: {
    fontSize: 30,
    lineHeight: 30,
  },
  topTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  spacer: {
    width: 38,
  },
  page: {
    gap: 12,
    paddingBottom: 40,
    paddingTop: 8,
  },
  eyebrow: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: theme.ink,
    fontSize: 28,
    fontWeight: "800",
  },
  lede: {
    color: theme.mute,
    fontSize: 12,
    lineHeight: 17,
  },
  card: {
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 17,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  micro: {
    color: theme.mute,
    fontSize: 9,
    letterSpacing: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "800",
  },
  meta: {
    color: theme.navIdle,
    fontSize: 10,
  },
  status: {
    backgroundColor: "#FFE4EE",
    borderRadius: 999,
    color: theme.muteDeep,
    fontSize: 9,
    overflow: "hidden",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  about: {
    color: theme.mute,
    fontSize: 12,
    lineHeight: 17,
  },
  reviewer: {
    borderTopColor: theme.lineStrong,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 9,
  },
  reviewerId: {
    fontSize: 10,
    fontWeight: "800",
  },
  votes: {
    flexDirection: "row",
    gap: 5,
  },
  vote: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  danger: {
    color: "#ff91a7",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  primary: {
    backgroundColor: "#ff4c77",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  primaryLabel: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  empty: {
    alignItems: "center",
    gap: 10,
    paddingTop: 40,
  },
  policy: {
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
  },
  noteTitle: {
    fontSize: 11,
    fontWeight: "800",
  },
});
