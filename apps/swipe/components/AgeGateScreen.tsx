import { useEffect, useMemo, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GetFkdLogo } from "@/components/GetFkdLogo";
import { LegalLinks } from "@/components/LegalLinks";
import { ActionBang, SurfaceBang } from "@/components/ReportBugButton";
import { Screen, Toast } from "@/components/Screen";
import { surfaceHref } from "@/lib/surfaces";
import { appleAgeFailureCopy, type AppleAgeFailureReason } from "@/lib/appleAgeResult";
import { useSession } from "@/lib/session";
import { isInternalDogfoodBuild } from "@/lib/storeBuild";
import { theme } from "@/lib/theme";

const ROW = 48;

function Wheel({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const scroller = useRef<ScrollView>(null);
  const index = Math.max(0, values.indexOf(selected));

  useEffect(() => {
    scroller.current?.scrollTo({ x: 0, y: index * ROW, animated: false });
  }, [index]);

  function commit(offsetY: number) {
    const next = Math.round(offsetY / ROW);
    const value = values[Math.max(0, Math.min(values.length - 1, next))];
    if (value && value !== selected) {
      onSelect(value);
    }
  }

  return (
    <View style={styles.wheel}>
      <Text style={styles.wheelHeading}>{label}</Text>
      <View style={styles.frame}>
        <View style={styles.windowMark} pointerEvents="none" />
        <ScrollView
          ref={scroller}
          contentContainerStyle={{ paddingVertical: 96 }}
          contentOffset={{ x: 0, y: index * ROW }}
          onMomentumScrollEnd={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            commit(event.nativeEvent.contentOffset.y);
          }}
          onScrollEndDrag={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            commit(event.nativeEvent.contentOffset.y);
          }}
          snapToInterval={ROW}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
        >
          {values.map((value) => (
            <Pressable key={value} onPress={() => onSelect(value)} style={styles.option}>
              <Text style={[styles.optionText, value === selected && styles.optionOn]}>{value}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export function AgeGateScreen() {
  const { acceptAdult, error, setError, birthMonths, birthDays, birthYears } = useSession();
  const months = birthMonths.length ? birthMonths : ["01"];
  const days = birthDays.length ? birthDays : ["01"];
  const years = birthYears.length ? birthYears : ["2000"];
  const defaultYear = useMemo(() => (years.includes("2000") ? "2000" : (years[0] ?? "2000")), [years]);
  const [month, setMonth] = useState("01");
  const [day, setDay] = useState("01");
  const [year, setYear] = useState(defaultYear);
  const [closedReason, setClosedReason] = useState<AppleAgeFailureReason | null>(null);
  const allowBirthday = isInternalDogfoodBuild();
  const closed = closedReason ? appleAgeFailureCopy(closedReason) : null;

  useEffect(() => {
    setYear(defaultYear);
  }, [defaultYear]);

  async function continueWithApple() {
    const { requestAdultAgeRange } = await import("@/lib/appleAge");
    const result = await requestAdultAgeRange();
    if (!result.ok) {
      setClosedReason(result.reason);
      setError(null);
      return;
    }
    setClosedReason(null);
    await acceptAdult({ assurance: "declared_age_range", lower_bound: result.lowerBound });
  }

  return (
    <Screen>
      <View style={styles.layout}>
        <View style={styles.copy}>
          <GetFkdLogo size={168} style={styles.logo} />
          <Text style={styles.kicker}>ADULTS 18+</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Adults 18+ only.</Text>
            <SurfaceBang href={surfaceHref("age-gate")} label="Age gate" />
          </View>
          <Text style={styles.lede}>
            {allowBirthday
              ? "Development build: enter your birth date. Store and preview builds use Apple Declared Age Range and fail closed if 18+ cannot be established."
              : "Share an 18+ age range from Apple. If this device cannot share that range, Get fk'd stays closed on purpose. That is the age check, not a crash. There is no parental-consent bypass."}
          </Text>
          <View style={styles.boundaries}>
            {["Adults 18+", "No exact location", "Block and report stay free"].map((item) => (
              <Text key={item} style={styles.chip}>
                {item}
              </Text>
            ))}
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.step}>AGE CHECK</Text>
          <Text style={styles.cardTitle}>
            {closed ? closed.title : allowBirthday ? "Enter your birth date" : "Confirm you are 18+"}
          </Text>
          {closed ? <Text style={styles.help}>{closed.body}</Text> : null}
          {allowBirthday && !closed ? <Text style={styles.help}>Roll month, day, and year. The order is MM-DD-YYYY.</Text> : null}
          <Toast error={error} />
          {allowBirthday ? (
            <View style={styles.wheels}>
              <Wheel label="Month" values={months} selected={month} onSelect={setMonth} />
              <Wheel label="Day" values={days} selected={day} onSelect={setDay} />
              <Wheel label="Year" values={years} selected={year} onSelect={setYear} />
            </View>
          ) : null}
          {allowBirthday ? (
            <ActionBang href={surfaceHref("age-gate", "enter")} label="Enter Get fk'd">
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void acceptAdult({ birth_month: month, birth_day: day, birth_year: year });
                }}
                style={styles.button}
              >
                <Text style={styles.buttonLabel}>Enter Get fk'd</Text>
              </Pressable>
            </ActionBang>
          ) : closed?.retry === false ? null : (
            <ActionBang href={surfaceHref("age-gate", "apple-age")} label={closed ? "Try again" : "Continue with Apple age"}>
              <Pressable accessibilityRole="button" onPress={() => void continueWithApple()} style={styles.button}>
                <Text style={styles.buttonLabel}>{closed ? "Try again" : "Continue with Apple age"}</Text>
              </Pressable>
            </ActionBang>
          )}
          <Text style={styles.fine}>
            There is no parental-consent bypass. Eligibility fails closed when adult age cannot be established. That is
            the age check, not a crash.
          </Text>
          <LegalLinks preface="Read these before you continue. Contact is on Support." />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    gap: 28,
    justifyContent: "center",
    paddingVertical: 20,
  },
  copy: {
    gap: 8,
  },
  logo: {
    alignSelf: "center",
    marginBottom: 8,
  },
  kicker: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  title: {
    color: theme.ink,
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 42,
  },
  lede: {
    color: theme.mute,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 480,
  },
  boundaries: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  chip: {
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 999,
    borderWidth: 1,
    color: theme.mute,
    fontSize: 10,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  card: {
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  step: {
    color: "#ff6687",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  cardTitle: {
    color: theme.ink,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  help: {
    color: theme.mute,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  wheels: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  wheel: {
    flex: 1,
    minWidth: 0,
  },
  wheelHeading: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  frame: {
    backgroundColor: "#FFF7FA",
    borderColor: theme.line,
    borderRadius: 18,
    borderWidth: 1,
    height: 240,
    overflow: "hidden",
  },
  windowMark: {
    backgroundColor: "rgba(255,80,122,0.12)",
    borderColor: "rgba(255,90,127,0.38)",
    borderRadius: 12,
    borderWidth: 1,
    height: 48,
    left: 6,
    position: "absolute",
    right: 6,
    top: 96,
    zIndex: 1,
  },
  option: {
    alignItems: "center",
    height: ROW,
    justifyContent: "center",
  },
  optionText: {
    color: theme.navIdle,
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
  optionOn: {
    color: theme.ink,
    fontWeight: "800",
    transform: [{ scale: 1.08 }],
  },
  button: {
    alignItems: "center",
    backgroundColor: theme.rose,
    borderRadius: 15,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 48,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  fine: {
    color: theme.navIdle,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 10,
  },
});
