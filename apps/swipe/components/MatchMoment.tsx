import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { AuthPhoto } from "@/components/AuthPhoto";
import { ActionBang, ReportFab } from "@/components/ReportBugButton";
import { surfaceHref } from "@/lib/surfaces";
import { theme } from "@/lib/theme";
import type { MatchedWith } from "@/lib/types";

export function MatchMoment({
  match,
  onChat,
  onKeepSwiping,
}: {
  match: MatchedWith | null;
  onChat: () => void;
  onKeepSwiping: () => void;
}) {
  if (!match) {
    return null;
  }
  return (
    <Modal animationType="fade" transparent visible>
      <View style={styles.veil}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>IT'S A MATCH</Text>
          <Text style={styles.title}>You both chose each other.</Text>
          <AuthPhoto fallback={match.display_name[0]} path={match.photo_url} style={styles.photo} />
          <Text style={styles.name}>
            {match.display_name} <Text style={styles.age}>{match.age_band}</Text>
          </Text>
          <Text style={styles.copy}>
            {match.getfkd
              ? "This Get Fk'd match and chat disappear when either of you leaves the mode. Get a number if you want to stay in touch."
              : "No automatic message was sent. Say hi if you want to."}
          </Text>
          <ActionBang href={surfaceHref("match", "say-hi")} label="Say hi">
            <Pressable onPress={onChat} style={styles.primary}>
              <Text style={styles.primaryLabel}>Say hi</Text>
            </Pressable>
          </ActionBang>
          <ActionBang href={surfaceHref("match", "keep-swiping")} label="Keep swiping">
            <Pressable onPress={onKeepSwiping} style={styles.secondary}>
              <Text style={styles.secondaryLabel}>Keep swiping</Text>
            </Pressable>
          </ActionBang>
        </View>
        <ReportFab />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  veil: {
    alignItems: "center",
    backgroundColor: "rgba(58,21,40,0.72)",
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },
  card: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 28,
    borderWidth: 1,
    gap: 10,
    maxWidth: 420,
    padding: 22,
    width: "100%",
  },
  eyebrow: {
    color: theme.roseDeep,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  title: {
    color: theme.ink,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  photo: {
    borderColor: theme.rose,
    borderRadius: 64,
    borderWidth: 3,
    height: 128,
    marginVertical: 8,
    width: 128,
  },
  name: {
    color: theme.ink,
    fontSize: 22,
    fontWeight: "800",
  },
  age: {
    color: theme.mute,
    fontWeight: "600",
  },
  copy: {
    color: theme.mute,
    fontSize: 14,
    textAlign: "center",
  },
  primary: {
    alignItems: "center",
    backgroundColor: theme.rose,
    borderRadius: 16,
    minHeight: 48,
    justifyContent: "center",
    marginTop: 6,
    width: "100%",
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "800",
  },
  secondary: {
    alignItems: "center",
    minHeight: 40,
    justifyContent: "center",
    width: "100%",
  },
  secondaryLabel: {
    color: theme.roseDeep,
    fontWeight: "800",
  },
});
