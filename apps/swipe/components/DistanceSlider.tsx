import { useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, View } from "react-native";

import {
  DISTANCE_FILTER_MAX_MILES,
  DISTANCE_FILTER_MIN_MILES,
  DISTANCE_SLIDER_LAST,
  distanceSliderIndex,
  distanceSliderLabel,
  milesFromSliderIndex,
} from "@/lib/distance";
import { SurfaceBang } from "@/components/ReportBugButton";
import { surfaceHref } from "@/lib/surfaces";
import { theme, tones } from "@/lib/theme";

const THUMB = 28;

export function DistanceSlider({
  mark = "📍",
  value,
  onChange,
  onSlidingChange,
}: {
  mark?: string;
  value: number | null;
  onChange: (miles: number | null) => void;
  onSlidingChange?: (held: boolean) => void;
}) {
  const tone = tones.distance;
  const index = distanceSliderIndex(value);
  const label = distanceSliderLabel(value);
  const trackRef = useRef<View>(null);
  const track = useRef({ x: 0, width: 0 });
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onSlidingRef = useRef(onSlidingChange);
  const [width, setWidth] = useState(0);
  valueRef.current = value;
  onChangeRef.current = onChange;
  onSlidingRef.current = onSlidingChange;

  const applyPageX = (pageX: number) => {
    const { x, width: span } = track.current;
    if (span <= 0) {
      return;
    }
    const next = milesFromSliderIndex(((pageX - x) / span) * DISTANCE_SLIDER_LAST);
    if (next !== valueRef.current) {
      onChangeRef.current(next);
    }
  };

  const measureTrack = () => {
    trackRef.current?.measureInWindow((x, _y, measured) => {
      track.current = { x, width: measured };
      setWidth(measured);
    });
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (event) => {
        onSlidingRef.current?.(true);
        measureTrack();
        applyPageX(event.nativeEvent.pageX);
      },
      onPanResponderMove: (event) => {
        applyPageX(event.nativeEvent.pageX);
      },
      onPanResponderRelease: () => {
        onSlidingRef.current?.(false);
      },
      onPanResponderTerminate: () => {
        onSlidingRef.current?.(false);
      },
    }),
  ).current;

  return (
    <View style={[styles.section, { backgroundColor: tone.fill, borderColor: tone.border }]}>
      <View style={styles.legendRow}>
        <Text style={[styles.legend, { color: tone.ink, flex: 1 }]}>{mark}  Distance</Text>
        <SurfaceBang href={surfaceHref("settings", "distance")} label="Distance" />
      </View>
      <Text style={styles.help}>
        1 to {DISTANCE_FILTER_MAX_MILES} miles, then Any distance. People without a distance stay
        hidden when a limit is set.
      </Text>
      <Text
        accessibilityRole="adjustable"
        accessibilityLabel="Distance"
        accessibilityHint="Swipe up to see people farther away. Swipe down to stay closer."
        accessibilityValue={{
          min: 0,
          max: DISTANCE_SLIDER_LAST,
          now: index,
          text: label,
        }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === "increment") {
            onChange(milesFromSliderIndex(index + 1));
            return;
          }
          if (event.nativeEvent.actionName === "decrement") {
            onChange(milesFromSliderIndex(index - 1));
          }
        }}
        style={[styles.value, { color: tone.ink }]}
      >
        {label}
      </Text>
      <View style={styles.hit} onLayout={measureTrack} {...pan.panHandlers}>
        <View ref={trackRef} style={styles.track} onLayout={measureTrack}>
          <View style={[styles.rail, { backgroundColor: theme.line }]} />
          {width > 0 ? (
            <View
              style={[
                styles.fill,
                {
                  backgroundColor: tone.accent,
                  width: (index / DISTANCE_SLIDER_LAST) * width,
                },
              ]}
            />
          ) : null}
          {width > 0 ? (
            <View
              style={[
                styles.thumb,
                {
                  backgroundColor: theme.paper,
                  borderColor: tone.accent,
                  left: (index / DISTANCE_SLIDER_LAST) * width - THUMB / 2,
                },
              ]}
            />
          ) : null}
        </View>
      </View>
      <View style={styles.ends}>
        <Text style={styles.end}>{DISTANCE_FILTER_MIN_MILES} mi</Text>
        <Text style={styles.end}>{DISTANCE_FILTER_MAX_MILES} mi</Text>
        <Text style={[styles.end, value == null ? { color: tone.ink } : null]}>Any</Text>
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
    justifyContent: "space-between",
    marginTop: 6,
    paddingHorizontal: THUMB / 2,
  },
  end: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "700",
  },
});
