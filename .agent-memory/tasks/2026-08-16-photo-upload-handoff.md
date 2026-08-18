# Photo upload system — evidence appendix

**GPT start here (2026-08-18):** [2026-08-18-gpt-photo-review.md](./2026-08-18-gpt-photo-review.md)

- **ID:** 2026-08-16-photo-upload-handoff
- **Status:** ready_for_review (appendix; do not treat as the current ask)
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

## 2026-08-17 19:22 ET — development-client RN-fetch slice (ready_for_review)

Expo Go is **not** the runtime. Transport was **not** changed (`4258b40` `request()` → `reactNativeFetch()`).

### Runtime

- Built **Getfkd** development client (`app.getfkd.ios`, display name Getfkd).
- Installed on iPhone 17 Pro Simulator `7758A320-E896-4BAF-8C5F-3321620F4F97`.
- Metro: `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo start --dev-client --port 8082 -c` from `apps/swipe`.
- Launcher UI: **Getfkd / Development Build**, server `http://172.20.20.20:8082`. Not Expo Go (`host.exp.Exponent` remains installed but was not the foreground app).
- `apps/swipe/ios/` from a failed in-repo build is local CNG; **not committed**. Successful native build used `/tmp/getfkd-swipe` (see build note).

### One real upload

Metro (Getfkd client, not Expo Go):

```
WARN  getfkd photo part file://…/ImagePicker/8327475D-….heic photo-1.heic image/heic
WARN  getfkd photo part file://…/ImagePicker/F07315E7-….jpeg IMG_0005.jpeg image/jpeg
```

NAS `docker logs --timestamps` same window (`172.30.81.3`):

| UTC | Request | Status |
|---|---|---|
| 23:21:16 | `GET /api/bootstrap` | 200 |
| 23:21:20 | `POST /api/age-gate` | 200 |
| 23:21:20 | `GET /api/onboarding` | 200 |
| 23:21:22–23:21:34 | `POST /api/onboarding` ×7 | 200 |
| **23:22:16** | **`POST /api/profile/photos`** | **200** |

Follow-up authenticated reads (same session, token not stored here):

- `GET /api/onboarding` → **200**, `photo_count: 2`, `photos: [{slot:0},{slot:1}]`, `missing_fields: []`
- `GET /api/profile/photos/0` → **200** `image/avif` 898615 bytes
- `GET /api/profile/photos/1` → **200** `image/avif` 605655 bytes

### Client UI vs server

- During the POST the wizard showed **Uploading photos…**, then **Photo upload timed out. Try again.** and **Add at least 2 photos. 0 added.**
- Cause: current 25s `Promise.race` on form posts. NAS logged the 200 at 23:22:16Z, ~25s after the multipart left the device. Server finished; client abandoned the response.
- One multipart with 2 parts satisfied the 2-photo requirement **on the server**. Wizard did not apply `setPhotos` because it timed out first.
- After relaunch, `missing_fields` is empty so the wizard stays on Sex (step 2 of 9) even though `payload.photos` is length 2. Thumbnails were not re-shown in this session.

### Build note (path spaces — not a transport change)

`npx expo run:ios` from `/Users/computer/App Development/Swipe Dating/apps/swipe` failed twice:

1. `Pods/EXConstants` `[CP-User] Generate app.config` → `No such file or directory: /Users/computer/App` (`bash -l -c` splits on the space).
2. After quoting that phase: `Bundle React Native code and images` → same `/Users/computer/App` split.

Successful build: rsync `apps/swipe` (no `ios/`) to `/tmp/getfkd-swipe`, then `CI=1 EXPO_PUBLIC_USE_RN_FETCH=1 npx expo run:ios --device 7758A320-… --no-bundler`. **Build Succeeded.** Installed `Getfkd.app`. Do not commit `/tmp/getfkd-swipe` or `apps/swipe/ios/`.

### Stop conditions

- A (401): **did not fire**
- B (other non-200): **did not fire**
- C (zero POSTs): **did not fire** — POST reached NAS

Cursor did not switch to Expo Go, XHR, expo/fetch, `File.upload()`, Blob/ArrayBuffer, query-token, or API changes.

## Owner instruction (binding)

18:58 ET architect assignment. Cursor does not self-approve and does not pick another transport.

## Result

**NAS 200 on the Getfkd development client. `photo_count` is 2.** Wizard still showed a 25s client timeout and “0 added.” Transport unchanged. Ready for GPT review — not self-accepted.

## Ask of GPT Main

RN-fetch multipart **does** leave the development client and returns **200**. Remaining product gap is the 25s client timeout vs HEIC convert latency, plus the wizard not jumping to Photos when `missing_fields` is empty. Cursor did not change timeout or onboarding. If GPT wants a next slice, assign it. Do not raise `SESSIONS_PER_IP_HOUR`. Do not JPEG-transcode library picks (AM-017). Do not mint sessions on photo POST (AM-019).

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
| 2026-08-17 17:12 ET | **Uploading photos…** forever again | `expo/fetch` `convertFormDataAsync` calls `File.bytes()` and buffers the body **before** `request.start()`, so `AbortSignal.timeout(90s)` never fires. No Metro error. No NAS POST. | Historical next-step was XHR (later used, then abandoned). **Not current.** |
| 2026-08-17 17:22 ET | Owner: hand to GPT. Not resolved. | Latest XHR path has **no owner confirmation** and **no live 200**. XHR already failed once (2026-08-16). | **Stop.** |
| 2026-08-17 18:50 ET | still not uploading (Expo Go) | Real `file://` parts; NAS onboarding **200**; **zero** photo POSTs | Architect: leave Expo Go; build Getfkd dev client |
| 2026-08-17 19:22 ET | **Photo upload timed out. Try again.** / **0 added** | Getfkd dev client. NAS `POST /api/profile/photos` **200** at 23:22:16Z. `photo_count` **2**. Client 25s `Promise.race` lost the race. | **Stop.** No transport change. GPT reviews. |

## What is proven

- `curl https://getfkd.sentineldefensetechnologies.co.za/api/health` → **200** `{"status":"ok","client":"expo"}`
- Unauth `POST /api/profile/photos` → **401 `session_required`** (does not mint)
- Fresh token + form-only `session` → **401 `adult_gate_required`** (field is read)
- Same token + header-only → **401 `adult_gate_required`**
- JSON `POST /api/getfkd` and `/api/location` from the same Simulator session → **200**
- Device/Simulator photo POSTs on NAS (72h snapshot **before** 19:22 ET on 2026-08-17): **5 total, 0× 200, 5× 401**. Superseded by the 19:22 ET development-client **200**.
- Expo Go does not load `getfkd-photo`. Server converts HEIC. Native rebuild required for on-device encode (AM-016 / module note).
- `cd apps/swipe && npx tsc --noEmit && npm test` → **32 passed**, 0 failed (2026-08-17 17:15 ET)
- **2026-08-17 19:22 ET Getfkd development client:** `POST /api/profile/photos` **200**; `GET /api/onboarding` `photo_count: 2`; `GET /api/profile/photos/0` and `/1` **200** `image/avif`

## What is not proven

- That the wizard **displayed** the uploaded images after this POST (client 25s timeout showed “0 added”; relaunch stayed on Sex because `missing_fields` is empty)
- That Expo Go RN-fetch can reach NAS (still zero POSTs from Expo Go)

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

- `.agent-memory/CURRENT.md`
- this task file

No client/API code change. Transport remains commit `4258b40`. Generated `apps/swipe/ios/` and `/tmp/getfkd-swipe` are local only.

Last published client commit on this branch: `4258b40` *Publish the RN-fetch photo-upload failure packet to shared memory.* Packet-only follow-up: `29b1d8b`.

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

- Cursor: `ready_for_review` (2026-08-17 19:25 ET). Do not self-accept.
- Pending GPT Main.
