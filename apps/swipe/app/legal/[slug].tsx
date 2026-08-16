import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Screen } from "@/components/Screen";
import { LEGAL_DRAFT_BANNER, legalDoc } from "@/lib/legalDocs";
import { theme } from "@/lib/theme";

export default function LegalScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const doc = legalDoc(String(slug ?? ""));

  return (
    <Screen>
      <View style={styles.topbar}>
        <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backMark}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>{doc?.title ?? "Legal"}</Text>
        <View style={styles.spacer} />
      </View>
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.banner}>{LEGAL_DRAFT_BANNER}</Text>
        <Text style={styles.body}>{doc?.body ?? "That page is not available."}</Text>
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
  page: {
    gap: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  banner: {
    backgroundColor: theme.errorBg,
    borderColor: "#F3A0B4",
    borderRadius: 14,
    borderWidth: 1,
    color: theme.errorInk,
    fontSize: 13,
    lineHeight: 18,
    padding: 12,
  },
  body: {
    color: theme.ink,
    fontSize: 15,
    lineHeight: 22,
  },
});
