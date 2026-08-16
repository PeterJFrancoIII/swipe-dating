import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";

import { AuthPhoto } from "@/components/AuthPhoto";
import { GetFkdModeButton } from "@/components/GetFkdModeButton";
import { useSession } from "@/lib/session";
import { theme } from "@/lib/theme";

export function TopChrome() {
  const router = useRouter();
  const pathname = usePathname();
  const { displayName, selfPhotoUrl } = useSession();
  const you = (displayName || "You").trim().split(/\s+/)[0] || "You";
  const youMark = you[0]?.toUpperCase() ?? "Y";
  const onMatches = pathname === "/matches" || pathname.startsWith("/matches/");

  return (
    <View style={styles.wrap}>
      <View style={styles.toolbar}>
        <View style={styles.side}>
          <Pressable
            accessibilityLabel="Profile settings"
            accessibilityHint="Edit your photo, profile, and compatibility quiz"
            onPress={() => router.push("/profile")}
            style={styles.youButton}
          >
            <AuthPhoto fallback={youMark} path={selfPhotoUrl} style={styles.youFace} />
          </Pressable>
        </View>
        <View style={styles.wordmark}>
          <GetFkdModeButton size={46} />
        </View>
        <View style={styles.sideEnd}>
          <Pressable accessibilityLabel="Settings" onPress={() => router.push("/filters")} style={styles.icon}>
            <Text style={styles.gear}>⚙</Text>
          </Pressable>
        </View>
      </View>
      <View accessibilityRole="tablist" style={styles.tabs}>
        <Pressable
          accessibilityLabel="Swipe"
          accessibilityRole="tab"
          accessibilityState={{ selected: !onMatches }}
          onPress={() => router.replace("/")}
          style={[styles.tab, !onMatches && styles.tabOn]}
        >
          <Text style={[styles.tabLabel, !onMatches && styles.tabLabelOn]}>♡  Swipe</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Matches"
          accessibilityRole="tab"
          accessibilityState={{ selected: onMatches }}
          onPress={() => router.replace("/matches")}
          style={[styles.tab, onMatches && styles.tabOn]}
        >
          <Text style={[styles.tabLabel, onMatches && styles.tabLabelOn]}>◉  Matches</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 8,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  toolbar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  side: {
    flex: 1,
  },
  sideEnd: {
    alignItems: "flex-end",
    flex: 1,
  },
  youButton: {
    alignSelf: "flex-start",
  },
  youFace: {
    backgroundColor: theme.rose,
    borderColor: "#F5B8C8",
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    width: 36,
  },
  wordmark: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 14,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  gear: {
    color: theme.ink,
    fontSize: 20,
    lineHeight: 22,
  },
  tabs: {
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    padding: 4,
  },
  tab: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
  },
  tabOn: {
    backgroundColor: "#FFE4EE",
  },
  tabLabel: {
    color: theme.navIdle,
    fontSize: 14,
    fontWeight: "700",
  },
  tabLabelOn: {
    color: theme.roseDeep,
  },
});
