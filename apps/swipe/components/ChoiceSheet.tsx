import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ActionBang, ReportFab, SurfaceBang } from "@/components/ReportBugButton";
import { surfaceHref } from "@/lib/surfaces";
import type { Choice } from "@/lib/types";
import { theme, tones } from "@/lib/theme";

export function ChoiceRow({
  group,
  mark,
  title,
  empty,
  selected,
  options,
  onChange,
  required,
  needed,
  help,
  multiple = true,
  limit,
}: {
  group: string;
  mark?: string;
  title: string;
  empty: string;
  selected: string[];
  options: Choice[];
  onChange: (next: string[]) => void;
  required?: boolean;
  needed?: boolean;
  help?: string;
  multiple?: boolean;
  limit?: number;
}) {
  const [open, setOpen] = useState(false);
  const tone = tones[group] ?? tones.gender;
  const summary = useMemo(() => {
    const labels = options.filter((option) => selected.includes(option.id)).map((option) => `${option.icon} ${option.label}`.trim());
    return labels.length ? labels.join(", ") : empty;
  }, [empty, options, selected]);

  return (
    <View style={[styles.section, { backgroundColor: tone.fill, borderColor: needed ? "#F3A0B4" : tone.border }]}>
      <View style={styles.legendRow}>
        <Text style={[styles.legend, { color: needed ? theme.errorInk : tone.ink, flex: 1 }]}>
          {mark ? `${mark}  ` : ""}
          {title}
        </Text>
        <SurfaceBang href={surfaceHref(group, title)} label={title} />
      </View>
      {help ? <Text style={styles.help}>{help}</Text> : null}
      {needed ? <Text style={styles.needed}>Still needed to finish signup.</Text> : null}
      <ActionBang href={surfaceHref(group, title, "open")} label={`${title} picker`}>
        <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.picker}>
          <Text style={styles.summary}>{summary}</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </ActionBang>
      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.panel, { borderColor: tone.border }]} onPress={() => undefined}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {mark ? `${mark}  ` : ""}
                {title}
              </Text>
              <View style={styles.headerActions}>
                <ReportFab embedded href={surfaceHref(group, title)} label={title} />
                <Pressable accessibilityLabel="Close" onPress={() => setOpen(false)} style={styles.close}>
                  <Text style={styles.closeMark}>×</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.body}>
              {help ? <Text style={styles.help}>{help}</Text> : null}
              <View style={styles.grid}>
                {options.map((option) => {
                  const on = selected.includes(option.id);
                  const capped = Boolean(limit && !on && selected.length >= limit);
                  return (
                    <ActionBang
                      key={option.id}
                      href={surfaceHref(group, title, option.id)}
                      label={`${title}: ${option.label}`}
                    >
                      <Pressable
                        disabled={capped}
                        onPress={() => {
                          if (!multiple) {
                            onChange([option.id]);
                            setOpen(false);
                            return;
                          }
                          if (on) {
                            onChange(selected.filter((id) => id !== option.id));
                            return;
                          }
                          const next = [...selected, option.id];
                          onChange(next);
                          if (limit && next.length >= limit) {
                            setOpen(false);
                          }
                        }}
                        style={[
                          styles.choice,
                          {
                            backgroundColor: on ? tone.checked : theme.paper,
                            borderColor: on ? tone.accent : theme.line,
                            opacity: capped ? 0.38 : 1,
                          },
                        ]}
                      >
                        <Text style={[styles.choiceText, { color: on ? tone.ink : theme.mute }]}>
                          {option.icon} {option.label}
                        </Text>
                      </Pressable>
                    </ActionBang>
                  );
                })}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 20,
    borderWidth: 1,
    paddingBottom: 8,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  legendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  legend: {
    fontSize: 14,
    fontWeight: "800",
  },
  help: {
    color: theme.mute,
    fontSize: 11,
    marginBottom: 10,
  },
  needed: {
    color: theme.errorInk,
    fontSize: 13,
    marginBottom: 10,
  },
  picker: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summary: {
    color: theme.muteDeep,
    flex: 1,
    fontSize: 13,
  },
  chevron: {
    color: theme.navIdle,
    fontSize: 22,
  },
  backdrop: {
    backgroundColor: theme.overlay,
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  panel: {
    backgroundColor: theme.paper,
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    borderBottomColor: theme.lineStrong,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 18,
    paddingRight: 12,
    paddingVertical: 10,
  },
  headerTitle: {
    color: theme.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  close: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  closeMark: {
    color: theme.ink,
    fontSize: 28,
    lineHeight: 28,
  },
  body: {
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choice: {
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 48,
    minWidth: "47%",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  choiceText: {
    fontSize: 11,
  },
});
