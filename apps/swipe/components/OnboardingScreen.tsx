import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Screen, Toast } from "@/components/Screen";
import { ApiError, api } from "@/lib/api";
import { signupErrorMessage } from "@/lib/signupErrors";
import { loadAuthedPhoto } from "@/lib/hotDeck";
import { preparePhotoUploads, profilePhotoPickerOptions } from "@/lib/photoUpload";
import { emptyCatalogs, useSession } from "@/lib/session";
import type { AlignmentQuestion, Choice, OnboardingValues } from "@/lib/types";
import { theme } from "@/lib/theme";

const blank: OnboardingValues = {
  gender_identities: [],
  show_genders: [],
  display_name: "",
  about: "",
  home_region: "",
  smoking: "",
  drinking: "",
  drugs: "",
  turn_ons: [],
  lifestyle_tags: [],
  hobby_tags: [],
  personality_tags: [],
  immediate_intent: [],
  relational_openness: [],
};

type Step =
  | "sex"
  | "location"
  | "name"
  | "bio"
  | "smoking"
  | "drinking"
  | "drugs"
  | "photos"
  | "continue_extras"
  | "turn_ons"
  | "interests"
  | "hobbies"
  | "personality"
  | "continue_quiz"
  | "quiz";

const REQUIRED: Step[] = ["sex", "location", "name", "bio", "smoking", "drinking", "drugs", "photos"];

function AuthPhoto({ path, style }: { path: string; style: object }) {
  const [uri, setUri] = useState("");
  useEffect(() => {
    let live = true;
    void loadAuthedPhoto(path).then((next) => {
      if (live) {
        setUri(next);
      }
    });
    return () => {
      live = false;
    };
  }, [path]);
  if (!uri) {
    return <View style={[style, styles.photoPlaceholder]} />;
  }
  return <Image resizeMode="cover" source={{ uri }} style={style} />;
}

export function OnboardingScreen() {
  const { catalogs, turnLimit, completeOnboarding, setAlignmentProgress, error, setError } = useSession();
  const choices = catalogs ?? emptyCatalogs;
  const [values, setValues] = useState<OnboardingValues>(blank);
  const [step, setStep] = useState<Step>("sex");
  const [photos, setPhotos] = useState<{ slot: number; url: string }[]>([]);
  const [questions, setQuestions] = useState<AlignmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void api.onboarding().then((payload) => {
      setValues({ ...blank, ...payload.values });
      setPhotos(payload.photos ?? []);
      const firstGap = payload.missing_fields[0];
      const gapStep: Record<string, Step> = {
        gender: "sex",
        location: "location",
        name: "name",
        bio: "bio",
        smoking: "smoking",
        drinking: "drinking",
        drugs: "drugs",
        photos: "photos",
      };
      if (firstGap && gapStep[firstGap]) {
        setStep(gapStep[firstGap]);
      }
    });
  }, []);

  const requiredIndex = REQUIRED.indexOf(step);
  const progress =
    requiredIndex >= 0 ? `Age confirmed · ${requiredIndex + 2} of 9` : step === "quiz" ? "Compatibility quiz" : "Optional";

  async function persist(next: OnboardingValues, enter: boolean) {
    setBusy(true);
    try {
      const ok = await completeOnboarding({ ...next, finish: enter }, { enter });
      return ok;
    } finally {
      setBusy(false);
    }
  }

  async function saveAndGo(next: OnboardingValues, after: Step) {
    const ok = await persist(next, false);
    if (ok) {
      setStep(after);
    }
  }

  async function enterApp(next: OnboardingValues) {
    await persist(next, true);
  }

  function setOne(key: keyof OnboardingValues, value: string | string[]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.topbar}>
          <Text style={styles.topTitle}>Create your profile</Text>
        </View>
        <Toast error={error} />
        <Text style={styles.eyebrow}>{progress.toUpperCase()}</Text>
        {step === "sex" ? (
          <ChoiceStep
            title="Sex"
            help="Required. Pick one."
            options={choices.gender}
            selected={values.gender_identities}
            multiple={false}
            onChange={(next) => {
              const updated = { ...values, gender_identities: next.slice(0, 1) };
              setValues(updated);
              void saveAndGo(updated, "location");
            }}
          />
        ) : null}
        {step === "location" ? (
          <TextStep
            title="Location"
            help="City or region only. No exact address or pin."
            placeholder="City or region"
            value={values.home_region}
            onChange={(home_region) => setOne("home_region", home_region)}
            canContinue={values.home_region.trim().length >= 2}
            busy={busy}
            onContinue={() => void saveAndGo(values, "name")}
          />
        ) : null}
        {step === "name" ? (
          <TextStep
            title="Name"
            help="What should other adults call you?"
            placeholder="Display name"
            value={values.display_name}
            onChange={(display_name) => setOne("display_name", display_name)}
            canContinue={Boolean(values.display_name.trim())}
            busy={busy}
            onContinue={() => void saveAndGo(values, "bio")}
          />
        ) : null}
        {step === "bio" ? (
          <TextStep
            title="Bio"
            help="A little about you."
            placeholder="About you"
            value={values.about}
            onChange={(about) => setOne("about", about)}
            multiline
            canContinue={Boolean(values.about.trim())}
            busy={busy}
            onContinue={() => void saveAndGo(values, "smoking")}
          />
        ) : null}
        {step === "smoking" ? (
          <ChoiceStep
            title="Smoking"
            options={choices.smoking}
            selected={values.smoking ? [values.smoking] : []}
            multiple={false}
            onChange={(next) => {
              const updated = { ...values, smoking: next[0] ?? "" };
              setValues(updated);
              void saveAndGo(updated, "drinking");
            }}
          />
        ) : null}
        {step === "drinking" ? (
          <ChoiceStep
            title="Drinking"
            options={choices.drinking}
            selected={values.drinking ? [values.drinking] : []}
            multiple={false}
            onChange={(next) => {
              const updated = { ...values, drinking: next[0] ?? "" };
              setValues(updated);
              void saveAndGo(updated, "drugs");
            }}
          />
        ) : null}
        {step === "drugs" ? (
          <ChoiceStep
            title="Drugs"
            options={choices.drugs}
            selected={values.drugs ? [values.drugs] : []}
            multiple={false}
            onChange={(next) => {
              const updated = { ...values, drugs: next[0] ?? "" };
              setValues(updated);
              void saveAndGo(updated, "photos");
            }}
          />
        ) : null}
        {step === "photos" ? (
          <PhotoStep
            photos={photos}
            busy={busy}
            onAdd={() => {
              void (async () => {
                try {
                  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!permission.granted) {
                    setError("Photo library access is needed to add photos.");
                    return;
                  }
                  const picked = await ImagePicker.launchImageLibraryAsync(
                    profilePhotoPickerOptions(Math.max(1, 6 - photos.length)),
                  );
                  if (picked.canceled || !picked.assets.length) {
                    return;
                  }
                  setBusy(true);
                  const payload = (await api.uploadPhotos(await preparePhotoUploads(picked.assets))) as {
                    photos?: { slot: number; url: string }[];
                    photo_count?: number;
                  };
                  setPhotos(payload.photos ?? []);
                  setError(null);
                } catch (cause) {
                  const message =
                    cause instanceof ApiError
                      ? signupErrorMessage(cause.code, cause.message)
                      : cause instanceof Error
                        ? cause.message
                        : "Photo upload failed.";
                  setError(message || "Photo upload failed.");
                } finally {
                  setBusy(false);
                }
              })();
            }}
            onRemove={async (slot) => {
              setBusy(true);
              try {
                const payload = (await api.removePhoto(slot)) as { photos?: { slot: number; url: string }[] };
                setPhotos(payload.photos ?? []);
              } catch (cause) {
                setError(cause instanceof ApiError ? cause.message : "Remove failed.");
              } finally {
                setBusy(false);
              }
            }}
            onContinue={() => void saveAndGo(values, "continue_extras")}
          />
        ) : null}
        {step === "continue_extras" ? (
          <ContinueStep
            title="Want to add more?"
            help="Turn ons, interests, hobbies, and personality. You can skip this."
            yes="Yes, keep editing"
            no="Not now"
            busy={busy}
            onYes={() => setStep("turn_ons")}
            onNo={() => void enterApp(values)}
          />
        ) : null}
        {step === "turn_ons" ? (
          <ChoiceStep
            title="Turn ons"
            help={`Up to ${turnLimit}. Optional.`}
            options={choices.turn_ons}
            selected={values.turn_ons}
            limit={turnLimit}
            onChange={(turn_ons) => setOne("turn_ons", turn_ons)}
            footer={
              <NavRow
                busy={busy}
                onSkip={() => void saveAndGo({ ...values, turn_ons: values.turn_ons }, "interests")}
                onContinue={() => void saveAndGo(values, "interests")}
              />
            }
          />
        ) : null}
        {step === "interests" ? (
          <ChoiceStep
            title="Interested"
            help="Optional."
            options={choices.interests}
            selected={values.lifestyle_tags}
            onChange={(lifestyle_tags) => setOne("lifestyle_tags", lifestyle_tags)}
            footer={
              <NavRow
                busy={busy}
                onSkip={() => void saveAndGo(values, "hobbies")}
                onContinue={() => void saveAndGo(values, "hobbies")}
              />
            }
          />
        ) : null}
        {step === "hobbies" ? (
          <ChoiceStep
            title="Hobbies"
            help="Optional."
            options={choices.hobbies}
            selected={values.hobby_tags}
            onChange={(hobby_tags) => setOne("hobby_tags", hobby_tags)}
            footer={
              <NavRow
                busy={busy}
                onSkip={() => void saveAndGo(values, "personality")}
                onContinue={() => void saveAndGo(values, "personality")}
              />
            }
          />
        ) : null}
        {step === "personality" ? (
          <ChoiceStep
            title="Personality"
            help="Optional."
            options={choices.personality}
            selected={values.personality_tags}
            onChange={(personality_tags) => setOne("personality_tags", personality_tags)}
            footer={
              <NavRow
                busy={busy}
                onSkip={() => void saveAndGo(values, "continue_quiz")}
                onContinue={() => void saveAndGo(values, "continue_quiz")}
              />
            }
          />
        ) : null}
        {step === "continue_quiz" ? (
          <ContinueStep
            title="Compatibility quiz?"
            help="200 questions about relationships and sex. Skip any you want — skip counts and does not lower your match."
            yes="Yes, ask me"
            no="Not now"
            busy={busy}
            onYes={() => {
              void api.alignment().then((payload) => {
                setQuestions(payload.questions);
                setAnswers(payload.answers);
                const firstOpen = payload.questions.findIndex((question) => !payload.answers[question.id]);
                setQuizIndex(firstOpen >= 0 ? firstOpen : 0);
                setAlignmentProgress(
                  payload.answered ?? Object.keys(payload.answers).length,
                  payload.total ?? payload.questions.length,
                );
                setStep("quiz");
              });
            }}
            onNo={() => void enterApp(values)}
          />
        ) : null}
        {step === "quiz" ? (
          <QuizStep
            questions={questions}
            answers={answers}
            index={quizIndex}
            busy={busy}
            onBack={() => setQuizIndex((current) => Math.max(0, current - 1))}
            onChoose={async (answerId) => {
              const question = questions[quizIndex];
              if (!question) {
                return;
              }
              const next = { ...answers, [question.id]: answerId };
              setAnswers(next);
              setBusy(true);
              try {
                const saved = await api.saveAlignment(next);
                setAnswers(saved.answers);
                setAlignmentProgress(
                  saved.answered ?? Object.keys(saved.answers).length,
                  saved.total ?? questions.length,
                );
                if (quizIndex + 1 < questions.length) {
                  setQuizIndex(quizIndex + 1);
                } else {
                  await enterApp({ ...values, alignment_answers: saved.answers });
                }
              } catch (cause) {
                setError(cause instanceof ApiError ? cause.message : "Could not save that answer.");
              } finally {
                setBusy(false);
              }
            }}
          />
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ChoiceStep({
  title,
  help,
  options,
  selected,
  onChange,
  multiple = true,
  limit,
  footer,
}: {
  title: string;
  help?: string;
  options: Choice[];
  selected: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  limit?: number;
  footer?: ReactNode;
}) {
  return (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{title}</Text>
      {help ? <Text style={styles.help}>{help}</Text> : null}
      <View style={styles.options}>
        {options.map((option) => {
          const on = selected.includes(option.id);
          const capped = Boolean(limit && !on && selected.length >= limit);
          return (
            <Pressable
              key={option.id}
              disabled={capped}
              onPress={() => {
                if (!multiple) {
                  onChange([option.id]);
                  return;
                }
                onChange(on ? selected.filter((id) => id !== option.id) : [...selected, option.id]);
              }}
              style={[styles.option, on && styles.optionOn, capped && styles.navDisabled]}
            >
              <Text style={[styles.optionLabel, on && styles.optionLabelOn]}>
                {option.icon ? `${option.icon}  ` : ""}
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {footer}
    </ScrollView>
  );
}

function TextStep({
  title,
  help,
  placeholder,
  value,
  onChange,
  onContinue,
  canContinue,
  busy,
  multiline,
}: {
  title: string;
  help: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
  canContinue: boolean;
  busy: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.help}>{help}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.mute}
        style={[styles.input, multiline && styles.about]}
        value={value}
      />
      <Pressable
        disabled={!canContinue || busy}
        onPress={onContinue}
        style={[styles.submit, (!canContinue || busy) && styles.navDisabled]}
      >
        <Text style={styles.submitLabel}>Continue</Text>
      </Pressable>
    </View>
  );
}

function PhotoStep({
  photos,
  busy,
  onAdd,
  onRemove,
  onContinue,
}: {
  photos: { slot: number; url: string }[];
  busy: boolean;
  onAdd: () => void;
  onRemove: (slot: number) => void;
  onContinue: () => void;
}) {
  const ready = photos.length >= 2;
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.title}>Photos</Text>
      <Text style={styles.help}>
        {busy ? "Uploading photos…" : `Add at least 2 photos. ${photos.length} added.`}
      </Text>
      <View style={styles.photoGrid}>
        {photos.map((photo) => (
          <View key={photo.slot} style={styles.photoSlot}>
            <AuthPhoto path={photo.url} style={styles.photo} />
            <Pressable onPress={() => onRemove(photo.slot)} style={styles.photoRemove}>
              <Text style={styles.photoRemoveLabel}>Remove</Text>
            </Pressable>
          </View>
        ))}
        {photos.length < 6 ? (
          <Pressable disabled={busy} onPress={onAdd} style={styles.addSlot}>
            <Text style={styles.addMark}>+</Text>
            <Text style={styles.addLabel}>Add photos</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable disabled={!ready || busy} onPress={onContinue} style={[styles.submit, (!ready || busy) && styles.navDisabled]}>
        <Text style={styles.submitLabel}>Continue</Text>
      </Pressable>
    </ScrollView>
  );
}

function ContinueStep({
  title,
  help,
  yes,
  no,
  busy,
  onYes,
  onNo,
}: {
  title: string;
  help: string;
  yes: string;
  no: string;
  busy: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <View style={styles.body}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.help}>{help}</Text>
      <Pressable disabled={busy} onPress={onYes} style={styles.submit}>
        <Text style={styles.submitLabel}>{yes}</Text>
      </Pressable>
      <Pressable disabled={busy} onPress={onNo} style={styles.secondary}>
        <Text style={styles.secondaryLabel}>{no}</Text>
      </Pressable>
    </View>
  );
}

function NavRow({ busy, onSkip, onContinue }: { busy: boolean; onSkip: () => void; onContinue: () => void }) {
  return (
    <View style={styles.nav}>
      <Pressable disabled={busy} onPress={onSkip} style={styles.secondary}>
        <Text style={styles.secondaryLabel}>Skip</Text>
      </Pressable>
      <Pressable disabled={busy} onPress={onContinue} style={styles.submit}>
        <Text style={styles.submitLabel}>Continue</Text>
      </Pressable>
    </View>
  );
}

function QuizStep({
  questions,
  answers,
  index,
  busy,
  onBack,
  onChoose,
}: {
  questions: AlignmentQuestion[];
  answers: Record<string, string>;
  index: number;
  busy: boolean;
  onBack: () => void;
  onChoose: (answerId: string) => void;
}) {
  const question = questions[index];
  const answered = useMemo(
    () => questions.filter((item) => Boolean(answers[item.id])).length,
    [answers, questions],
  );
  if (!question) {
    return <Text style={styles.help}>Loading questions…</Text>;
  }
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.help}>
        Question {index + 1} of {questions.length} · {answered}/{questions.length} answered
      </Text>
      <Text style={styles.title}>{question.prompt}</Text>
      <View style={styles.options}>
        {question.answers.map((option) => {
          const selected = answers[question.id] === option.id;
          return (
            <Pressable
              key={option.id}
              disabled={busy}
              onPress={() => onChoose(option.id)}
              style={[styles.option, selected && styles.optionOn]}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelOn]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.nav}>
        <Pressable disabled={busy || index === 0} onPress={onBack} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>Back</Text>
        </Pressable>
        <Pressable disabled={busy} onPress={() => onChoose("skip")} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>Skip</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  topbar: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  topTitle: {
    color: theme.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  eyebrow: {
    color: theme.mute,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  body: {
    gap: 12,
    paddingBottom: 40,
  },
  title: {
    color: theme.ink,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -1,
    lineHeight: 34,
  },
  help: {
    color: theme.mute,
    fontSize: 13,
    lineHeight: 19,
  },
  options: {
    gap: 10,
    marginTop: 8,
  },
  option: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16,
  },
  optionOn: {
    backgroundColor: "#FFE4EE",
    borderColor: theme.rose,
  },
  optionLabel: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  optionLabelOn: {
    color: theme.roseDeep,
  },
  input: {
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    color: theme.ink,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  about: {
    minHeight: 120,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  submit: {
    alignItems: "center",
    backgroundColor: theme.rose,
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  submitLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondary: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryLabel: {
    color: theme.ink,
    fontWeight: "800",
  },
  nav: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  navDisabled: {
    opacity: 0.4,
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
    height: 150,
  },
  photoRemove: {
    alignItems: "center",
    paddingVertical: 8,
  },
  photoRemoveLabel: {
    color: theme.roseDeep,
    fontWeight: "800",
  },
  addSlot: {
    alignItems: "center",
    backgroundColor: theme.paper,
    borderColor: theme.line,
    borderRadius: 18,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 150,
    justifyContent: "center",
    width: "48%",
  },
  addMark: {
    color: theme.rose,
    fontSize: 28,
    fontWeight: "800",
  },
  addLabel: {
    color: theme.mute,
    fontWeight: "700",
  },
});
