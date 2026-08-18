import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { SurfaceBang } from "@/components/ReportBugButton";
import { Screen, Toast } from "@/components/Screen";
import { surfaceHref } from "@/lib/surfaces";
import { ApiError, api } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { AlignmentQuestion } from "@/lib/types";
import { theme } from "@/lib/theme";

export default function CompatibilityQuizScreen() {
  const router = useRouter();
  const { setAlignmentProgress } = useSession();
  const [questions, setQuestions] = useState<AlignmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<{ error?: string | null; notice?: string | null }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void api
      .alignment()
      .then((payload) => {
        setQuestions(payload.questions);
        setAnswers(payload.answers);
        const firstOpen = payload.questions.findIndex((question) => !payload.answers[question.id]);
        setIndex(firstOpen >= 0 ? firstOpen : 0);
        setAlignmentProgress(payload.answered ?? Object.keys(payload.answers).length, payload.total ?? payload.questions.length);
      })
      .catch((cause) => {
        setFlash({ error: cause instanceof ApiError ? cause.message : "Quiz failed to load." });
      });
  }, [setAlignmentProgress]);

  const question = questions[index];
  const answered = useMemo(
    () => questions.filter((item) => Boolean(answers[item.id])).length,
    [answers, questions],
  );

  async function choose(answerId: string) {
    if (!question || saving) {
      return;
    }
    const next = { ...answers, [question.id]: answerId };
    setAnswers(next);
    setSaving(true);
    try {
      const saved = await api.saveAlignment(next);
      setAnswers(saved.answers);
      setAlignmentProgress(saved.answered ?? Object.keys(saved.answers).length, saved.total ?? questions.length);
      if (index + 1 < questions.length) {
        setIndex(index + 1);
      } else {
        setFlash({ notice: "Compatibility quiz saved." });
      }
    } catch (cause) {
      setFlash({ error: cause instanceof ApiError ? cause.message : "Could not save that answer." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable accessibilityLabel="Close quiz" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backMark}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>Compatibility quiz</Text>
        <SurfaceBang href={surfaceHref("quiz")} label="Compatibility quiz" />
      </View>
      <Toast error={flash.error} notice={flash.notice} />
      {question ? (
        <View style={styles.body}>
          <Text style={styles.eyebrow}>QUESTION {index + 1} OF {questions.length}</Text>
          <Text style={styles.progress}>
            {answered}/{questions.length} answered · Skip counts, and it does not lower your match
          </Text>
          <Text style={styles.prompt}>{question.prompt}</Text>
          <View style={styles.options}>
            {question.answers.map((option) => {
              const selected = answers[question.id] === option.id;
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={saving}
                  onPress={() => void choose(option.id)}
                  style={[styles.option, selected && styles.optionOn]}
                >
                  <Text style={[styles.optionLabel, selected && styles.optionLabelOn]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.nav}>
            <Pressable
              disabled={index === 0}
              onPress={() => setIndex((current) => Math.max(0, current - 1))}
              style={[styles.navButton, index === 0 && styles.navDisabled]}
            >
              <Text style={styles.navLabel}>Back</Text>
            </Pressable>
            <Pressable
              disabled={saving}
              onPress={() => void choose("skip")}
              style={styles.navButton}
            >
              <Text style={styles.navLabel}>Skip</Text>
            </Pressable>
          </View>
          {index + 1 >= questions.length ? (
            <Pressable onPress={() => router.back()} style={styles.done}>
              <Text style={styles.doneLabel}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <Text style={styles.loading}>Loading questions…</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
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
    color: theme.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  spacer: {
    width: 38,
  },
  body: {
    flex: 1,
    paddingTop: 12,
  },
  eyebrow: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  progress: {
    color: theme.muteDeep,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  prompt: {
    color: theme.ink,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 34,
    marginTop: 16,
  },
  options: {
    gap: 10,
    marginTop: 24,
  },
  option: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  optionOn: {
    backgroundColor: "#FFE4EE",
    borderColor: theme.rose,
  },
  optionLabel: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  optionLabelOn: {
    color: theme.roseDeep,
  },
  nav: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },
  navButton: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  navDisabled: {
    opacity: 0.4,
  },
  navLabel: {
    color: theme.ink,
    fontWeight: "800",
  },
  done: {
    alignItems: "center",
    backgroundColor: theme.rose,
    borderRadius: 16,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 48,
  },
  doneLabel: {
    color: "#fff",
    fontWeight: "800",
  },
  loading: {
    color: theme.mute,
    marginTop: 24,
  },
});
