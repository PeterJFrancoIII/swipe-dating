import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { ChoiceRow } from "@/components/ChoiceSheet";
import { DistanceSlider } from "@/components/DistanceSlider";
import { Screen, Toast } from "@/components/Screen";
import { ApiError, api } from "@/lib/api";
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

  useEffect(() => {
    void api
      .filters()
      .then((payload) => {
        const values = payload.values as FilterValues;
        setValues({
          ...values,
          max_distance_miles: parseMaxDistanceMiles(values.max_distance_miles, values.distance_band),
        });
      })
      .catch((cause) => setFlash({ error: cause instanceof ApiError ? cause.message : "Filters failed." }));
  }, []);

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
        <Pressable accessibilityLabel="Close settings" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backMark}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>Settings</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.sheet}>
        <Text style={styles.eyebrow}>LOOKING FOR</Text>
        <Text style={styles.title}>Show people who fit what you want.</Text>
        <Text style={styles.lede}>These are eligibility preferences, not algorithm-weight controls.</Text>
        <Toast error={flash.error} notice={flash.notice} />
        <ChoiceRow
          group="preference"
          mark={sectionMarks.preference}
          title="Show me"
          empty="Everyone"
          help="Always private. Leave all unchecked to see everyone."
          options={choices.preference}
          selected={values.show_genders}
          onChange={(show_genders) => setValues({ ...values, show_genders })}
        />
        <DistanceSlider
          mark={sectionMarks.distance || "📍"}
          value={values.max_distance_miles}
          onChange={(max_distance_miles) => setValues({ ...values, max_distance_miles })}
        />
        <ChoiceRow
          group="looking"
          mark={sectionMarks.looking}
          title="Right now"
          empty="Everyone"
          options={choices.looking}
          selected={values.immediate_intent}
          onChange={(immediate_intent) => setValues({ ...values, immediate_intent })}
        />
        <ChoiceRow
          group="looking"
          mark={sectionMarks.looking}
          title="Open to"
          empty="Everyone"
          options={choices.openness}
          selected={values.relational_openness}
          onChange={(relational_openness) => setValues({ ...values, relational_openness })}
        />
        <ChoiceRow
          group="smoking"
          mark={sectionMarks.smoking}
          title="Smoking"
          empty="Everyone"
          options={choices.smoking}
          selected={values.show_smoking}
          onChange={(show_smoking) => setValues({ ...values, show_smoking })}
        />
        <ChoiceRow
          group="drinking"
          mark={sectionMarks.drinking}
          title="Drinking"
          empty="Everyone"
          options={choices.drinking}
          selected={values.show_drinking}
          onChange={(show_drinking) => setValues({ ...values, show_drinking })}
        />
        <ChoiceRow
          group="drugs"
          mark={sectionMarks.drugs}
          title="Drugs"
          empty="Everyone"
          options={choices.drugs}
          selected={values.show_drugs}
          onChange={(show_drugs) => setValues({ ...values, show_drugs })}
        />
        <ChoiceRow
          group="turn_ons"
          mark={sectionMarks.turn_ons}
          title="Turn ons"
          empty="Everyone"
          options={choices.turn_ons}
          selected={values.show_turn_ons}
          onChange={(show_turn_ons) => setValues({ ...values, show_turn_ons })}
        />
        <View style={styles.note}>
          <Text style={styles.noteTitle}>Ranking weights stay fixed</Text>
          <Text style={styles.lede}>Filters only change who is eligible, not how the remaining cards are scored.</Text>
        </View>
        <Pressable
          onPress={async () => {
            try {
              const payload = await api.saveFilters(values);
              const saved = payload.values as FilterValues;
              setValues({
                ...saved,
                max_distance_miles:
                  saved.max_distance_miles !== undefined
                    ? parseMaxDistanceMiles(saved.max_distance_miles)
                    : saved.distance_band
                      ? parseMaxDistanceMiles(undefined, saved.distance_band)
                      : values.max_distance_miles,
              });
              setFlash({ notice: String(payload.notice ?? "Filters updated. Ranking weights remain fixed.") });
            } catch (cause) {
              setFlash({ error: cause instanceof ApiError ? cause.message : "Save failed." });
            }
          }}
          style={styles.primary}
        >
          <Text style={styles.primaryLabel}>Save settings</Text>
        </Pressable>
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
  primary: {
    alignItems: "center",
    backgroundColor: theme.rose,
    borderRadius: 16,
    minHeight: 48,
    justifyContent: "center",
  },
  primaryLabel: {
    color: "#fff",
    fontWeight: "800",
  },
});
