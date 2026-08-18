import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { AuthPhoto } from "@/components/AuthPhoto";
import { ChoiceRow } from "@/components/ChoiceSheet";
import { PhotoUploadMeter } from "@/components/PhotoUploadMeter";
import { FeedbackButton } from "@/components/ReportBugButton";
import { Screen, Toast } from "@/components/Screen";
import { ApiError, api } from "@/lib/api";
import { signupErrorMessage } from "@/lib/signupErrors";
import { LEGAL_DOCS } from "@/lib/legalDocs";
import { preparePhotoUploads, profilePhotoPickerOptions, uniquePickedPhotos } from "@/lib/photoUpload";
import { quizProgressLabel } from "@/lib/alignment";
import { emptyCatalogs, useSession } from "@/lib/session";
import { theme } from "@/lib/theme";
import { usePhotoUploadProgress } from "@/lib/usePhotoUploadProgress";

type ProfileFields = {
  display_name: string;
  about: string;
  home_region: string;
  gender_identities: string[];
  smoking: string;
  drinking: string;
  drugs: string;
  turn_ons: string[];
  lifestyle_tags: string[];
  hobby_tags: string[];
  personality_tags: string[];
  bedroom_tags: string[];
};

type ProfilePayload = {
  profile: ProfileFields;
  boosts: number;
  superlikes: number;
  photo_limit: number;
  photo_count: number;
  photos: { slot: number; url: string }[];
  notice?: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const {
    catalogs,
    sectionMarks,
    turnLimit,
    deleteAccount,
    signOut,
    setDisplayName,
    setSelfPhotoUrl,
    refreshAuth,
    alignmentAnswered,
    alignmentTotal,
  } = useSession();
  const choices = catalogs ?? emptyCatalogs;
  const [data, setData] = useState<ProfilePayload | null>(null);
  const [flash, setFlash] = useState<{ error?: string | null; notice?: string | null }>({});
  const [loading, setLoading] = useState(true);
  const upload = usePhotoUploadProgress();

  async function reload() {
    const payload = (await api.profile()) as ProfilePayload;
    setData(payload);
    setSelfPhotoUrl(payload.photos[0]?.url ?? "");
    setLoading(false);
  }

  useEffect(() => {
    void reload().catch((cause) => {
      setLoading(false);
      setFlash({ error: cause instanceof ApiError ? cause.message : "Profile failed." });
    });
  }, []);

  async function save(next: ProfileFields) {
    try {
      const payload = (await api.saveProfile(next)) as ProfilePayload;
      setData(payload);
      setDisplayName(next.display_name.trim() || "You");
      setFlash({ notice: payload.notice || "Profile saved." });
    } catch (cause) {
      setFlash({ error: cause instanceof ApiError ? cause.message : "Save failed." });
    }
  }

  async function pickPhotos(remaining: number) {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFlash({ error: "Photo library access is needed to add photos." });
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync(profilePhotoPickerOptions(remaining));
    if (picked.canceled || !picked.assets.length) {
      return;
    }
    const assets = uniquePickedPhotos(picked.assets).slice(0, remaining);
    try {
      upload.start(assets.length);
      const prepared = await preparePhotoUploads(assets, {
        onStart: (index) => upload.prepareStart(index),
        onDone: (index) => upload.prepared(index),
      });
      const payload = (await api.uploadPhotos(prepared, {
        onStart: (index) => upload.uploadStart(index),
        onDone: (index, _total, durationMs) => upload.uploaded(index, durationMs),
        onRecover: () => upload.recover(),
      })) as ProfilePayload;
      upload.done();
      setData(payload);
      setSelfPhotoUrl(payload.photos[0]?.url ?? "");
      setFlash({ notice: payload.notice || "Photos added." });
    } catch (cause) {
      const message =
        cause instanceof ApiError
          ? signupErrorMessage(cause.code, cause.message)
          : cause instanceof Error
            ? cause.message
            : "Upload failed.";
      setFlash({ error: message || "Upload failed." });
    } finally {
      upload.clear();
    }
  }

  const profile = data?.profile;
  const emptySlots = data ? Math.max(0, data.photo_limit - data.photo_count) : 0;

  return (
    <Screen footer={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.topbar}>
          <Pressable accessibilityLabel="Close profile" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backMark}>‹</Text>
          </Pressable>
          <Text style={styles.topTitle}>Profile settings</Text>
          <View style={styles.spacer} />
        </View>
        <Toast error={flash.error} notice={flash.notice} />
        {!data && !loading ? (
          <Pressable
            onPress={() => {
              setLoading(true);
              void reload().catch((cause) => {
                setLoading(false);
                setFlash({ error: cause instanceof ApiError ? cause.message : "Profile failed." });
              });
            }}
            style={styles.primary}
          >
            <Text style={styles.primaryLabel}>Try again</Text>
          </Pressable>
        ) : null}
        {profile && data ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            style={styles.flex}
            contentContainerStyle={styles.sheet}
          >
            <View style={styles.hero}>
              <AuthPhoto
                fallback={(profile.display_name || "You").trim().charAt(0).toUpperCase() || "Y"}
                path={data.photos[0]?.url}
                style={styles.heroPhoto}
              />
              <Text style={styles.heroName}>{profile.display_name || "You"}</Text>
            </View>
            <Pressable onPress={() => router.push("/quiz")} style={styles.quiz}>
              <Text style={styles.quizLabel}>{quizProgressLabel(alignmentAnswered, alignmentTotal)}</Text>
              <Text style={styles.quizHelp}>Skip any question. Skip counts and does not lower your match.</Text>
            </Pressable>
            <Text style={styles.help}>
              This is what other adults see. Sexual preference stays in Settings, not on your card.
            </Text>
            <FeedbackButton />
            <Text style={styles.sectionTitle}>Photos</Text>
            {upload.progress ? <PhotoUploadMeter progress={upload.progress} /> : null}
            <View style={styles.photoGrid}>
              {data.photos.map((photo) => (
                <View key={photo.slot} style={styles.photoSlot}>
                  <AuthPhoto path={photo.url} style={styles.photo} />
                  <Pressable
                    onPress={async () => {
                      try {
                        const payload = (await api.removePhoto(photo.slot)) as ProfilePayload;
                        setData(payload);
                        setSelfPhotoUrl(payload.photos[0]?.url ?? "");
                        setFlash({ notice: payload.notice || "Photo removed." });
                      } catch (cause) {
                        setFlash({ error: cause instanceof ApiError ? cause.message : "Remove failed." });
                      }
                    }}
                    style={styles.photoRemove}
                  >
                    <Text style={styles.photoRemoveLabel}>Remove</Text>
                  </Pressable>
                </View>
              ))}
              {emptySlots > 0 ? (
                <Pressable
                  disabled={Boolean(upload.progress)}
                  onPress={() => void pickPhotos(emptySlots)}
                  style={styles.addSlot}
                >
                  <Text style={styles.addMark}>+</Text>
                  <Text style={styles.addLabel}>{emptySlots > 1 ? "Add photos" : "Add photo"}</Text>
                </Pressable>
              ) : null}
            </View>
            <TextInput
              onChangeText={(display_name) => setData({ ...data, profile: { ...profile, display_name } })}
              placeholder="Display name"
              placeholderTextColor={theme.mute}
              style={styles.input}
              value={profile.display_name}
            />
            <TextInput
              onChangeText={(home_region) => setData({ ...data, profile: { ...profile, home_region } })}
              placeholder="City or region"
              placeholderTextColor={theme.mute}
              style={styles.input}
              value={profile.home_region ?? ""}
            />
            <TextInput
              multiline
              onChangeText={(about) => setData({ ...data, profile: { ...profile, about } })}
              placeholder="About you"
              placeholderTextColor={theme.mute}
              style={[styles.input, styles.about]}
              value={profile.about}
            />
            <ChoiceRow
              group="gender"
              mark={sectionMarks.gender}
              title="Gender"
              empty="Choose gender"
              multiple={false}
              options={choices.gender}
              selected={profile.gender_identities}
              onChange={(gender_identities) => setData({ ...data, profile: { ...profile, gender_identities } })}
            />
            <ChoiceRow
              group="smoking"
              mark={sectionMarks.smoking}
              title="Smoking"
              empty="Choose"
              multiple={false}
              options={choices.smoking}
              selected={profile.smoking ? [profile.smoking] : []}
              onChange={(next) => setData({ ...data, profile: { ...profile, smoking: next[0] ?? "" } })}
            />
            <ChoiceRow
              group="drinking"
              mark={sectionMarks.drinking}
              title="Drinking"
              empty="Choose"
              multiple={false}
              options={choices.drinking}
              selected={profile.drinking ? [profile.drinking] : []}
              onChange={(next) => setData({ ...data, profile: { ...profile, drinking: next[0] ?? "" } })}
            />
            <ChoiceRow
              group="drugs"
              mark={sectionMarks.drugs}
              title="Drugs"
              empty="Choose"
              multiple={false}
              options={choices.drugs}
              selected={profile.drugs ? [profile.drugs] : []}
              onChange={(next) => setData({ ...data, profile: { ...profile, drugs: next[0] ?? "" } })}
            />
            <ChoiceRow
              group="turn_ons"
              mark={sectionMarks.turn_ons}
              title="Turn ons"
              empty="Choose turn ons"
              limit={turnLimit}
              options={choices.turn_ons}
              selected={profile.turn_ons}
              onChange={(turn_ons) => setData({ ...data, profile: { ...profile, turn_ons } })}
            />
            {choices.interests.length ? (
              <ChoiceRow
                group="interests"
                mark={sectionMarks.interests}
                title="Interests"
                empty="Choose interests"
                options={choices.interests}
                selected={profile.lifestyle_tags}
                onChange={(lifestyle_tags) => setData({ ...data, profile: { ...profile, lifestyle_tags } })}
              />
            ) : null}
            {choices.hobbies.length ? (
              <ChoiceRow
                group="hobbies"
                mark={sectionMarks.hobbies}
                title="Hobbies"
                empty="Choose hobbies"
                options={choices.hobbies}
                selected={profile.hobby_tags}
                onChange={(hobby_tags) => setData({ ...data, profile: { ...profile, hobby_tags } })}
              />
            ) : null}
            {choices.personality.length ? (
              <ChoiceRow
                group="personality"
                mark={sectionMarks.personality}
                title="Personality"
                empty="Choose traits"
                options={choices.personality}
                selected={profile.personality_tags}
                onChange={(personality_tags) => setData({ ...data, profile: { ...profile, personality_tags } })}
              />
            ) : null}
            <Pressable onPress={() => void save(profile)} style={styles.primary}>
              <Text style={styles.primaryLabel}>Save profile</Text>
            </Pressable>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Boost and Superlike</Text>
              <Text style={styles.help}>
                {data.boosts} Boosts · {data.superlikes} Superlikes. This version does not sell reach. App Store purchases are not available yet.
              </Text>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Legal and support</Text>
              <Text style={styles.help}>Drafts only — not in force until counsel approves them.</Text>
              {LEGAL_DOCS.map((doc) => (
                <Pressable key={doc.slug} onPress={() => router.push(`/legal/${doc.slug}`)} style={styles.secondary}>
                  <Text>{doc.title}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Account</Text>
              <Pressable
                onPress={() => {
                  void signOut().catch((cause) => {
                    setFlash({ error: cause instanceof ApiError ? cause.message : "Sign out failed." });
                  });
                }}
                style={styles.secondary}
              >
                <Text>Sign out</Text>
              </Pressable>
            </View>
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Your data</Text>
              <Pressable
                onPress={async () => {
                  try {
                    const payload = await api.exportAccount();
                    await Share.share({ message: payload.export, title: "Get fk'd export" });
                    setFlash({ notice: "Export ready." });
                  } catch (cause) {
                    setFlash({ error: cause instanceof ApiError ? cause.message : "Export failed." });
                  }
                }}
                style={styles.secondary}
              >
                <Text>Export my data</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Alert.alert("Delete account?", "This wipes your session on this device and on the server.", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        void deleteAccount()
                          .then(() => setFlash({ notice: "Account deleted." }))
                          .catch((cause) => {
                            setFlash({ error: cause instanceof ApiError ? cause.message : "Delete failed." });
                          });
                      },
                    },
                  ]);
                }}
                style={styles.danger}
              >
                <Text style={styles.dangerLabel}>Delete account</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                void refreshAuth();
                router.push("/community");
              }}
            >
              <Text style={styles.quiet}>Community review</Text>
            </Pressable>
          </ScrollView>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    minHeight: 0,
  },
  topbar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
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
  hero: {
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
  },
  heroPhoto: {
    backgroundColor: theme.rose,
    borderColor: "#F5B8C8",
    borderRadius: 44,
    borderWidth: 2,
    height: 88,
    width: 88,
  },
  heroName: {
    color: theme.ink,
    fontSize: 20,
    fontWeight: "800",
  },
  quiz: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.rose,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    minHeight: 56,
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  quizLabel: {
    color: theme.roseDeep,
    fontSize: 15,
    fontWeight: "800",
  },
  quizHelp: {
    color: theme.mute,
    fontSize: 12,
    textAlign: "center",
  },
  help: {
    color: theme.mute,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionTitle: {
    color: theme.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoSlot: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    width: "48%",
  },
  photo: {
    height: 150,
    width: "100%",
  },
  photoPlaceholder: {
    backgroundColor: "#FFE4EE",
  },
  photoRemove: {
    alignItems: "center",
    minHeight: 40,
    justifyContent: "center",
  },
  photoRemoveLabel: {
    color: theme.errorInk,
    fontSize: 13,
    fontWeight: "700",
  },
  addSlot: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 18,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 190,
    justifyContent: "center",
    width: "48%",
  },
  addMark: {
    color: theme.rose,
    fontSize: 36,
    fontWeight: "300",
  },
  addLabel: {
    color: theme.muteDeep,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 13,
    borderWidth: 1,
    color: theme.ink,
    padding: 12,
  },
  about: {
    minHeight: 90,
    textAlignVertical: "top",
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
  box: {
    backgroundColor: theme.paper,
    borderColor: theme.lineStrong,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 17,
  },
  boxTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  secondary: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  danger: {
    alignItems: "center",
    backgroundColor: theme.errorBg,
    borderColor: "#F3A0B4",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  dangerLabel: {
    color: theme.errorInk,
    fontWeight: "800",
  },
  quiet: {
    color: theme.mute,
    fontSize: 13,
    paddingVertical: 8,
    textAlign: "center",
  },
});
