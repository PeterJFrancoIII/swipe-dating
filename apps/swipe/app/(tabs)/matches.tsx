import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { AuthPhoto } from "@/components/AuthPhoto";
import { ActionBang, SurfaceBang } from "@/components/ReportBugButton";
import { surfaceHref } from "@/lib/surfaces";
import { Screen, Toast } from "@/components/Screen";
import { TopChrome } from "@/components/TopChrome";
import { alignmentLabel } from "@/lib/alignment";
import { ApiError, api } from "@/lib/api";
import { formatRemaining, statusLabel } from "@/lib/matchTime";
import { avatarWash } from "@/lib/deck";
import type { MatchRow } from "@/lib/types";
import { theme } from "@/lib/theme";

export default function MatchesScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void api
        .matches()
        .then((payload) => setMatches(payload.matches))
        .catch((cause) => setError(cause instanceof ApiError ? cause.message : "Matches failed."));
    }, []),
  );

  return (
    <Screen padded={false}>
      <TopChrome />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.heading}>
          <View>
            <Text style={styles.eyebrow}>MATCHES</Text>
            <Text style={styles.title}>People who chose you too.</Text>
          </View>
          <View style={styles.headingMeta}>
            <SurfaceBang href={surfaceHref("matches")} label="Matches" />
            <Text style={styles.count}>{matches.length}</Text>
          </View>
        </View>
        <Toast error={error} />
        {matches.length ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
              {matches.map((match) => (
                <Pressable key={`bubble-${match.id}`} onPress={() => router.push(`/matches/${encodeURIComponent(match.id)}`)} style={styles.bubble}>
                  <AuthPhoto
                    fallback={match.initial}
                    path={match.photo_url}
                    style={[styles.avatar, !match.photo_url ? { backgroundColor: avatarWash(match.candidate_id) } : null]}
                  />
                  <Text style={styles.bubbleName}>
                    {match.getfkd ? "💦 " : ""}
                    {match.display_name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.listTitle}>Conversations</Text>
            {matches.map((match) => (
              <ActionBang key={match.id} href={surfaceHref("matches", "row")} label={`Chat with ${match.display_name}`}>
              <Pressable onPress={() => router.push(`/matches/${encodeURIComponent(match.id)}`)} style={styles.row}>
                <AuthPhoto
                  fallback={match.initial}
                  path={match.photo_url}
                  style={[styles.rowAvatar, !match.photo_url ? { backgroundColor: avatarWash(match.candidate_id) } : null]}
                />
                <View style={styles.copy}>
                  <Text style={styles.name}>
                    {match.getfkd ? "Get Fk'd · " : ""}
                    {match.display_name} <Text style={styles.age}>{match.age_band}</Text>
                  </Text>
                  <Text numberOfLines={1} style={styles.preview}>
                    {match.preview}
                  </Text>
                  <Text
                    style={[
                      styles.meta,
                      match.urgency === "critical" || match.status?.startsWith("expired")
                        ? styles.metaHot
                        : match.urgency === "soon"
                          ? styles.metaSoon
                          : null,
                    ]}
                  >
                    {[statusLabel(match.status), formatRemaining(match.remaining_ms), alignmentLabel(match)]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
              </ActionBang>
            ))}
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyMark}>◉</Text>
            </View>
            <Text style={styles.emptyTitle}>No matches yet.</Text>
            <Text style={styles.emptyCopy}>
              A match appears only after mutual interest. Likes never create a unilateral match.
            </Text>
            <Pressable onPress={() => router.replace("/")} style={styles.primary}>
              <Text style={styles.primaryLabel}>Go to Swipe</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headingMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingTop: 10,
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
    letterSpacing: -1,
    maxWidth: 330,
  },
  count: {
    alignSelf: "flex-start",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 999,
    borderWidth: 1,
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  strip: {
    marginBottom: 18,
  },
  bubble: {
    alignItems: "center",
    marginRight: 16,
    width: 68,
  },
  avatar: {
    alignItems: "center",
    borderColor: "#ff527c",
    borderRadius: 31,
    borderWidth: 2,
    height: 62,
    justifyContent: "center",
    overflow: "hidden",
    width: 62,
  },
  initial: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 24,
    fontWeight: "900",
  },
  bubbleName: {
    color: "#6B3148",
    fontSize: 11,
    marginTop: 7,
  },
  listTitle: {
    color: theme.muteDeep,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  row: {
    alignItems: "center",
    borderBottomColor: "#F7D5E2",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  rowAvatar: {
    alignItems: "center",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    overflow: "hidden",
    width: 52,
  },
  rowInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
  copy: {
    flex: 1,
  },
  name: {
    color: theme.ink,
    fontSize: 15,
    fontWeight: "800",
  },
  age: {
    color: theme.mute,
    fontWeight: "500",
  },
  preview: {
    color: theme.mute,
    fontSize: 12,
    marginTop: 4,
  },
  meta: {
    color: theme.navIdle,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
  },
  metaSoon: {
    color: "#B8894A",
  },
  metaHot: {
    color: theme.roseDeep,
  },
  chevron: {
    color: "#B07888",
    fontSize: 24,
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
  emptyMark: {
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
    maxWidth: 400,
    textAlign: "center",
  },
  primary: {
    alignItems: "center",
    backgroundColor: theme.rose,
    borderRadius: 16,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "800",
  },
});
