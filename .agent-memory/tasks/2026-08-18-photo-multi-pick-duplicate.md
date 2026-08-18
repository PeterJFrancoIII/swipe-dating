# Multi-select photo duplicate

- **ID:** 2026-08-18-photo-multi-pick-duplicate
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 17:27 ET — uploading 3 photos at once sometimes stores 2 unique + a duplicate of the first.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-photo-multi-pick-duplicate.md

## What

iOS PHPicker can reuse one ImagePicker cache URI for two different library items. Encode/upload then rereads the first file for the third slot. NAS allows same-account hash reuse, so it stores A, B, A.

## Fix

- Keep distinct `assetId`s even when `uri` collides.
- Stage each pick to a unique file before HEIC encode. Native path copies the PHAsset by `assetId`. Metro fallback copies the picker file.
- Photos / Profile unique the list before the progress meter starts.

RN-fetch, one file per POST, no JPEG transcode, no API change.

## Files

- `apps/swipe/lib/photoUpload.ts`
- `apps/swipe/lib/photoGeometry.ts`
- `apps/swipe/lib/photoUpload.test.ts`
- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/app/profile.tsx`
- `apps/swipe/modules/getfkd-photo/src/GetfkdPhotoModule.ts`
- `apps/swipe/modules/getfkd-photo/ios/GetfkdPhotoModule.swift`
- `apps/swipe/modules/getfkd-photo/ios/GetfkdPhoto.podspec`
- this packet, `.agent-memory/CURRENT.md`

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tsc exit 0
# tests 56, pass 56, fail 0
```

## Ask of owner

Reload Metro for the JS copy. Rebuild the Getfkd iOS development client so `stagePickedPhoto` is in the binary, then pick three different photos at once. Expect three distinct thumbnails, not a repeat of the first.
