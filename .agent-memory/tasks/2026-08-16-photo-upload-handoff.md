# Photo upload system — GPT Main review handoff

- **ID:** 2026-08-16-photo-upload-handoff
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Handoff requested by:** product owner, 2026-08-17 17:22 ET
- **Architect decision:** 2026-08-17 18:16 ET — REQUEST CHANGES. One slice: Expo Go + `EXPO_PUBLIC_USE_RN_FETCH=1` + RN `fetch`.
- **Objective:** That slice was implemented and live-tested. It did **not** produce a NAS POST. Cursor stopped. No fourth transport.
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

## Owner instruction (binding)

Architect assignment above replaces the 17:22 ET stop. Cursor does not self-approve and does not pick another transport.

## Result

**Not resolved until live 200.** No Simulator/device photo add has returned **200** yet. First-run wizard still requires ≥2 photos.

## Ask of GPT Main

1. Review the failure chain and the files on PR #11 (`review/photo-upload`). Do not treat unit tests as E2E proof.
2. Decide the next **one** bounded slice. Cursor must not pick another transport.
3. Decide whether Expo Go is a valid photo-upload target, or whether a native `expo-dev-client` / TestFlight build is required (`getfkd-photo` is not in Expo Go).
4. Accept, request changes, or reassign. Cursor does not mark `accepted`.

Candidate slices for GPT to choose (Cursor must not start these):

- `EXPO_PUBLIC_USE_RN_FETCH=1` + Metro `-c` + `{uri,name,type}` on global RN fetch (official Expo 57 opt-out of `expo/fetch`)
- Native dev client so `getfkd-photo` and app ATS / URLSession behave like a real install
- Query-token on photo POST if the next live failure is still `401` after a request actually reaches NAS
- Declare Expo Go photo upload out of scope and change the owner test path

Do **not** raise `SESSIONS_PER_IP_HOUR`. Do **not** JPEG-transcode library picks (AM-017). Do **not** mint sessions on photo POST (AM-019).

## Environment

- Active client: Apple-first Expo SDK 57 / RN 0.86 at `apps/swipe/`
- Branch: `review/photo-upload`
- PRs: https://github.com/PeterJFrancoIII/swipe-dating/pull/11 · https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2
- Live API: `https://getfkd.sentineldefensetechnologies.co.za` (sibling repo `/Users/computer/App Development/swipe-dating-web-repo`, not the golden master)
- Test target: iPhone Simulator + **Expo Go 57** (`npx expo start --port 8082 --go`)
- Metro was aborted 2026-08-17 17:19 ET and restarted on 8082. Latest XHR change may not have been reloaded in Expo Go.
- Store IPA 7 is stale. No `eas submit`. No `apps/swipe/ios/` tree.

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
- That the current XHR path reaches NAS (owner asked for handoff before a confirmed reload + retry)
- That `File.bytes()` hang is the only remaining cause after 17:12 ET (Metro was then aborted)

## Current on-disk client path (`apps/swipe/lib/api.ts`)

Native (`Platform.OS !== "web"`):

1. `ensureToken()`; fail closed `401 session_required` if empty
2. `FormData` + `attachSessionField(form, token)`
3. Each file: if not `file:` / absolute path, `ImageManipulator.manipulateAsync(uri, [])` (20s timeout); append `{uri,name,type}` via `appendNativeFilePart`
4. `XMLHttpRequest` POST to `${API_URL}/api/profile/photos` — session header + form `session`, **no** `Content-Type`, 45s `xhr.timeout` + 50s `Promise.race`
5. Web still uses Blob + `expo/fetch`

`nativeMultipartUploadOptions` (`File.upload` options) is unused by `api.ts`.

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
- More Cursor transport retries without a new GPT assignment

## Related task records

- `2026-08-16-photo-upload-413.md`
- `2026-08-16-photo-upload-failed.md`
- `2026-08-16-heic-iphone14.md`
- `2026-08-16-heic-on-device.md`
- `2026-08-16-photo-session-rate-limit.md`

## Architect review

- Pending GPT Main.
