import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { ChoiceRow } from "@/components/ChoiceSheet";
import { DistanceSlider } from "@/components/DistanceSlider";
import { ActionBang, SurfaceBang } from "@/components/ReportBugButton";
import { surfaceHref } from "@/lib/surfaces";
import { Screen, Toast } from "@/components/Screen";
import { ApiError, api } from "@/lib/api";
import { useCommitSave } from "@/lib/autosave";
import { parseMaxDistanceMiles } from "@/lib/distance";
import { emptyCatalogs, useSession } from "@/lib/session";
import { theme } from "@/lib/theme";

type FilterValues = {
  immediate_intent: string[];
  relational_openness: string[];
  show_genders: string[];
  show_smoking: string[];
  show_drinking: string[];
  show_drugs: string[];
  show_turn_ons: string[];
  max_distance_miles: number | null;
  distance_band?: string;
};

export default function FiltersScreen() {
  const router = useRouter();
  const { catalogs, sectionMarks } = useSession();
  const choices = catalogs ?? emptyCatalogs;
  const [values, setValues] = useState<FilterValues | null>(null);
  const [flash, setFlash] = useState<{ error?: string | null; notice?: string | null }>({});
  const [sliderHeld, setSliderHeld] = useState(false);
  const valuesRef = useRef<FilterValues | null>(null);

  function applyFilters(next: FilterValues) {
    valuesRef.current = next;
    setValues(next);
  }

  function patchFilters(patch: Partial<FilterValues>) {
    const current = valuesRef.current;
    if (!current) {
      return;
    }
    applyFilters({ ...current, ...patch });
  }

  const { commit, markSaved } = useCommitSave(
    () => valuesRef.current,
    async (next) => {
      try {
        const payload = await api.saveFilters(next);
        const saved = payload.values as FilterValues;
        const normalized: FilterValues = {
          ...saved,
          max_distance_miles:
            saved.max_distance_miles !== undefined
              ? parseMaxDistanceMiles(saved.max_distance_miles)
              : saved.distance_band
                ? parseMaxDistanceMiles(undefined, saved.distance_band)
                : next.max_distance_miles,
        };
        applyFilters(normalized);
        markSaved(normalized);
      } catch (cause) {
        setFlash({ error: cause instanceof ApiError ? cause.message : "Couldn't save." });
        throw cause;
      }
    },
  );

  useEffect(() => {
    void api
      .filters()
      .then((payload) => {
        const loaded = payload.values as FilterValues;
        const next = {
          ...loaded,
          max_distance_miles: parseMaxDistanceMiles(loaded.max_distance_miles, loaded.distance_band),
        };
        applyFilters(next);
        markSaved(next);
      })
      .catch((cause) => setFlash({ error: cause instanceof ApiError ? cause.message : "Filters failed." }));
  }, [markSaved]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        void commit();
      };
    }, [commit]),
  );

  if (!values) {
    return (
      <Screen>
        <Toast error={flash.error} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topbar}>
        <ActionBang href={surfaceHref("settings", "close")} label="Close settings">
          <Pressable accessibilityLabel="Close settings" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backMark}>‹</Text>
          </Pressable>
        </ActionBang>
        <Text style={styles.topTitle}>Settings</Text>
        <SurfaceBang href={surfaceHref("settings")} label="Settings" />
      </View>
      <ScrollView
        contentContainerStyle={styles.sheet}
        nestedScrollEnabled={false}
        scrollEnabled={!sliderHeld}
      >
        <Text style={styles.eyebrow}>LOOKING FOR</Text>
        <Text style={styles.title}>Show people who fit what you want.</Text>
        <Text style={styles.lede}>
          These are eligibility preferences, not algorithm-weight controls. Changes save when you leave a field.
        </Text>
        <Toast error={flash.error} notice={flash.notice} />
        <ChoiceRow
          group="preference"
          mark={sectionMarks.preference}
          title="Show me"
          empty="Everyone"
          help="Always private. Leave all unchecked to see everyone."
          options={choices.preference}
          selected={values.show_genders}
          onChange={(show_genders) => patchFilters({ show_genders })}
          onCommit={() => void commit()}
        />
        <DistanceSlider
          mark={sectionMarks.distance || "📍"}
          value={values.max_distance_miles}
          onChange={(max_distance_miles) => patchFilters({ max_distance_miles })}
          onCommit={() => void commit()}
          onSlidingChange={setSliderHeld}
        />
        <ChoiceRow
          group="looking"
          mark={sectionMarks.looking}
          title="Right now"
          empty="Everyone"
          options={choices.looking}
          selected={values.immediate_intent}
          onChange={(immediate_intent) => patchFilters({ immediate_intent })}
          onCommit={() => void commit()}
        />
        <ChoiceRow
          group="looking"
          mark={sectionMarks.looking}
          title="Open to"
          empty="Everyone"
          options={choices.openness}
          selected={values.relational_openness}
          onChange={(relational_openness) => patchFilters({ relational_openness })}
          onCommit={() => void commit()}
        />
        <ChoiceRow
          group="smoking"
          mark={sectionMarks.smoking}
          title="Smoking"
          empty="Everyone"
          options={choices.smoking}
          selected={values.show_smoking}
          onChange={(show_smoking) => patchFilters({ show_smoking })}
          onCommit={() => void commit()}
        />
        <ChoiceRow
          group="drinking"
          mark={sectionMarks.drinking}
          title="Drinking"
          empty="Everyone"
          options={choices.drinking}
          selected={values.show_drinking}
          onChange={(show_drinking) => patchFilters({ show_drinking })}
          onCommit={() => void commit()}
        />
        <ChoiceRow
          group="drugs"
          mark={sectionMarks.drugs}
          title="Drugs"
          empty="Everyone"
          options={choices.drugs}
          selected={values.show_drugs}
          onChange={(show_drugs) => patchFilters({ show_drugs })}
          onCommit={() => void commit()}
        />
        <ChoiceRow
          group="turn_ons"
          mark={sectionMarks.turn_ons}
          title="Turn ons"
          empty="Everyone"
          options={choices.turn_ons}
          selected={values.show_turn_ons}
          onChange={(show_turn_ons) => patchFilters({ show_turn_ons })}
          onCommit={() => void commit()}
        />
        <View style={styles.note}>
          <Text style={styles.noteTitle}>Ranking weights stay fixed</Text>
          <Text style={styles.lede}>Filters only change who is eligible, not how the remaining cards are scored.</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: 14,
    fontWeight: "800",
  },
  spacer: {
    width: 38,
  },
  sheet: {
    gap: 12,
    paddingBottom: 40,
    paddingTop: 8,
  },
  eyebrow: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    color: theme.ink,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
  },
  lede: {
    color: theme.mute,
    fontSize: 13,
    lineHeight: 19,
  },
  note: {
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: "800",
  },
});
