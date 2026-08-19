# Multi-select photo duplicate

- **ID:** 2026-08-18-photo-multi-pick-duplicate
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 17:27 ET — uploading 3 photos at once sometimes stores 2 unique + a duplicate of the first.
- **Review:** 2026-08-18 18:15 ET — REQUEST CHANGES. Fail closed on PHAsset stage failure; do not collapse unidentified URI collisions.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-photo-multi-pick-duplicate.md

## What

iOS PHPicker can reuse one ImagePicker cache URI for two different library items. Encode/upload then rereads the first file for the third slot. NAS allows same-account hash reuse, so it stores A, B, A.

## Fix after review

- Distinct `assetId`s survive a URI collision.
- Non-empty `assetId`: native `stagePickedPhoto` copies the PHAsset or throws. JS does not fall back to the picker URI.
- Missing `assetId` plus a repeated picker URI: throw `Couldn't reliably identify all selected photos; try selecting them individually.` Do not drop the extra pick.
- Photos recover-from-onboarding does not swallow that identity error.
- RN-fetch, one file per POST, HEIC, API, timeout unchanged.

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
# tests 61, pass 61, fail 0
```

New coverage: URI collision without `assetId` throws; library-id stage failure does not copy the picker URI and does not encode the failed pick.

## Ask of owner

Rebuild the Getfkd iOS development client so `stagePickedPhoto` is in the binary (required — an old binary now fails closed instead of copying the reused URI). Then pick A + B + C in one selection. Expect three distinct stored thumbnails. Live device result is not claimed here.
