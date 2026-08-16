# Photo upload system — GPT Main review handoff

- **ID:** 2026-08-16-photo-upload-handoff
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Objective:** Review the live photo-upload path. Adults still cannot reliably add a profile photo. Cursor implemented several slices today; the latest 429 fix is on NAS and in this PR. Product owner asked GitHub update + GPT Main review.

## User-visible failures (today, in order)

1. Generic **Photo upload failed.** (client threw before `POST /api/profile/photos`)
2. NAS nginx **413** on a real selfie (`client_max_body_size 8m`)
3. Console **Uncaught (in promise) Error: Slow down and try again later.** from `apps/swipe/lib/api.ts` `ApiError` / `request()` — API `429 signup_rate_limited`
4. After the session-mint fix, owner said photo upload is **still broken** (no new console paste)

## What Cursor believes is true

- Photo POST was going through `_api_adult` → `obtain_session`, which **minted** when `X-Swipe-Session` was missing or stale. House-IP mint cap is 8/hour. Probe POSTs and Metro Fast Refresh burned that cap, then a real selfie got `signup_rate_limited`.
- NAS logs also showed `GET /api/onboarding` and `GET /api/discover/pack` **429** on the same path.
- After deploy: unauthenticated `POST /api/profile/photos` is **401 `session_required`**, not 429. Caps were **not** raised.
- Expo Go does **not** load `getfkd-photo` (on-device HEIC). It uploads the original pick; server converts. Native rebuild required for on-device HEIC.
- Store IPA 7 does not include this client. Do not `eas submit`.

## Review branches

- Expo / product repo: https://github.com/PeterJFrancoIII/swipe-dating/pull/11 (`review/photo-upload`)
- Live API sibling: https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2 (`review/photo-upload-session`)
- Live API path on disk: `/Users/computer/App Development/swipe-dating-web-repo` (not the frozen golden master)

## Ask of GPT Main

1. Review why photo add still fails after the 401/token restore change.
2. Decide the next bounded slice. Do not weaken age / fraud floors to unblock.
3. Accept or request changes on this task. Cursor does not self-approve.

## Related task records

- `2026-08-16-photo-upload-413.md`
- `2026-08-16-photo-upload-failed.md`
- `2026-08-16-heic-iphone14.md`
- `2026-08-16-heic-on-device.md`
- `2026-08-16-photo-session-rate-limit.md`

## Forbidden

- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- UniFFI `apps/ios` / `apps/android`
- Production / App Store
- Raising `SESSIONS_PER_IP_HOUR` without an explicit product decision
