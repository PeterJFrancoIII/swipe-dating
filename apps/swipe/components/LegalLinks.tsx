import { Pressable, StyleSheet, Text, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { ActionBang } from "@/components/ReportBugButton";
import { LEGAL_URLS } from "@/lib/config";
import { surfaceHref } from "@/lib/surfaces";
import { theme } from "@/lib/theme";

const LINKS: { slug: keyof typeof LEGAL_URLS; label: string }[] = [
  { slug: "privacy", label: "Privacy" },
  { slug: "terms", label: "Terms" },
  { slug: "community", label: "Community rules" },
  { slug: "support", label: "Support" },
];

export function LegalLinks({ preface }: { preface?: string }) {
  return (
    <View style={styles.wrap}>
      {preface ? <Text style={styles.preface}>{preface}</Text> : null}
      <View style={styles.row}>
        {LINKS.map((link) => (
          <ActionBang key={link.slug} href={surfaceHref("legal", link.slug)} label={link.label}>
            <Pressable
              accessibilityRole="link"
              onPress={() => {
                void WebBrowser.openBrowserAsync(LEGAL_URLS[link.slug]);
              }}
              style={styles.link}
            >
              <Text style={styles.linkLabel}>{link.label}</Text>
            </Pressable>
          </ActionBang>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginTop: 10,
  },
  preface: {
    color: theme.navIdle,
    fontSize: 11,
    lineHeight: 15,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  link: {
    borderColor: theme.line,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  linkLabel: {
    color: theme.roseDeep,
    fontSize: 12,
    fontWeight: "800",
  },
});
