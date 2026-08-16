# Photo upload failed during onboarding

- **ID:** 2026-08-16-photo-upload-failed
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Restore first-party photo add after the client showed “Photo upload failed.”

## Allowed files
- `apps/swipe/lib/photoUpload.ts`
- `apps/swipe/lib/photoGeometry.ts`
- `apps/swipe/lib/photoUpload.test.ts`
- `apps/swipe/lib/api.ts`
- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/app/profile.tsx`
- `.agent-memory/CURRENT.md` and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- UniFFI `apps/ios` / `apps/android`

## Acceptance criteria
- A library pick still uploads if JPEG resize throws
- The user sees the real failure text, not only “Photo upload failed.”
- No store submit

## Implementation summary
- Live API never saw `POST /api/profile/photos` while onboarding/location succeeded. The onboarding toast is the client catch-all, so resize/network threw before a mapped API error.
- `preparePhotoUploads` now sends the original pick if `manipulateAsync` throws.
- `request()` maps fetch failures to `ApiError` and ignores invalid JSON bodies.
- Web uploads append a real Blob.

## Files changed
- `apps/swipe/lib/photoUpload.ts`
- `apps/swipe/lib/photoGeometry.ts`
- `apps/swipe/lib/photoUpload.test.ts`
- `apps/swipe/lib/api.ts`
- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/app/profile.tsx`
- `.agent-memory/CURRENT.md`
- this task file

## Validation evidence
- NAS `docker logs --since 2h`: GET `/api/onboarding`, POST `/api/location`; no POST `/api/profile/photos`
- `cd apps/swipe && npx tsc --noEmit && npm test` → **23 passed**, 0 failed
- No NAS redeploy. No `eas submit`. Golden master not edited.

## Blockers / questions
- Reload Expo Go so the fallback is in the bundle. If it still fails, the toast should now show the real network/API text.

## Architect review
- 
