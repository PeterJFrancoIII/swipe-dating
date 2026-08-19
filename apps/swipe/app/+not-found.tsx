import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { theme } from "@/lib/theme";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Get fk'd" }} />
      <View style={styles.container}>
        <Text style={styles.title}>That screen is gone.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Back to Swipe</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.bg,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.ink,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.rose,
  },
});
