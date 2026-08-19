import { StyleSheet, Text, View } from "react-native";

import type { PhotoUploadSnapshot } from "@/lib/uploadProgress";
import { theme } from "@/lib/theme";

export function PhotoUploadMeter({ progress }: { progress: PhotoUploadSnapshot }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.wrap} accessibilityRole="progressbar">
      <View style={styles.row}>
        <Text style={styles.percent}>{progress.percent}%</Text>
        <Text style={styles.remaining}>{progress.remainingLabel}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress.percent}%` }]} />
      </View>
      <Text style={styles.label}>{progress.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    padding: 14,
  },
  row: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  percent: {
    color: theme.roseDeep,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -1,
  },
  remaining: {
    color: theme.ink,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    paddingLeft: 12,
    textAlign: "right",
  },
  track: {
    backgroundColor: theme.blush,
    borderRadius: 99,
    height: 10,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: theme.rose,
    borderRadius: 99,
    height: 10,
  },
  label: {
    color: theme.mute,
    fontSize: 13,
    fontWeight: "700",
  },
});
