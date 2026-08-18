import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { ApiError, api, setToken } from "@/lib/api";
import { SESSION_TOKEN_KEY } from "@/lib/config";
import { loadInstallId } from "@/lib/installId";
import { isSessionRequired, signupErrorMessage } from "@/lib/signupErrors";
import type { AuthState, Bootstrap, Catalogs } from "@/lib/types";

type SessionValue = {
  ready: boolean;
  adultAccepted: boolean;
  appleBound: boolean;
  onboardingComplete: boolean;
  displayName: string;
  getFkdEnabled: boolean;
  setGetFkdEnabled: (value: boolean) => Promise<{ dissolved: string[]; notice?: string }>;
  selfPhotoUrl: string;
  setSelfPhotoUrl: (value: string) => void;
  catalogs: Catalogs | null;
  sectionMarks: Record<string, string>;
  turnLimit: number;
  birthMonths: string[];
  birthDays: string[];
  birthYears: string[];
  reportOptions: { id: string; label: string }[];
  alignmentAnswered: number;
  alignmentTotal: number;
  setAlignmentProgress: (answered: number, total?: number) => void;
  error: string | null;
  notice: string | null;
  setError: (value: string | null) => void;
  setNotice: (value: string | null) => void;
  acceptAdult: (body: Record<string, string | number>) => Promise<boolean>;
  signInWithApple: (identityToken: string) => Promise<boolean>;
  completeOnboarding: (
    body: Parameters<typeof api.saveOnboarding>[0],
    options?: { enter?: boolean },
  ) => Promise<boolean>;
  refreshAuth: () => Promise<void>;
  reconnect: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  setDisplayName: (value: string) => void;
};

const emptyCatalogs = {
  gender: [],
  preference: [],
  smoking: [],
  drinking: [],
  drugs: [],
  turn_ons: [],
  looking: [],
  openness: [],
  interests: [],
  hobbies: [],
  personality: [],
  bedroom: [],
  distance: [],
} satisfies Catalogs;

const SessionContext = createContext<SessionValue | null>(null);

function reachError(cause: unknown, fallback: string): string {
  if (cause instanceof ApiError) {
    return signupErrorMessage(cause.code, cause.message || fallback);
  }
  const message = cause instanceof Error ? cause.message : "";
  if (/network request failed|failed to fetch|econnrefused/i.test(message)) {
    return "Can't reach Get fk'd right now. Check your connection and try again.";
  }
  return message || fallback;
}

function applyAuth(
  payload: AuthState,
  setAdult: (v: boolean) => void,
  setOnboarding: (v: boolean) => void,
  setName: (v: string) => void,
  setApple: (v: boolean) => void,
) {
  setAdult(payload.adult_accepted);
  setOnboarding(payload.onboarding_complete);
  setName(payload.display_name);
  setApple(Boolean(payload.apple_bound));
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [adultAccepted, setAdultAccepted] = useState(false);
  const [appleBound, setAppleBound] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [displayName, setDisplayName] = useState("You");
  const [getFkdEnabled, setGetFkdEnabledState] = useState(false);
  const [selfPhotoUrl, setSelfPhotoUrl] = useState("");
  const [catalogs, setCatalogs] = useState<Catalogs | null>(null);
  const [sectionMarks, setSectionMarks] = useState<Record<string, string>>({});
  const [turnLimit, setTurnLimit] = useState(5);
  const [birthMonths, setBirthMonths] = useState<string[]>([]);
  const [birthDays, setBirthDays] = useState<string[]>([]);
  const [birthYears, setBirthYears] = useState<string[]>([]);
  const [reportOptions, setReportOptions] = useState<{ id: string; label: string }[]>([]);
  const [alignmentAnswered, setAlignmentAnswered] = useState(0);
  const [alignmentTotal, setAlignmentTotal] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const setAlignmentProgress = useCallback((answered: number, total = 10) => {
    setAlignmentAnswered(answered);
    setAlignmentTotal(total || 10);
  }, []);

  async function loadBootstrap(existing?: string) {
    if (existing) {
      setToken(existing);
    }
    let bootstrap: Bootstrap;
    try {
      bootstrap = await api.bootstrap();
    } catch (cause) {
      if (!(cause instanceof ApiError) || !isSessionRequired(cause.code)) {
        throw cause;
      }
      setToken("");
      await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      bootstrap = await api.bootstrap();
    }
    await AsyncStorage.setItem(SESSION_TOKEN_KEY, bootstrap.token);
    applyAuth(bootstrap, setAdultAccepted, setOnboardingComplete, setDisplayName, setAppleBound);
    setGetFkdEnabledState(Boolean(bootstrap.get_fkd_enabled));
    setCatalogs({ ...emptyCatalogs, ...bootstrap.catalogs });
    setSectionMarks(bootstrap.section_marks);
    setTurnLimit(bootstrap.turn_limit);
    setBirthMonths(bootstrap.birth_months);
    setBirthDays(bootstrap.birth_days);
    setBirthYears(bootstrap.birth_years);
    setReportOptions(bootstrap.report_options);
    setAlignmentProgress(bootstrap.alignment_answered ?? 0, bootstrap.alignment_total ?? 200);
    if (bootstrap.onboarding_complete) {
      try {
        const mine = await api.profile();
        const photos = (mine.photos as { url?: string }[] | undefined) ?? [];
        setSelfPhotoUrl(photos[0]?.url ?? "");
      } catch {
        setSelfPhotoUrl("");
      }
    } else {
      setSelfPhotoUrl("");
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadInstallId();
        const stored = (await AsyncStorage.getItem(SESSION_TOKEN_KEY)) ?? undefined;
        await loadBootstrap(stored);
      } catch (cause) {
        if (!cancelled) {
          setError(reachError(cause, "Can't reach Get fk'd right now."));
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      adultAccepted,
      appleBound,
      onboardingComplete,
      displayName,
      getFkdEnabled,
      setGetFkdEnabled: async (enabled) => {
        const result = await api.setGetFkd(enabled);
        setGetFkdEnabledState(Boolean(result.get_fkd_enabled));
        applyAuth(result, setAdultAccepted, setOnboardingComplete, setDisplayName, setAppleBound);
        return { dissolved: result.dissolved ?? [], notice: result.notice };
      },
      selfPhotoUrl,
      setSelfPhotoUrl,
      catalogs,
      sectionMarks,
      turnLimit,
      birthMonths,
      birthDays,
      birthYears,
      reportOptions,
      alignmentAnswered,
      alignmentTotal,
      setAlignmentProgress,
      error,
      notice,
      setError,
      setNotice,
      acceptAdult: async (body) => {
        try {
          const result = await api.ageGate(body);
          applyAuth(result, setAdultAccepted, setOnboardingComplete, setDisplayName, setAppleBound);
          setAlignmentProgress(result.alignment_answered ?? 0, result.alignment_total ?? 200);
          setError(null);
          return true;
        } catch (cause) {
          setError(reachError(cause, "Age check failed."));
          setAdultAccepted(false);
          return false;
        }
      },
      signInWithApple: async (identityToken) => {
        try {
          const result = await api.signInApple(identityToken);
          applyAuth(result, setAdultAccepted, setOnboardingComplete, setDisplayName, setAppleBound);
          setAlignmentProgress(result.alignment_answered ?? 0, result.alignment_total ?? 200);
          setError(null);
          return true;
        } catch (cause) {
          setError(reachError(cause, "Sign in with Apple failed."));
          setAppleBound(false);
          return false;
        }
      },
      completeOnboarding: async (body, options) => {
        const enter = options?.enter !== false;
        try {
          const result = await api.saveOnboarding(body);
          if (enter) {
            applyAuth(result, setAdultAccepted, setOnboardingComplete, setDisplayName, setAppleBound);
          } else {
            setDisplayName(result.display_name || "You");
            setAdultAccepted(result.adult_accepted);
            setAppleBound(Boolean(result.apple_bound));
          }
          setAlignmentProgress(result.alignment_answered ?? 0, result.alignment_total ?? 200);
          setNotice(result.notice ?? null);
          setError(null);
          return true;
        } catch (cause) {
          setError(
            cause instanceof ApiError
              ? signupErrorMessage(cause.code, cause.message)
              : "Finish the highlighted questions to continue.",
          );
          return false;
        }
      },
      refreshAuth: async () => {
        await loadBootstrap();
      },
      reconnect: async () => {
        setReady(false);
        setError(null);
        try {
          await loadInstallId();
          const stored = (await AsyncStorage.getItem(SESSION_TOKEN_KEY)) ?? undefined;
          await loadBootstrap(stored);
        } catch (cause) {
          setError(reachError(cause, "Can't reach Get fk'd right now."));
        } finally {
          setReady(true);
        }
      },
      setDisplayName,
      signOut: async () => {
        await api.signOut();
        await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
        setToken("");
        setAdultAccepted(false);
        setAppleBound(false);
        setOnboardingComplete(false);
        setDisplayName("You");
        setGetFkdEnabledState(false);
        setSelfPhotoUrl("");
        setCatalogs(null);
        setError(null);
        await loadBootstrap();
      },
      deleteAccount: async () => {
        await api.deleteAccount();
        await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
        setToken("");
        setAdultAccepted(false);
        setAppleBound(false);
        setOnboardingComplete(false);
        setDisplayName("You");
        setGetFkdEnabledState(false);
        setSelfPhotoUrl("");
        setCatalogs(null);
        setError(null);
        await loadBootstrap();
      },
    }),
    [
      alignmentAnswered,
      alignmentTotal,
      adultAccepted,
      appleBound,
      birthDays,
      birthMonths,
      birthYears,
      catalogs,
      displayName,
      getFkdEnabled,
      selfPhotoUrl,
      error,
      notice,
      onboardingComplete,
      ready,
      reportOptions,
      sectionMarks,
      setDisplayName,
      turnLimit,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const session = useContext(SessionContext);
  if (session === null) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return session;
}

export { emptyCatalogs };
