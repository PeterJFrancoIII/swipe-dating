import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { GetFkdLogo } from "@/components/GetFkdLogo";
import { ActionBang, ReportFab } from "@/components/ReportBugButton";
import { surfaceHref } from "@/lib/surfaces";
import {
  GETFKD_ENTER_BODY,
  GETFKD_ENTER_TITLE,
  GETFKD_EXIT_BODY,
  GETFKD_EXIT_TITLE,
  GETFKD_HIDE_EXIT_KEY,
  shouldPromptGetFkdExit,
} from "@/lib/getfkdMode";
import { useSession } from "@/lib/session";
import { theme } from "@/lib/theme";

function Droplet({ active, delay, left }: { active: boolean; delay: number; left: number }) {
  const fall = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      fall.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(fall, { toValue: 1, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(fall, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, delay, fall]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.drop,
        {
          left,
          opacity: fall.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.9, 0] }),
          transform: [
            { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [8, 36] }) },
            { scaleY: fall.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) },
          ],
        },
      ]}
    />
  );
}

export function GetFkdModeButton({ size = 46 }: { size?: number }) {
  const { getFkdEnabled, setGetFkdEnabled, setError, setNotice } = useSession();
  const [prompt, setPrompt] = useState<"enter" | "exit" | null>(null);
  const [hideExit, setHideExit] = useState(false);
  const [busy, setBusy] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void AsyncStorage.getItem(GETFKD_HIDE_EXIT_KEY).then((value) => setHideExit(value === "1"));
  }, []);

  useEffect(() => {
    if (!getFkdEnabled) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [getFkdEnabled, pulse]);

  async function apply(enabled: boolean) {
    setBusy(true);
    try {
      const result = await setGetFkdEnabled(enabled);
      setNotice(result.notice ?? null);
      setError(null);
      setPrompt(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Get Fk'd mode failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onPress() {
    if (busy) {
      return;
    }
    if (!getFkdEnabled) {
      setPrompt("enter");
      return;
    }
    if (shouldPromptGetFkdExit(hideExit)) {
      setPrompt("exit");
      return;
    }
    await apply(false);
  }

  async function confirmExit(remember: boolean) {
    if (remember) {
      await AsyncStorage.setItem(GETFKD_HIDE_EXIT_KEY, "1");
      setHideExit(true);
    }
    await apply(false);
  }

  return (
    <>
      <Pressable
        accessibilityLabel={getFkdEnabled ? "Leave Get Fk'd mode" : "Enter Get Fk'd mode"}
        accessibilityRole="button"
        accessibilityState={{ selected: getFkdEnabled, busy }}
        hitSlop={8}
        onPress={() => void onPress()}
        style={styles.hit}
      >
        <Animated.View
          style={[
            styles.glow,
            getFkdEnabled
              ? { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }
              : null,
          ]}
        >
          {getFkdEnabled ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.halo,
                {
                  height: size + 20,
                  opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.95] }),
                  width: size + 20,
                },
              ]}
            />
          ) : null}
          <GetFkdLogo size={size} />
          {getFkdEnabled ? (
            <>
              <Droplet active delay={0} left={size * 0.22} />
              <Droplet active delay={220} left={size * 0.48} />
              <Droplet active delay={460} left={size * 0.7} />
            </>
          ) : null}
        </Animated.View>
      </Pressable>
      <Modal animationType="fade" transparent visible={prompt !== null} onRequestClose={() => setPrompt(null)}>
        <View style={styles.veil}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>{prompt === "exit" ? "LEAVE MODE" : "GET FK'D MODE"}</Text>
            <Text style={styles.title}>{prompt === "exit" ? GETFKD_EXIT_TITLE : GETFKD_ENTER_TITLE}</Text>
            <Text style={styles.copy}>{prompt === "exit" ? GETFKD_EXIT_BODY : GETFKD_ENTER_BODY}</Text>
            {prompt === "enter" ? (
              <>
                <ActionBang href={surfaceHref("getfkd", "enter")} label="Enter Get Fk'd mode">
                  <Pressable disabled={busy} onPress={() => void apply(true)} style={styles.primary}>
                    <Text style={styles.primaryLabel}>{busy ? "Turning on…" : "Enter Get Fk'd mode"}</Text>
                  </Pressable>
                </ActionBang>
                <ActionBang href={surfaceHref("getfkd", "not-now")} label="Not now">
                  <Pressable disabled={busy} onPress={() => setPrompt(null)} style={styles.secondary}>
                    <Text style={styles.secondaryLabel}>Not now</Text>
                  </Pressable>
                </ActionBang>
              </>
            ) : (
              <>
                <ActionBang href={surfaceHref("getfkd", "leave")} label="Leave Get Fk'd mode">
                  <Pressable disabled={busy} onPress={() => void apply(false)} style={styles.primary}>
                    <Text style={styles.primaryLabel}>{busy ? "Leaving…" : "Leave and drop those matches"}</Text>
                  </Pressable>
                </ActionBang>
                <ActionBang href={surfaceHref("getfkd", "leave-silent")} label="Leave and don't show this again">
                  <Pressable disabled={busy} onPress={() => void confirmExit(true)} style={styles.secondary}>
                    <Text style={styles.secondaryLabel}>Leave and don't show this again</Text>
                  </Pressable>
                </ActionBang>
                <ActionBang href={surfaceHref("getfkd", "stay")} label="Stay in mode">
                  <Pressable disabled={busy} onPress={() => setPrompt(null)} style={styles.secondary}>
                    <Text style={styles.stayLabel}>Stay in mode</Text>
                  </Pressable>
                </ActionBang>
              </>
            )}
          </View>
          <ReportFab />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hit: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    minWidth: 48,
  },
  glow: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    backgroundColor: "rgba(255, 92, 140, 0.55)",
    borderRadius: 999,
    position: "absolute",
  },
  drop: {
    backgroundColor: "rgba(120, 190, 255, 0.92)",
    borderRadius: 5,
    height: 10,
    position: "absolute",
    top: 28,
    width: 5,
  },
  veil: {
    alignItems: "center",
    backgroundColor: "rgba(58,21,40,0.72)",
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },
  card: {
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
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  copy: {
    color: theme.mute,
    fontSize: 15,
    lineHeight: 21,
  },
  primary: {
    alignItems: "center",
    backgroundColor: theme.rose,
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 48,
    marginTop: 6,
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "800",
  },
  secondary: {
    alignItems: "center",
    minHeight: 40,
    justifyContent: "center",
  },
  secondaryLabel: {
    color: theme.roseDeep,
    fontWeight: "800",
    textAlign: "center",
  },
  stayLabel: {
    color: theme.mute,
    fontWeight: "700",
  },
});
