import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AgeGateScreen } from "@/components/AgeGateScreen";
import { GetFkdLogo } from "@/components/GetFkdLogo";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { ReportFab, ReportProvider } from "@/components/ReportBugButton";
import { SignInScreen } from "@/components/SignInScreen";
import { shouldShowAppleSignIn } from "@/lib/appleGate";
import { SessionProvider, useSession } from "@/lib/session";
import { theme } from "@/lib/theme";

export { ErrorBoundary } from "expo-router";

function Gate() {
  const { ready, adultAccepted, appleBound, onboardingComplete, catalogs, error, reconnect } = useSession();
  if (!ready || (error && catalogs === null)) {
    return (
      <View style={styles.boot}>
        <GetFkdLogo size={140} />
        <ActivityIndicator color={theme.rose} style={styles.bootSpinner} />
        <Text style={styles.bootText}>Connecting to Get fk'd…</Text>
        {error ? <Text style={styles.bootError}>{error}</Text> : null}
        {error ? (
          <Pressable onPress={() => void reconnect()} style={styles.retry}>
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }
  if (!adultAccepted) {
    return <AgeGateScreen />;
  }
  if (shouldShowAppleSignIn(appleBound, Platform.OS)) {
    return <SignInScreen />;
  }
  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="quiz" />
      <Stack.Screen name="filters" />
      <Stack.Screen name="community" />
      <Stack.Screen name="legal/[slug]" />
      <Stack.Screen name="matches/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <ReportProvider>
          <View style={styles.root}>
            <Gate />
            <ReportFab />
          </View>
        </ReportProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    alignItems: "center",
    backgroundColor: theme.bg,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  bootSpinner: {
    marginTop: 16,
  },
  bootText: {
    color: theme.mute,
    fontSize: 13,
    marginTop: 12,
  },
  bootError: {
    color: theme.errorInk,
    fontSize: 13,
    marginTop: 12,
    textAlign: "center",
  },
  retry: {
    backgroundColor: theme.rose,
    borderRadius: 16,
    marginTop: 16,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  retryLabel: {
    color: "#fff",
    fontWeight: "800",
  },
});
