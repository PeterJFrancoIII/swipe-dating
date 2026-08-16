import * as ImagePicker from "expo-image-picker";
import { usePathname } from "expo-router";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError, api } from "@/lib/api";
import { diagnosticContext, screenName } from "@/lib/diagnostics";
import { theme } from "@/lib/theme";

type Step = "closed" | "choose" | "idea";

type ReportApi = {
  open: (step?: "choose" | "idea", popup?: boolean) => void;
};

const ReportContext = createContext<ReportApi | null>(null);

export function useReport(): ReportApi {
  const value = useContext(ReportContext);
  if (!value) {
    throw new Error("useReport requires ReportProvider");
  }
  return value;
}

export function ReportProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [step, setStep] = useState<Step>("closed");
  const [fromPopup, setFromPopup] = useState(false);
  const [idea, setIdea] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  function open(next: "choose" | "idea" = "choose", popup = false) {
    setFromPopup(popup);
    setFlash(null);
    setIdea("");
    setStep(next);
  }

  function contextTags(): string[] {
    return fromPopup ? ["popup"] : [];
  }

  async function sendBug() {
    setFlash(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFlash("Allow Photos, then tap Bug.");
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (picked.canceled || !picked.assets[0]) {
      return;
    }
    const asset = picked.assets[0];
    setBusy(true);
    try {
      const route = pathname || "/";
      const matchId = route.includes("/matches/") ? decodeURIComponent(route.split("/matches/")[1] || "") : undefined;
      await api.reportInAppError({
        uri: asset.uri,
        name: asset.fileName || "screenshot.jpg",
        type: asset.mimeType || "image/jpeg",
        explanation: "",
        context: diagnosticContext(route, screenName(route), matchId),
        tags: ["bug", ...contextTags()],
      });
      setStep("closed");
      showToast("Sent.");
    } catch (cause) {
      setFlash(cause instanceof ApiError ? cause.message : "Didn't send. Tap Bug again.");
    } finally {
      setBusy(false);
    }
  }

  async function sendIdea() {
    const text = idea.trim();
    if (!text) {
      setFlash("Type the idea.");
      return;
    }
    setBusy(true);
    try {
      await api.sendFeedback(text, ["feedback", "feature", ...contextTags()]);
      setIdea("");
      setStep("closed");
      showToast("Sent.");
    } catch (cause) {
      setFlash(cause instanceof ApiError ? cause.message : "Didn't send. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ReportContext.Provider value={{ open }}>
      {children}
      <Modal animationType="fade" transparent visible={step !== "closed"} onRequestClose={() => setStep("closed")}>
        <Pressable style={styles.overlay} onPress={() => (busy ? undefined : setStep("closed"))}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            {step === "choose" ? (
              <>
                <Text style={styles.title}>Bug or idea?</Text>
                <View style={styles.row}>
                  <Pressable disabled={busy} onPress={() => void sendBug()} style={[styles.pick, styles.bug]}>
                    <Text style={styles.pickLabel}>{busy ? "…" : "Bug"}</Text>
                    <Text style={styles.pickHelp}>It's broken</Text>
                  </Pressable>
                  <Pressable disabled={busy} onPress={() => setStep("idea")} style={[styles.pick, styles.idea]}>
                    <Text style={styles.pickLabel}>Idea</Text>
                    <Text style={styles.pickHelp}>A feature I want</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>Idea</Text>
                <TextInput
                  autoFocus
                  multiline
                  onChangeText={setIdea}
                  onSubmitEditing={() => void sendIdea()}
                  placeholder="One sentence."
                  placeholderTextColor={theme.mute}
                  returnKeyType="send"
                  style={styles.input}
                  value={idea}
                />
                <Pressable disabled={busy} onPress={() => void sendIdea()} style={styles.send}>
                  <Text style={styles.sendLabel}>{busy ? "…" : "Send"}</Text>
                </Pressable>
              </>
            )}
            {flash ? <Text style={styles.error}>{flash}</Text> : null}
          </Pressable>
        </Pressable>
      </Modal>
      {toast ? (
        <View pointerEvents="none" style={styles.toast}>
          <Text style={styles.toastLabel}>{toast}</Text>
        </View>
      ) : null}
    </ReportContext.Provider>
  );
}

export function ReportFab({ embedded = false }: { embedded?: boolean }) {
  const report = useContext(ReportContext);
  const insets = useSafeAreaInsets();
  if (!report) {
    return null;
  }
  return (
    <Pressable
      accessibilityLabel="Bug or idea"
      onPress={() => report.open("choose", embedded)}
      style={
        embedded
          ? styles.embedded
          : [styles.fab, { bottom: Math.max(insets.bottom, 12) + 8, left: 12 }]
      }
    >
      <Text style={styles.fabMark}>!</Text>
    </Pressable>
  );
}

export function ReportBugButton() {
  return <ReportFab />;
}

export function FeedbackButton() {
  const report = useContext(ReportContext);
  if (!report) {
    return null;
  }
  return (
    <Pressable onPress={() => report.open("choose")} style={styles.settings}>
      <Text style={styles.settingsTitle}>Bug or idea</Text>
      <Text style={styles.settingsHelp}>Tap once. Then tap Bug or Idea.</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    alignItems: "center",
    backgroundColor: theme.ink,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    width: 44,
    zIndex: 40,
  },
  embedded: {
    alignItems: "center",
    backgroundColor: theme.ink,
    borderRadius: 16,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  fabMark: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  overlay: {
    backgroundColor: theme.overlay,
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: theme.paper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
    padding: 18,
  },
  title: {
    color: theme.ink,
    fontSize: 22,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  pick: {
    borderRadius: 18,
    flex: 1,
    minHeight: 88,
    justifyContent: "center",
    padding: 14,
  },
  bug: {
    backgroundColor: theme.errorBg,
  },
  idea: {
    backgroundColor: theme.successBg,
  },
  pickLabel: {
    color: theme.ink,
    fontSize: 22,
    fontWeight: "900",
  },
  pickHelp: {
    color: theme.mute,
    fontSize: 13,
    marginTop: 4,
  },
  input: {
    borderColor: theme.line,
    borderRadius: 14,
    borderWidth: 1,
    color: theme.ink,
    fontSize: 16,
    minHeight: 72,
    padding: 12,
    textAlignVertical: "top",
  },
  send: {
    alignItems: "center",
    backgroundColor: theme.rose,
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 48,
  },
  sendLabel: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
  },
  error: {
    color: theme.errorInk,
    fontSize: 13,
  },
  toast: {
    alignSelf: "center",
    backgroundColor: theme.ink,
    borderRadius: 999,
    bottom: 88,
    paddingHorizontal: 16,
    paddingVertical: 10,
    position: "absolute",
  },
  toastLabel: {
    color: "#fff",
    fontWeight: "800",
  },
  settings: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    padding: 16,
  },
  settingsTitle: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: "800",
  },
  settingsHelp: {
    color: theme.mute,
    fontSize: 12,
  },
});
