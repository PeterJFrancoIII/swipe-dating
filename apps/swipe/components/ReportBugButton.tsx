import * as ImagePicker from "expo-image-picker";
import { usePathname } from "expo-router";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError, api } from "@/lib/api";
import { diagnosticContext, screenName } from "@/lib/diagnostics";
import { SECURITY_HOLD_NOTICE } from "@/lib/securityFilter";
import { surfaceFromRoute, surfaceTag, withSurfaceLine, type SurfaceRef } from "@/lib/surfaces";
import { theme } from "@/lib/theme";

type Step = "closed" | "choose" | "idea";

type ReportApi = {
  open: (step?: "choose" | "idea", surface?: SurfaceRef) => void;
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
  const [surface, setSurface] = useState<SurfaceRef>(() => surfaceFromRoute(pathname || "/"));
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
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  function open(next: "choose" | "idea" = "choose", nextSurface?: SurfaceRef) {
    setSurface(nextSurface ?? surfaceFromRoute(pathname || "/", screenName(pathname || "/")));
    setFlash(null);
    setIdea("");
    setStep(next);
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
      const result = await api.reportInAppError({
        uri: asset.uri,
        name: asset.fileName || "screenshot.jpg",
        type: asset.mimeType || "image/jpeg",
        explanation: withSurfaceLine(surface.href),
        context: {
          ...diagnosticContext(route, screenName(route), matchId),
          surface_href: surface.href,
          surface_label: surface.label,
          kind: "bug",
        },
        tags: ["bug", "kind:bug", surfaceTag(surface.href)],
      });
      setStep("closed");
      showToast(result.notice || "Sent.");
    } catch (cause) {
      setFlash(cause instanceof ApiError ? cause.message : "Didn't send. Tap Bug again.");
    } finally {
      setBusy(false);
    }
  }

  async function sendIdea() {
    const text = idea.trim();
    if (!text) {
      setFlash("Type the feature request.");
      return;
    }
    setBusy(true);
    try {
      const result = await api.sendFeedback(withSurfaceLine(surface.href, text), {
        tags: ["feedback", "feature", "kind:feature", surfaceTag(surface.href)],
        surface_href: surface.href,
        kind: "feature",
      });
      setIdea("");
      setStep("closed");
      showToast(result.notice || "Sent.");
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
                <Text style={styles.title}>Bug or Feature Request?</Text>
                <Text style={styles.surfaceLine} numberOfLines={2}>
                  {surface.label} · {surface.href}
                </Text>
                <View style={styles.row}>
                  <Pressable disabled={busy} onPress={() => void sendBug()} style={[styles.pick, styles.bug]}>
                    <Text style={styles.pickLabel}>{busy ? "…" : "Bug"}</Text>
                    <Text style={styles.pickHelp}>It's broken</Text>
                  </Pressable>
                  <Pressable disabled={busy} onPress={() => setStep("idea")} style={[styles.pick, styles.idea]}>
                    <Text style={styles.pickLabel}>Feature Request</Text>
                    <Text style={styles.pickHelp}>Something to add</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.title}>Feature Request</Text>
                <Text style={styles.surfaceLine} numberOfLines={2}>
                  {surface.label} · {surface.href}
                </Text>
                <TextInput
                  autoFocus
                  multiline
                  onChangeText={setIdea}
                  onSubmitEditing={() => void sendIdea()}
                  placeholder="What should this control do?"
                  placeholderTextColor={theme.mute}
                  returnKeyType="send"
                  style={styles.input}
                  value={idea}
                />
                <Pressable disabled={busy} onPress={() => void sendIdea()} style={styles.send}>
                  <Text style={styles.sendLabel}>{busy ? "…" : "Send"}</Text>
                </Pressable>
                <Text style={styles.fine}>{SECURITY_HOLD_NOTICE.replace("This was not added to the community queue.", "Security asks stay with admins.")}</Text>
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

export function SurfaceBang({
  href,
  label,
  size = "section",
}: {
  href: string;
  label: string;
  size?: "page" | "section" | "button";
}) {
  const report = useContext(ReportContext);
  if (!report) {
    return null;
  }
  return (
    <Pressable
      accessibilityLabel={`Report ${label}`}
      accessibilityHint="Opens Bug or Feature Request for this control"
      hitSlop={6}
      onPress={() => report.open("choose", { href, label })}
      style={size === "button" ? styles.bangTiny : size === "page" ? styles.fab : styles.embedded}
    >
      <Text style={size === "button" ? styles.bangTinyMark : styles.fabMark}>!</Text>
    </Pressable>
  );
}

export function ActionBang({
  href,
  label,
  children,
  style,
}: {
  href: string;
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.actionWrap, style]}>
      {children}
      <View pointerEvents="box-none" style={styles.actionBang}>
        <SurfaceBang href={href} label={label} size="button" />
      </View>
    </View>
  );
}

export function ReportFab({
  embedded = false,
  href,
  label,
}: {
  embedded?: boolean;
  href?: string;
  label?: string;
}) {
  const report = useContext(ReportContext);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  if (!report) {
    return null;
  }
  const surface = href && label ? { href, label } : surfaceFromRoute(pathname || "/", screenName(pathname || "/"));
  if (embedded) {
    return <SurfaceBang href={surface.href} label={surface.label} size="section" />;
  }
  return (
    <Pressable
      accessibilityLabel="Bug or Feature Request"
      onPress={() => report.open("choose", surface)}
      style={[styles.fab, { bottom: Math.max(insets.bottom, 12) + 8, left: 12 }]}
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
  const pathname = usePathname();
  if (!report) {
    return null;
  }
  const surface = surfaceFromRoute(pathname || "/", "Profile");
  return (
    <Pressable onPress={() => report.open("choose", surface)} style={styles.settings}>
      <Text style={styles.settingsTitle}>Bug or Feature Request</Text>
      <Text style={styles.settingsHelp}>Every ! mark sends that control's link with the report.</Text>
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
  bangTiny: {
    alignItems: "center",
    backgroundColor: theme.ink,
    borderRadius: 9,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  fabMark: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },
  bangTinyMark: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 12,
  },
  actionWrap: {
    position: "relative",
  },
  actionBang: {
    position: "absolute",
    right: -4,
    top: -6,
    zIndex: 20,
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
  surfaceLine: {
    color: theme.mute,
    fontSize: 12,
    fontWeight: "700",
  },
  fine: {
    color: theme.mute,
    fontSize: 11,
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
    fontSize: 18,
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
