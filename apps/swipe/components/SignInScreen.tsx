import { Pressable, StyleSheet, Text, View } from "react-native";

import { GetFkdLogo } from "@/components/GetFkdLogo";
import { LegalLinks } from "@/components/LegalLinks";
import { ActionBang, SurfaceBang } from "@/components/ReportBugButton";
import { Screen, Toast } from "@/components/Screen";
import { surfaceHref } from "@/lib/surfaces";
import { useSession } from "@/lib/session";
import { isInternalDogfoodBuild } from "@/lib/storeBuild";
import { theme } from "@/lib/theme";

export function SignInScreen() {
  const { signInWithApple, error, setError } = useSession();

  async function continueWithApple() {
    try {
      const AppleAuthentication = await import("expo-apple-authentication");
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        setError(
          isInternalDogfoodBuild()
            ? "Sign in with Apple is not available. On the Simulator, sign into an Apple ID in Settings, then try again."
            : "Sign in with Apple is required and is not available on this device.",
        );
        return;
      }
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [],
      });
      if (!credential.identityToken) {
        setError("Apple did not return an identity token. Get fk'd cannot open without Sign in with Apple.");
        return;
      }
      await signInWithApple(credential.identityToken);
    } catch (cause) {
      const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
      if (code === "ERR_REQUEST_CANCELED") {
        setError("Sign in with Apple was canceled. Get fk'd cannot finish without it.");
        return;
      }
      setError(
        isInternalDogfoodBuild()
          ? "Sign in with Apple failed. On the Simulator, sign into an Apple ID in Settings, then try again."
          : "Sign in with Apple failed. Try again.",
      );
    }
  }

  return (
    <Screen>
      <View style={styles.layout}>
        <View style={styles.copy}>
          <GetFkdLogo size={168} style={styles.logo} />
          <Text style={styles.kicker}>SIGN IN</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Sign in with Apple.</Text>
            <SurfaceBang href={surfaceHref("sign-in")} label="Sign in" />
          </View>
          <Text style={styles.lede}>
            Your Apple ID is the account. There is no email or password. Sign out keeps the account. Delete
            account wipes it.
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.step}>APPLE ACCOUNT</Text>
          <Text style={styles.cardTitle}>Continue with Apple</Text>
          <Toast error={error} />
          <ActionBang href={surfaceHref("sign-in", "apple")} label="Sign in with Apple">
            <Pressable accessibilityRole="button" onPress={() => void continueWithApple()} style={styles.button}>
              <Text style={styles.buttonLabel}>Sign in with Apple</Text>
            </Pressable>
          </ActionBang>
          <Text style={styles.fine}>
            Swipe opens after Sign in with Apple. There is no email or password. Delete account is in Profile.
          </Text>
          <LegalLinks preface="Privacy, terms, community rules, and support are public before you create the account." />
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
