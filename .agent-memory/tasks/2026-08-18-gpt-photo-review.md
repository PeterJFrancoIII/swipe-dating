# GPT Main review — photo upload (2026-08-18)

- **ID:** 2026-08-18-gpt-photo-review
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner request:** 2026-08-18 15:11 ET — publish a GPT handoff for review
- **Do not self-accept.** Codex alone marks `accepted` or assigns the next one slice.
- **Evidence packet:** [2026-08-16-photo-upload-handoff.md](./2026-08-16-photo-upload-handoff.md)
- **GitHub (this file):** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-gpt-photo-review.md

Read this file first. The 2026-08-16 packet is the failure-chain appendix. Do not treat Expo Go notes or the 17:12 “XHR on disk now” row as current.

## Ask of GPT Main

Assign the **next one bounded slice**, or accept the development-client RN-fetch evidence and close photo-upload.

Cursor will not pick a transport, raise timeouts, or change onboarding until you assign it.

Suggested decision space (pick one; do not invent a JS transport):

1. **Accept** the 2026-08-17 19:22 ET evidence: Getfkd development client, RN-fetch, NAS `POST /api/profile/photos` **200**, `photo_count: 2`.
2. **Timeout / UX slice:** keep RN-fetch; raise or remove the 25s form `Promise.race` so a slow HEIC convert can return; make the wizard show existing `payload.photos` when `missing_fields` is empty.
3. **Native URLSession slice** in `getfkd-photo` — only if you reject RN-fetch despite the 200.

Do not: Expo Go, XHR, `expo/fetch`, `File.upload()`, Blob/ArrayBuffer, query-token auth, API mint on photo POST (AM-019), JPEG-transcode library picks (AM-017), raise `SESSIONS_PER_IP_HOUR`, TestFlight, `eas submit`, golden-master edits.

## Verdict so far (evidence, not acceptance)

| Question | Answer |
|---|---|
| Does RN-fetch multipart leave **Expo Go**? | **No.** 2026-08-17 18:50 ET: real `file://` parts; NAS onboarding 200; **zero** photo POSTs. Architect accepted that evidence and dropped Expo Go as the photo runtime. |
| Does RN-fetch multipart leave the **Getfkd iOS development client**? | **Yes.** 2026-08-17 19:22 ET: NAS `POST /api/profile/photos` **200** at 23:22:16Z. |
| Did `photo_count` increase? | **Yes. 2.** `GET /api/onboarding` 200; slots 0 and 1 return 200 `image/avif`. |
| Did the wizard show the photos? | **No.** UI: **Photo upload timed out. Try again.** / **0 added.** 25s client timer lost to server convert. After relaunch, empty `missing_fields` keeps the wizard on Sex. |
| Stop A / B / C (401 / other non-200 / zero POSTs)? | **None fired** on the development client. |

## Current transport (one description)

`apps/swipe/lib/api.ts` commit **`4258b40`**. Unchanged since that commit.

Native (`Platform.OS !== "web"`):

1. `ensureToken()`; fail closed `401 session_required` if empty
2. `FormData` + `attachSessionField` (header `X-Swipe-Session` **and** multipart field `session`)
3. `appendNativeFilePart` `{uri, name, type}` — picker URI as-is; no ImageManipulator
4. `request()` → `reactNativeFetch()` (`global.originalFetch` if Expo replaced `fetch`, else `fetch`)
5. **No** manual `Content-Type` on the form
6. Form posts: `withTimeout(..., 25_000, "Photo upload timed out. Try again.")`
7. JSON posts: `AbortSignal.timeout(90_000)`
8. Web: Blob + `fetch`

There is **no** `XMLHttpRequest` upload path. `File.upload()` / `nativeMultipartUploadOptions` is unused.

## Runtime to use

- **Getfkd** development client (`app.getfkd.ios`), not Expo Go
- Metro: `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo start --dev-client --port 8082 -c`
- In-repo `npx expo run:ios` from `/Users/computer/App Development/Swipe Dating` fails (space in `App Development` splits Xcode scripts). Working build: `/tmp/getfkd-swipe`. Do not commit `apps/swipe/ios/` or `/tmp/getfkd-swipe`.

## GitHub access (public — no token)

| Item | Value |
|---|---|
| Product repo | https://github.com/PeterJFrancoIII/swipe-dating |
| Product clone | `https://github.com/PeterJFrancoIII/swipe-dating.git` |
| Product branch | `review/photo-upload` @ `1f37293` plus this packet commit |
| Product PR | https://github.com/PeterJFrancoIII/swipe-dating/pull/11 |
| API repo | https://github.com/PeterJFrancoIII/swipe-dating-web |
| API branch | `review/photo-upload-session` |
| API PR | https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2 |
| Live API | `https://getfkd.sentineldefensetechnologies.co.za` |
| Visibility | public |

Do not put PATs, SSH keys, or `gh` tokens in chat or in this directory.

## Allowed / forbidden for the next Cursor slice

**Allowed only after GPT names them.** Likely: `apps/swipe/lib/api.ts` (timeout only), `apps/swipe/components/OnboardingScreen.tsx` (show existing photos), this packet, `.agent-memory/CURRENT.md`.

**Forbidden:** `golden-master/swipe-dating-web/`, `approvals/`, UniFFI `apps/ios` / `apps/android`, generated `apps/swipe/ios/`, `eas submit`, production, another JS transport, API mint/cap changes.

## Stale memory (do not follow)

- `.agent-memory/CONTEXT.md` and `CURSOR_IDE_AGENT_UPDATE.md` (2026-08-12) still say web-only / no product task.
- `MISSION.md` constraints table still says web-only.
- PR #11 test plan still says “reproduce on Expo Go.”
- Failure-chain row 2026-08-17 17:12 (“XHR on disk now”) is historical, not current.

Higher authority: owner instruction → `PRODUCT_SCOPE.md` (Apple-first Expo) → this brief → AM-017 / AM-019.

## Architect review

- Cursor: `ready_for_review` (2026-08-18 15:11 ET). Not self-accepted.
- Pending GPT Main.
