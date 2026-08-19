import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { API_URL, SESSION_HEADER, SESSION_TOKEN_KEY } from "@/lib/config";
import { recordLastError, recordSessionHints } from "@/lib/diagnostics";
import { attachSessionField, isFormBody } from "@/lib/formSession";
import { payloadFromFailedResponse } from "@/lib/httpErrors";
import { currentInstallId } from "@/lib/installId";
import { recoverPhotosFromOnboarding } from "@/lib/onboardingStep";
import { appendNativeFilePart, type FormWithNativeAppend } from "@/lib/photoForm";
import { photoAcceptHeader } from "@/lib/photoGeometry";
import { FORM_UPLOAD_TIMEOUT_MESSAGE, FORM_UPLOAD_TIMEOUT_MS, withTimeout } from "@/lib/requestTimeout";
import type {
  AuthState,
  Bootstrap,
  ChatState,
  CommunityCase,
  DiscoverPack,
  DiscoverState,
  MatchRow,
  AlignmentState,
  OnboardingValues,
} from "@/lib/types";

export class ApiError extends Error {
  status: number;
  code: string;
  payload: Record<string, unknown>;

  constructor(status: number, payload: Record<string, unknown>) {
    super(String(payload.error ?? "Request failed"));
    this.status = status;
    this.code = String(payload.code ?? "");
    this.payload = payload;
  }
}

let sessionToken = "";

export function getToken(): string {
  return sessionToken;
}

export function setToken(token: string): void {
  sessionToken = token;
}

async function ensureToken(): Promise<void> {
  if (sessionToken) {
    return;
  }
  const stored = (await AsyncStorage.getItem(SESSION_TOKEN_KEY)) ?? "";
  if (stored) {
    sessionToken = stored;
  }
}

function mergeHeaders(incoming: HeadersInit | undefined): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!incoming) {
    return headers;
  }
  if (incoming instanceof Headers) {
    incoming.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }
  if (Array.isArray(incoming)) {
    for (const [key, value] of incoming) {
      headers[key] = value;
    }
    return headers;
  }
  return { ...incoming };
}

export function mediaUrl(path: string): string {
  if (path.startsWith("http")) {
    return path;
  }
  return `${API_URL}${path}`;
}

export function mediaHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: photoAcceptHeader(Platform.OS),
  };
  if (sessionToken) {
    headers[SESSION_HEADER] = sessionToken;
  }
  if (!__DEV__) {
    headers["X-Getfkd-Release"] = "store";
  }
  headers["X-Getfkd-Install"] = currentInstallId();
  return headers;
}

function reactNativeFetch(input: string, init: RequestInit): Promise<Response> {
  const rn = (globalThis as { originalFetch?: typeof fetch }).originalFetch;
  if (typeof rn === "function") {
    return rn(input, init);
  }
  return fetch(input, init);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  await ensureToken();
  let form = false;
  if (isFormBody(init.body)) {
    attachSessionField(init.body, sessionToken);
    form = true;
  }
  const headers = mergeHeaders(init.headers);
  if (sessionToken) {
    headers[SESSION_HEADER] = sessionToken;
  }
  if (!__DEV__) {
    headers["X-Getfkd-Release"] = "store";
  }
  headers["X-Getfkd-Install"] = currentInstallId();
  if (!headers.Accept && !headers.accept) {
    headers.Accept = "application/json";
  }
  if (typeof init.body === "string" && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }
  const send = form ? reactNativeFetch : fetch;
  if (form && __DEV__) {
    const rn = (globalThis as { originalFetch?: typeof fetch }).originalFetch;
    console.warn("getfkd photo fetch", typeof rn === "function" ? "originalFetch" : "globalFetch", path);
  }
  let response: Response;
  try {
    const pending = send(`${API_URL}${path}`, {
      ...init,
      headers,
      signal: form
        ? undefined
        : typeof AbortSignal.timeout === "function"
          ? AbortSignal.timeout(90_000)
          : undefined,
    });
    response = form
      ? await withTimeout(pending, FORM_UPLOAD_TIMEOUT_MS, FORM_UPLOAD_TIMEOUT_MESSAGE)
      : await pending;
  } catch (cause) {
    const message = cause instanceof Error && cause.message ? cause.message : "Can't reach Get fk'd right now.";
    recordLastError({ path, status: 0, code: "network", message });
    throw new ApiError(0, { error: message, code: "network" });
  }
  const payload = response.ok
    ? await readJson(response)
    : payloadFromFailedResponse(response.status, await readJson(response));
  return finishPayload<T>(path, response.status, payload);
}

function finishPayload<T>(path: string, status: number, payload: Record<string, unknown>): T {
  if (typeof payload.token === "string" && payload.token) {
    sessionToken = payload.token;
    void AsyncStorage.setItem(SESSION_TOKEN_KEY, payload.token);
  }
  recordSessionHints(payload);
  if (status < 200 || status >= 300) {
    recordLastError({
      path,
      status,
      code: String(payload.code ?? ""),
      message: String(payload.error ?? "Request failed"),
    });
    throw new ApiError(status, payload);
  }
  return payload as T;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {};
  }
  try {
    const raw = await response.json();
    return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function appendLocalFile(
  form: FormData,
  fieldName: string,
  file: { uri: string; name: string; type: string },
): Promise<void> {
  if (Platform.OS === "web") {
    const blob = await (await fetch(file.uri)).blob();
    form.append(fieldName, blob, file.name);
    return;
  }
  appendNativeFilePart(form as FormWithNativeAppend, fieldName, file);
}

async function recoverStoredPhotos(): Promise<Record<string, unknown> | null> {
  for (const delayMs of [0, 2_500]) {
    if (delayMs) {
      await new Promise((resolve) => {
        setTimeout(resolve, delayMs);
      });
    }
    try {
      const recovered = recoverPhotosFromOnboarding(
        await request<{
          photos?: { slot: number; url: string }[];
          photo_count?: number;
        }>("/api/onboarding"),
      );
      if (recovered) {
        if (__DEV__) {
          console.warn("getfkd photo recovered from onboarding", recovered.photo_count);
        }
        return recovered;
      }
    } catch {
      /* keep the original upload error */
    }
  }
  return null;
}

export const api = {
  bootstrap: () => request<Bootstrap>("/api/bootstrap"),
  ageGate: (body: Record<string, string | number>) =>
    request<AuthState & { next: string }>("/api/age-gate", { method: "POST", body: JSON.stringify(body) }),
  signInApple: (identityToken: string) =>
    request<AuthState>("/api/auth/apple", {
      method: "POST",
      body: JSON.stringify({ identity_token: identityToken }),
    }),
  signOut: () => request<{ signed_out: boolean }>("/api/auth/sign-out", { method: "POST", body: "{}" }),
  onboarding: () =>
    request<
      {
        values: OnboardingValues;
        missing_fields: string[];
        alignment?: AlignmentState;
        photos?: { slot: number; url: string }[];
        photo_count?: number;
        photo_limit?: number;
      } & AuthState
    >("/api/onboarding"),
  alignment: () => request<AlignmentState>("/api/alignment"),
  saveAlignment: (answers: Record<string, string>) =>
    request<AlignmentState>("/api/alignment", { method: "POST", body: JSON.stringify({ answers }) }),
  saveOnboarding: (body: OnboardingValues) =>
    request<AuthState & { notice?: string }>("/api/onboarding", { method: "POST", body: JSON.stringify(body) }),
  setGetFkd: (enabled: boolean) =>
    request<AuthState & { get_fkd_enabled: boolean; dissolved?: string[]; notice?: string }>("/api/getfkd", {
      method: "POST",
      body: JSON.stringify({ enabled }),
    }),
  saveLocation: (body: {
    latitude: number;
    longitude: number;
    accuracy_m: number;
    timestamp_ms: number;
    simulated: boolean;
    mock: boolean;
    reduced_accuracy: boolean;
  }) => request<AuthState & { location_ready?: boolean }>("/api/location", { method: "POST", body: JSON.stringify(body) }),
  discover: (photo = 0) => request<DiscoverState>(`/api/discover?photo=${photo}`),
  discoverPack: (photo = 0) => request<DiscoverPack>(`/api/discover/pack?photo=${photo}&ahead=4`),
  pass: (candidateId: string) =>
    request<DiscoverState>("/api/discover/pass", { method: "POST", body: JSON.stringify({ candidate_id: candidateId }) }),
  like: (candidateId: string) =>
    request<DiscoverState>("/api/discover/interest", {
      method: "POST",
      body: JSON.stringify({ candidate_id: candidateId }),
    }),
  superlike: (candidateId: string) =>
    request<DiscoverState>("/api/discover/superlike", {
      method: "POST",
      body: JSON.stringify({ candidate_id: candidateId }),
    }),
  boost: () => request<DiscoverState>("/api/discover/boost", { method: "POST", body: "{}" }),
  undo: () => request<DiscoverState>("/api/discover/undo", { method: "POST", body: "{}" }),
  blockCandidate: (candidateId: string) =>
    request<DiscoverState>("/api/discover/block", {
      method: "POST",
      body: JSON.stringify({ candidate_id: candidateId }),
    }),
  report: (candidateId: string, reason: string, evidenceNote: string, alsoBlock = false) =>
    request<DiscoverState>("/api/discover/report", {
      method: "POST",
      body: JSON.stringify({
        candidate_id: candidateId,
        reason,
        evidence_note: evidenceNote,
        also_block: alsoBlock,
      }),
    }),
  matches: () => request<{ matches: MatchRow[] }>("/api/matches"),
  chat: (matchId: string) => request<ChatState>(`/api/matches/${encodeURIComponent(matchId)}`),
  message: (matchId: string, body: string) =>
    request<ChatState>(`/api/matches/${encodeURIComponent(matchId)}/message`, {
      method: "POST",
      body: JSON.stringify({ body }),
    }),
  meetup: (matchId: string, suggestionId: string) =>
    request<ChatState>(`/api/matches/${encodeURIComponent(matchId)}/meetup`, {
      method: "POST",
      body: JSON.stringify({ suggestion_id: suggestionId }),
    }),
  extend: (matchId: string) =>
    request<ChatState>(`/api/matches/${encodeURIComponent(matchId)}/extend`, { method: "POST", body: "{}" }),
  unmatch: (matchId: string) =>
    request<{ matches: MatchRow[] }>(`/api/matches/${encodeURIComponent(matchId)}/unmatch`, {
      method: "POST",
      body: "{}",
    }),
  block: (matchId: string) =>
    request<{ matches: MatchRow[] }>(`/api/matches/${encodeURIComponent(matchId)}/block`, {
      method: "POST",
      body: "{}",
    }),
  reportMatch: (matchId: string, reason: string, evidenceNote: string, alsoBlock = false) =>
    request<ChatState | { matches: MatchRow[]; notice?: string }>(
      `/api/matches/${encodeURIComponent(matchId)}/report`,
      {
        method: "POST",
        body: JSON.stringify({ reason, evidence_note: evidenceNote, also_block: alsoBlock }),
      },
    ),
  profile: () => request<Record<string, unknown>>("/api/profile"),
  saveProfile: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>("/api/profile", { method: "POST", body: JSON.stringify(body) }),
  uploadPhotos: async (
    files: { uri: string; name: string; type: string }[],
    onProgress?: {
      onStart?: (index: number, total: number) => void;
      onDone?: (index: number, total: number, durationMs: number) => void;
      onRecover?: () => void;
    },
  ) => {
    if (!files.length) {
      throw new ApiError(400, { error: "Choose photos, then tap Add photos.", code: "photo_empty" });
    }
    await ensureToken();
    if (!sessionToken) {
      throw new ApiError(401, {
        error: "Your session expired. Try again.",
        code: "session_required",
      });
    }
    try {
      let payload: Record<string, unknown> | null = null;
      for (const [index, file] of files.entries()) {
        if (__DEV__) {
          console.warn("getfkd photo part", file.uri, file.name, file.type);
        }
        onProgress?.onStart?.(index, files.length);
        const form = new FormData();
        attachSessionField(form, sessionToken);
        await appendLocalFile(form, "photo", file);
        const started = Date.now();
        payload = await request<Record<string, unknown>>("/api/profile/photos", {
          method: "POST",
          body: form,
          headers: { Accept: "application/json" },
        });
        onProgress?.onDone?.(index, files.length, Date.now() - started);
      }
      const photos = payload?.photos;
      if (!Array.isArray(photos) || photos.length < 1) {
        throw new ApiError(400, { error: "Photo upload failed.", code: "photo_empty" });
      }
      return payload;
    } catch (cause) {
      onProgress?.onRecover?.();
      const recovered = await recoverStoredPhotos();
      if (recovered) {
        return recovered;
      }
      throw cause;
    }
  },
  removePhoto: (slot: number) =>
    request<Record<string, unknown>>(`/api/profile/photos/${slot}/remove`, { method: "POST", body: "{}" }),
  buyReach: (sku: string) =>
    request<Record<string, unknown>>("/api/profile/reach", { method: "POST", body: JSON.stringify({ sku }) }),
  filters: () => request<Record<string, unknown>>("/api/filters"),
  saveFilters: (body: Record<string, unknown>) =>
    request<Record<string, unknown>>("/api/filters", { method: "POST", body: JSON.stringify(body) }),
  exportAccount: () => request<{ export: string; exported_at: string }>("/api/account/export"),
  deleteAccount: () => request<{ deleted: boolean }>("/api/account/delete", { method: "POST", body: "{}" }),
  community: () => request<{ cases: CommunityCase[] }>("/api/community"),
  vote: (caseId: string, reviewerId: string, choice: string) =>
    request<{ cases: CommunityCase[]; notice?: string }>(`/api/community/${caseId}/vote`, {
      method: "POST",
      body: JSON.stringify({ reviewer_id: reviewerId, choice }),
    }),
  reportInAppError: async (input: {
    uri: string;
    name: string;
    type: string;
    explanation: string;
    context: Record<string, unknown>;
    tags?: string[];
  }) => {
    await ensureToken();
    const form = new FormData();
    await appendLocalFile(form, "screenshot", {
      uri: input.uri,
      name: input.name,
      type: input.type,
    });
    form.append("explanation", input.explanation);
    form.append("context", JSON.stringify(input.context));
    form.append("tags", JSON.stringify(input.tags ?? []));
    return request<{ id: string; title: string; tags: string[]; notice?: string; security_hold?: boolean }>("/api/system/errors", {
      method: "POST",
      body: form,
      headers: { Accept: "application/json" },
    });
  },
  sendFeedback: (
    body: string,
    extra: { tags?: string[]; surface_href?: string; kind?: string } | string[] = ["feedback"],
  ) => {
    const payload = Array.isArray(extra)
      ? { body, tags: extra }
      : { body, tags: extra.tags ?? ["feedback"], surface_href: extra.surface_href, kind: extra.kind };
    return request<{ id: string; notice?: string; security_hold?: boolean }>("/api/system/feedback", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  appeal: (caseId: string) =>
    request<{ cases: CommunityCase[]; notice?: string }>(`/api/community/${caseId}/appeal`, {
      method: "POST",
      body: "{}",
    }),
  adjudicate: (caseId: string) =>
    request<{ cases: CommunityCase[]; notice?: string }>(`/api/community/${caseId}/adjudicate`, {
      method: "POST",
      body: "{}",
    }),
};
