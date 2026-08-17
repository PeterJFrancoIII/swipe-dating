# Photo upload system — GPT Main review handoff

- **ID:** 2026-08-16-photo-upload-handoff
- **Status:** in_progress
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Handoff requested by:** product owner, 2026-08-17 17:22 ET
- **Architect decision:** 2026-08-17 18:58 ET — REQUEST CHANGES. Expo Go is no longer the photo-upload acceptance runtime. Next slice: local iOS development client; **RN-fetch transport unchanged**.
- **Objective:** Build/run `Getfkd` via `expo run:ios` + `--dev-client`. Retest current `request()` → `reactNativeFetch()` multipart once. Do not change transport.
- **GitHub packet:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-16-photo-upload-handoff.md

## 2026-08-17 18:50 ET — RN fetch slice FAILED (no NAS POST)

Owner: "Same issue, the photo is not being uploaded."

Metro (new bundle, `getfkd photo part` logs from current `api.ts`):

- iPhone 17 `47A05D76…`: `file://…/ImagePicker/….jpeg` `IMG_0003.jpeg` + `IMG_0001.jpeg` `image/jpeg`
- iPhone 17 Pro `7758A320…`: `file://…/ImagePicker/….heic` `photo-1.heic` + `….jpeg` `IMG_0005.jpeg`
- No JS exception after those lines. No FormDataPart. No ArrayBuffer error.

NAS `docker logs --since 15m` for the same window:

- `GET /api/bootstrap` and `GET /api/onboarding` from `172.30.81.3` → **200** (repeated)
- **Zero** `POST /api/profile/photos`

Conclusion: JS built `{uri,name,type}` from real ImagePicker `file://` cache files. JSON fetch works. Multipart never reaches uvicorn. This is **not** a 401. Per architect rule 8: **STOP**.

Cursor did not start XHR, `File.upload()`, Blob/ArrayBuffer, query-token, or a dev-client migration.

Ask of GPT: pick the next **one** slice. The 18:16 note said if no NAS POST, reassess Expo Go vs native `expo-dev-client`.

## 2026-08-17 18:16 ET slice (implemented, failed live)

- Native photo POST uses `request()` / RN `fetch` (`originalFetch` when Expo replaced global fetch) with `{uri,name,type}`.
- Keeps `X-Swipe-Session` and multipart `session`. Does not set `Content-Type` on the form.
- 25s Promise.race timeout on form posts. `app.config.js` sets `EXPO_PUBLIC_USE_RN_FETCH=1`.
- `cd apps/swipe && npx tsc --noEmit && npm test` → **32 passed**, 0 failed.
- Metro: `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo start --port 8082 --go -c`

## 2026-08-17 18:58 ET slice (in progress)

- RN-fetch Expo Go evidence **accepted**. Photo-upload task still **REQUEST CHANGES**.
- Acceptance runtime is now the **local Getfkd iOS development client**, not Expo Go.
- Transport stays: `request()` → `reactNativeFetch()` + FormData `{uri,name,type}` + `X-Swipe-Session` + form `session`. No `Content-Type`.
- Build: `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo run:ios`. Metro: `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo start --dev-client --port 8082 -c`.
- Do not commit `apps/swipe/ios/`. No TestFlight. No `eas submit`. No transport change.

## Owner instruction (binding)

18:58 ET architect assignment. Cursor does not self-approve and does not pick another transport.

## Result

**Not resolved until live 200 on the development client.** Expo Go produced zero photo POSTs. First-run wizard still requires ≥2 photos.

## Ask of GPT Main

Pending live evidence from this development-client slice. Stop conditions: NAS 401, other non-200, or still zero POSTs. If zero POSTs, GPT will assign a native URLSession uploader in `getfkd-photo`. Do not raise `SESSIONS_PER_IP_HOUR`. Do not JPEG-transcode library picks (AM-017). Do not mint sessions on photo POST (AM-019).

## Environment

- Active client: Apple-first Expo SDK 57 / RN 0.86 at `apps/swipe/`
- Branch: `review/photo-upload`
- PRs: https://github.com/PeterJFrancoIII/swipe-dating/pull/11 · https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2
- Live API: `https://getfkd.sentineldefensetechnologies.co.za` (sibling repo `/Users/computer/App Development/swipe-dating-web-repo`, not the golden master)
- Test target: iPhone Simulator + **Getfkd development client** (`npx expo run:ios`, then `npx expo start --dev-client --port 8082 -c`)
- Expo Go is **not** the acceptance runtime for photo upload (architect 2026-08-17 18:58 ET).
- Store IPA 7 is stale. No `eas submit`. Generated `apps/swipe/ios/` is local CNG output; do not commit.

## Failure chain (owner-visible, in order)

| When | What the owner saw | What was actually wrong | Next client change |
|---|---|---|---|
| 2026-08-16 | Photo upload failed / 413 / “Slow down…” | nginx 8 MB; then photo POST minted sessions and hit house-IP cap 8/hr (`429 signup_rate_limited`) | API: photo POST no longer mints (AM-019). Caps not raised. nginx 48 MB. |
| 2026-08-16 19:07 ET | “nope, fail.” | NAS: photo POST **401**; `POST /api/getfkd` and `/api/location` **200**. RN FormData dropped `X-Swipe-Session`. | API already accepts multipart field `session`. |
| 2026-08-16 | (agent) XHR attempt | No photo POST on NAS. Reverted. | Back to `fetch`. |
| 2026-08-17 | still broken | Client did not reliably attach form `session` (`instanceof FormData` miss). NAS 72h: **5× 401, 0× 200**. | `attachSessionField` + duck-type. |
| 2026-08-17 16:53 ET | **Unsupported FormDataPart Implementation** | SDK 57 global `fetch` is `expo/fetch`. `convertFormData.ts` rejects `{uri,name,type}`. | `File.upload()` multipart. |
| 2026-08-17 ~16:55 ET | **Uploading photos…** forever | `File.upload()` / URLSession promise never settled. No NAS POST. No JS error. | `File.arrayBuffer()` + `new Blob([bytes])`. |
| 2026-08-17 | **Creating blobs from 'ArrayBuffer' and 'ArrayBufferView' are not supported** | RN `BlobManager` rejects ArrayBuffer parts. | Append `expo-file-system` `File` to FormData for `expo/fetch` (`.bytes()`). |
| 2026-08-17 17:12 ET | **Uploading photos…** forever again | `expo/fetch` `convertFormDataAsync` calls `File.bytes()` and buffers the body **before** `request.start()`, so `AbortSignal.timeout(90s)` never fires. No Metro error. No NAS POST. | XHR + `{uri,name,type}` + 45s timeout (on disk now). |
| 2026-08-17 17:22 ET | Owner: hand to GPT. Not resolved. | Latest XHR path has **no owner confirmation** and **no live 200**. XHR already failed once (2026-08-16). | **Stop.** |

## What is proven

- `curl https://getfkd.sentineldefensetechnologies.co.za/api/health` → **200** `{"status":"ok","client":"expo"}`
- Unauth `POST /api/profile/photos` → **401 `session_required`** (does not mint)
- Fresh token + form-only `session` → **401 `adult_gate_required`** (field is read)
- Same token + header-only → **401 `adult_gate_required`**
- JSON `POST /api/getfkd` and `/api/location` from the same Simulator session → **200**
- Device/Simulator photo POSTs on NAS (72h snapshot 2026-08-17): **5 total, 0× 200, 5× 401**
- Expo Go does not load `getfkd-photo`. Server converts HEIC. Native rebuild required for on-device encode (AM-016 / module note).
- `cd apps/swipe && npx tsc --noEmit && npm test` → **32 passed**, 0 failed (2026-08-17 17:15 ET)

## What is not proven

- Any Simulator/device photo add that returned **200** and showed photos in the wizard
- That RN fetch multipart reaches NAS from a **development client** (Expo Go: zero POSTs)

## Current on-disk client path (`apps/swipe/lib/api.ts`, commit `4258b40`)

Native (`Platform.OS !== "web"`):

1. `ensureToken()`; fail closed `401 session_required` if empty
2. `FormData` + `attachSessionField(form, token)`
3. Each file: `appendNativeFilePart` with `{uri, name, type}` (picker URI as-is; no ImageManipulator)
4. `request()` → `reactNativeFetch()` (`global.originalFetch` if Expo replaced `fetch`, else global `fetch`) POST to `${API_URL}/api/profile/photos` — `X-Swipe-Session` + form `session`, **no** `Content-Type`, 25s `Promise.race`
5. Web still uses Blob + `fetch`

There is **no** `XMLHttpRequest` upload path. `nativeMultipartUploadOptions` (`File.upload` options) is unused by `api.ts`.

## GitHub access for GPT (public — no token)

Both review repos are **public**. GPT can clone or open the PRs without a personal access token. Do not put PATs, SSH keys, or `gh` tokens in chat.

| Item | Value |
|---|---|
| Product repo | https://github.com/PeterJFrancoIII/swipe-dating |
| Product clone | `https://github.com/PeterJFrancoIII/swipe-dating.git` |
| Product branch | `review/photo-upload` |
| Product PR | https://github.com/PeterJFrancoIII/swipe-dating/pull/11 |
| API repo | https://github.com/PeterJFrancoIII/swipe-dating-web |
| API clone | `https://github.com/PeterJFrancoIII/swipe-dating-web.git` |
| API branch | `review/photo-upload-session` |
| API PR | https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2 |
| Owner | `PeterJFrancoIII` |
| Visibility | public |

Handoff packet in-repo: `.agent-memory/tasks/2026-08-16-photo-upload-handoff.md`

## Files changed (this publish)

- `apps/swipe/lib/api.ts` (modified)
- `apps/swipe/lib/formSession.ts` (untracked)
- `apps/swipe/lib/formSession.test.ts` (untracked)
- `apps/swipe/lib/photoForm.ts` (untracked)
- `apps/swipe/lib/photoForm.test.ts` (untracked)
- `apps/swipe/package.json` (modified; added direct `expo-file-system` — no longer imported by `api.ts`)
- `.agent-memory/CURRENT.md`
- this task file

Last published client commit on this branch: `25501f0` *Publish the Expo photo-upload client for GPT Main review.*

## Stale shared memory (do not follow)

- `.agent-memory/CONTEXT.md` and `CURSOR_IDE_AGENT_UPDATE.md` still say web-only / no product task (2026-08-12).
- Higher authority: current owner instruction → `PRODUCT_SCOPE.md` (Apple-first Expo) → this task → AM-019.

## Forbidden

- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- UniFFI `apps/ios` / `apps/android`
- Production / App Store
- Raising `SESSIONS_PER_IP_HOUR` without an explicit product decision
- Switching back to Expo Go for photo-upload acceptance
- More Cursor transport retries without a new GPT assignment
- Committing generated `apps/swipe/ios/`

## Related task records

- `2026-08-16-photo-upload-413.md`
- `2026-08-16-photo-upload-failed.md`
- `2026-08-16-heic-iphone14.md`
- `2026-08-16-heic-on-device.md`
- `2026-08-16-photo-session-rate-limit.md`

## Architect review

- Pending GPT Main.
