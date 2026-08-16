# Convert profile photos to HEIC on the phone before upload

- **ID:** 2026-08-16-heic-on-device
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** The phone converts each picked photo to HEIC (1080×2400, no GPS) before `POST /api/profile/photos`.

## Allowed files
- `apps/swipe/modules/getfkd-photo/**`
- `apps/swipe/lib/photoGeometry.ts`
- `apps/swipe/lib/photoUpload.ts`
- `apps/swipe/lib/photoUpload.test.ts`
- `apps/swipe/package.json`
- `apps/swipe/package-lock.json`
- `00_Developer_Documents/docs/architecture/adr-0007-media-codecs.md`
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`

## Acceptance criteria
- iOS native path writes HEIC before upload
- Helpers are unit-tested
- No store submit

## Implementation summary
- `GetfkdPhoto.encodeProfileHeic` resizes to the 1080×2400 box and writes HEIC with ImageIO (no GPS).
- `preparePhotoUploads` uses that encoder when the native module is present.
- Expo Go cannot load a new native module; it still uploads the original and the server converts.

## Files changed
- `apps/swipe/modules/getfkd-photo/**`
- `apps/swipe/lib/photoGeometry.ts`
- `apps/swipe/lib/photoUpload.ts`
- `apps/swipe/lib/photoUpload.test.ts`
- `apps/swipe/package.json`
- `apps/swipe/package-lock.json`
- `00_Developer_Documents/docs/architecture/adr-0007-media-codecs.md`
- `.agent-memory/DECISIONS.md` (AM-018)
- `.agent-memory/CURRENT.md`
- this task file

## Validation evidence
- `cd apps/swipe && npm install && npx tsc --noEmit && npm test` → **24 passed**
- No `eas submit`. Golden master not edited.

## Blockers / questions
- On-device HEIC encode needs a native rebuild (`npx expo run:ios` / existing dev client). Expo Go will not include `GetfkdPhoto`.

## Architect review
- 
