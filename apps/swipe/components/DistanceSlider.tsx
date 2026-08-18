import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import {
  DISTANCE_SLIDER_STEPS,
  distanceBandFromSliderIndex,
  distanceSliderIndex,
  distanceSliderLabel,
} from "@/lib/distance";
import { theme, tones } from "@/lib/theme";

const THUMB = 28;
const LAST = DISTANCE_SLIDER_STEPS.length - 1;

export function DistanceSlider({
  mark = "📍",
  value,
  onChange,
}: {
  mark?: string;
  value: string;
  onChange: (band: string) => void;
}) {
  const tone = tones.distance;
  const index = distanceSliderIndex(value);
  const label = distanceSliderLabel(value);
  const trackRef = useRef<View>(null);
  const track = useRef({ x: 0, width: 0 });
  const [width, setWidth] = useState(0);

  const applyPageX = (pageX: number) => {
    const { x, width: span } = track.current;
    if (span <= 0) {
      return;
    }
    const next = Math.round(((pageX - x) / span) * LAST);
    const band = distanceBandFromSliderIndex(next);
    if (band !== value) {
      onChange(band);
    }
  };

  const measureTrack = () => {
    trackRef.current?.measureInWindow((x, _y, measured) => {
      track.current = { x, width: measured };
      setWidth(measured);
    });
  };

  return (
    <View style={[styles.section, { backgroundColor: tone.fill, borderColor: tone.border }]}>
      <Text style={[styles.legend, { color: tone.ink }]}>{mark}  Distance</Text>
      <Text style={styles.help}>
        Rounded mile bands only. People without a loose distance stay hidden when a limit is set.
      </Text>
      <Text
        accessibilityRole="adjustable"
        accessibilityLabel="Distance"
        accessibilityHint="Swipe up to see people farther away. Swipe down to stay closer."
        accessibilityValue={{ min: 0, max: LAST, now: index, text: label }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") {
            onChange(distanceBandFromSliderIndex(index + 1));
            return;
          }
          if (event.nativeEvent.actionName === "decrement") {
            onChange(distanceBandFromSliderIndex(index - 1));
          }
        }}
        style={[styles.value, { color: tone.ink }]}
      >
        {label}
      </Text>
      <View
        style={styles.hit}
        onLayout={measureTrack}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          measureTrack();
          applyPageX(event.nativeEvent.pageX);
        }}
        onResponderMove={(event) => applyPageX(event.nativeEvent.pageX)}
      >
        <View ref={trackRef} style={styles.track} onLayout={measureTrack}>
          <View style={[styles.rail, { backgroundColor: theme.line }]} />
          {width > 0 ? (
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: tone.accent,
                  width: (index / LAST) * width,
                },
              ]}
            />
          ) : null}
          {DISTANCE_SLIDER_STEPS.map((step, stepIndex) => (
            <View
              key={step.id}
              style={[
                styles.tick,
                {
                  left: `${(stepIndex / LAST) * 100}%`,
                  backgroundColor: stepIndex <= index ? tone.accent : theme.lineStrong,
                },
              ]}
            />
          ))}
          {width > 0 ? (
            <View
              style={[
                styles.thumb,
                {
                  backgroundColor: theme.paper,
                  borderColor: tone.accent,
                  left: (index / LAST) * width - THUMB / 2,
                },
              ]}
            />
          ) : null}
        </View>
      </View>
      <View style={styles.ends}>
        {DISTANCE_SLIDER_STEPS.map((step) => (
          <Text key={step.id} style={[styles.end, step.id === value ? { color: tone.ink } : null]}>
            {step.tick}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 20,
    borderWidth: 1,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  legend: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  help: {
    color: theme.mute,
    fontSize: 11,
    marginBottom: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  hit: {
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: THUMB / 2,
  },
  track: {
    height: THUMB,
    justifyContent: "center",
  },
  rail: {
    borderRadius: 4,
    height: 6,
  },
  fill: {
    borderRadius: 4,
    height: 6,
    left: 0,
    position: "absolute",
  },
  tick: {
    borderRadius: 4,
    height: 8,
    marginLeft: -4,
    position: "absolute",
    top: (THUMB - 8) / 2,
    width: 8,
  },
  thumb: {
    borderRadius: THUMB / 2,
    borderWidth: 3,
    elevation: 2,
    height: THUMB,
    position: "absolute",
    shadowColor: theme.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    top: 0,
    width: THUMB,
  },
  ends: {
    flexDirection: "row",
    marginTop: 6,
    paddingHorizontal: 2,
  },
  end: {
    color: theme.mute,
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
});
