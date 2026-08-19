# Photo timeout / UX slice — GPT review

- **ID:** 2026-08-18-photo-timeout-ux
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Assigned:** 2026-08-18 15:14 ET — Timeout / UX only. RN-fetch ACCEPTED. Native URLSession NOT authorized.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-photo-timeout-ux.md
- **Parent brief:** [2026-08-18-gpt-photo-review.md](./2026-08-18-gpt-photo-review.md)

## What changed

RN-fetch multipart is **unchanged**: FormData, `{uri,name,type}`, `X-Swipe-Session`, form `session`, no manual `Content-Type`, `request()` → `reactNativeFetch()`.

1. Form timeout is **90s** (`FORM_UPLOAD_TIMEOUT_MS`), same envelope as JSON `AbortSignal.timeout(90_000)`. Message string unchanged (`Photo upload timed out. Try again.`).
2. Onboarding hydration always applies `payload.photos`. `nextOnboardingStep(missing_fields)` maps the first required gap. **`missing_fields: []` goes to `continue_extras`, not Sex.**
3. Successful upload still `setPhotos` + `setError(null)`. Continue stays enabled at ≥2 photos.

## Files changed

- `apps/swipe/lib/api.ts` — use 90s helper only; transport untouched
- `apps/swipe/lib/requestTimeout.ts` — new
- `apps/swipe/lib/requestTimeout.test.ts` — new
- `apps/swipe/lib/onboardingStep.ts` — new
- `apps/swipe/lib/onboardingStep.test.ts` — new
- `apps/swipe/components/OnboardingScreen.tsx` — hydrate + step
- `apps/swipe/package.json` — register the two new tests
- `.agent-memory/CURRENT.md`
- this file

## Validation evidence

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 41, pass 41, fail 0
```

Regressions included:

- form request lasting >25s does not time out (fake timers, 26s vs 90s envelope)
- 90s envelope still times out
- `hydrateOnboardingPhotos` keeps server slots
- `missing_fields=[]` → `continue_extras`, not `sex`
- ≥2 server photos satisfy Photos

## Live — Getfkd development client (not Expo Go)

Runtime: iPhone 17 Pro `7758A320-…`, `app.getfkd.ios`, Metro `EXPO_PUBLIC_USE_RN_FETCH=1 npx expo start --dev-client --port 8082 -c`.

### E — relaunch hydration (passed)

Before wiping photos, `GET /api/onboarding` was `photo_count: 2`, `missing_fields: []`. After kill/relaunch Getfkd:

- Screen: **Want to add more?** / **OPTIONAL** / Yes, keep editing · Not now
- Not Sex. Required flow treated as complete.

### C — two-photo upload this session (not complete)

To retest timeout, existing photos were removed via API (`photo_count` 0, `missing_fields: ['photos']`). Relaunch landed on **Photos · 9 of 9 · 0 added** (correct).

One picker attempt logged:

```
WARN  getfkd photo part file://…/8D22EFE2-….heic photo-1.heic image/heic
WARN  getfkd photo part file://…/5A2CED23-….jpeg IMG_0005.jpeg image/jpeg
```

NAS `docker logs --since 15m` in that window: removes **200**; **zero** `POST /api/profile/photos`. UI later showed **Photo upload timed out. Try again.** / **0 added**.

That is **not** last night’s accepted 200 (23:22:16Z). This attempt never reached uvicorn. Transport was not changed. Cursor did not start URLSession, Expo Go, XHR, or another JS transport.

Getfkd is left on the Photos step with 0 photos so the owner can pick two images on this same development client.

## Ask of GPT Main

- Accept the timeout + hydration code and unit tests, and the relaunch (E) evidence.
- C still needs one owner (or next) Getfkd picker run that produces NAS `POST /api/profile/photos` **200**, thumbnails, and Continue.
- Do not authorize URLSession from this incomplete C alone — last night already proved RN-fetch can 200 on this runtime.

Do not raise `SESSIONS_PER_IP_HOUR`. Do not JPEG-transcode (AM-017). Do not mint on photo POST (AM-019).

## Architect review

- Cursor: `ready_for_review` (2026-08-18 15:22 ET). Not self-accepted.
- Pending GPT Main.
