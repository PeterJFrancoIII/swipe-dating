import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { loadAuthedPhoto } from "@/lib/hotDeck";
import { theme } from "@/lib/theme";

export function AuthPhoto({
  path,
  fallback,
  style,
}: {
  path?: string;
  fallback?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [uri, setUri] = useState("");
  useEffect(() => {
    let live = true;
    if (!path) {
      setUri("");
      return () => {
        live = false;
      };
    }
    void loadAuthedPhoto(path).then((next) => {
      if (live) {
        setUri(next);
      }
    });
    return () => {
      live = false;
    };
  }, [path]);
  return (
    <View style={[styles.placeholder, style]}>
      {uri ? <Image resizeMode="cover" source={{ uri }} style={styles.fill} /> : null}
      {!uri && fallback ? <Text style={styles.mark}>{fallback}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: "center",
    backgroundColor: theme.blush,
    justifyContent: "center",
    overflow: "hidden",
  },
  fill: {
    ...StyleSheet.absoluteFill,
  },
  mark: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },
});
