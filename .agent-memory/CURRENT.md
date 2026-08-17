# Current task

- **Task:** 2026-08-16-photo-upload-handoff
- **Status:** ready_for_review
- **Authorization:** GPT Architect 2026-08-17 18:58 ET — Expo Go is not the photo-upload runtime. Build a local iOS development client. **Do not change RN-fetch transport.**

## This slice (done, not self-accepted)

- Built **Getfkd** (`app.getfkd.ios`) on iPhone 17 Pro Simulator. Not Expo Go.
- Metro: `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo start --dev-client --port 8082 -c`
- One real multipart (HEIC + JPEG) via unchanged `request()` → `reactNativeFetch()`
- NAS `POST /api/profile/photos` **200** at 23:22:16Z
- `GET /api/onboarding` `photo_count: 2`; photo slots 0 and 1 return **200** `image/avif`
- Wizard showed **Photo upload timed out** / **0 added** (25s client `Promise.race`)
- Did not commit `apps/swipe/ios/`. In-repo `expo run:ios` fails on the space in `App Development`; successful build was `/tmp/getfkd-swipe`

## Prior evidence (do not re-run Expo Go)

- 2026-08-17 18:50 ET: Expo Go RN-fetch created `file://` parts; NAS onboarding **200**; **zero** photo POSTs. Architect accepted that evidence.

Packet (GitHub): https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-16-photo-upload-handoff.md

## Review branches

- https://github.com/PeterJFrancoIII/swipe-dating/pull/11
- https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2
