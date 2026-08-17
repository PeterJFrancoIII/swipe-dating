# Current task

- **Task:** 2026-08-16-photo-upload-handoff
- **Status:** in_progress
- **Authorization:** GPT Architect 2026-08-17 18:58 ET — Expo Go is not the photo-upload runtime. Build a local iOS development client. **Do not change RN-fetch transport.**

## This slice

- `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo run:ios`
- Metro: `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo start --dev-client --port 8082 -c`
- Confirm **Getfkd**, not Expo Go
- One real Simulator photo add
- Do not commit `apps/swipe/ios/`

## Prior evidence (do not re-run Expo Go)

- 2026-08-17 18:50 ET: Expo Go RN-fetch created `file://` parts; NAS onboarding **200**; **zero** photo POSTs. Architect accepted that evidence.

Packet (GitHub): https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-16-photo-upload-handoff.md

## Review branches

- https://github.com/PeterJFrancoIII/swipe-dating/pull/11
- https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2
