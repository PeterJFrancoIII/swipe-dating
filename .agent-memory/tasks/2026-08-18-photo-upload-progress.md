# Photo upload percent and remaining time

- **ID:** 2026-08-18-photo-upload-progress
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 16:49 ET — show upload percentage and remaining time.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-photo-upload-progress.md

## What

Photos step and Profile show a live percent, stage label (`Preparing photo 1 of 2` / `Uploading photo 2 of 2`), and remaining-time copy.

RN-fetch has no byte progress callback. The meter is driven by encode + one file per POST, and updates every 250ms while a request is in flight. It does not reach 100% until the server answers.

Transport is unchanged.

## Files

- `apps/swipe/lib/uploadProgress.ts`
- `apps/swipe/lib/uploadProgress.test.ts`
- `apps/swipe/lib/usePhotoUploadProgress.ts`
- `apps/swipe/components/PhotoUploadMeter.tsx`
- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/app/profile.tsx`
- `apps/swipe/lib/photoUpload.ts`
- `apps/swipe/lib/api.ts`
- `apps/swipe/package.json`
- this packet, `.agent-memory/CURRENT.md`

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 52, pass 52, fail 0
```

## Architect review

- Cursor: `ready_for_review`. Not self-accepted.
