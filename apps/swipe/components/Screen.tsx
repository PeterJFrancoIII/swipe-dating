import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { theme } from "@/lib/theme";

export function Screen({
  children,
  footer = true,
  padded = true,
  edges = ["top", "left", "right", "bottom"],
}: {
  children: ReactNode;
  footer?: boolean;
  padded?: boolean;
  edges?: readonly Edge[];
}) {
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.main, padded ? styles.padded : null]}>{children}</View>
      {footer ? (
        <Text style={styles.footer}>
          Adults 18+ · Block and report stay free · No exact location
        </Text>
      ) : null}
    </SafeAreaView>
  );
}

export function Toast({ error, notice }: { error?: string | null; notice?: string | null }) {
  if (error) {
    return (
      <View style={[styles.toast, styles.error]} accessibilityRole="alert">
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  if (notice) {
    return (
      <View style={[styles.toast, styles.success]} accessibilityRole="text">
        <Text style={styles.successText}>{notice}</Text>
      </View>
    );
  }
  return null;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: theme.bg,
    flex: 1,
  },
  main: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
    maxWidth: 680,
    minHeight: 0,
  },
  padded: {
    paddingHorizontal: 16,
  },
  footer: {
    color: theme.navIdle,
    fontSize: 10,
    paddingBottom: 8,
    paddingHorizontal: 18,
    textAlign: "center",
  },
  toast: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 13,
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  error: {
    backgroundColor: theme.errorBg,
    borderColor: "#F3A0B4",
  },
  success: {
    backgroundColor: theme.successBg,
    borderColor: "#7BC9A3",
  },
  errorText: {
    color: theme.errorInk,
    fontSize: 13,
    lineHeight: 18,
  },
  successText: {
    color: theme.successInk,
    fontSize: 13,
    lineHeight: 18,
  },
  eyebrow: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 7,
  },
});
