# App Store Connect upload pack (screenshots + paste)

- **ID:** 2026-08-20-asc-upload-pack
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-20 16:26 ET — take 6.7" screenshots and place listing/nutrition/17+ in a directory for human upload.

## Bound

Create an upload folder with 1290×2796 screenshots (Age gate, Swipe, Matches, chat, Profile) and paste-ready listing, privacy nutrition, and 17+ answers. Do **not** `eas submit`. Do **not** click App Store Connect. Sample adults only.

## Forbidden

- `eas submit` / Submit for Review
- Fabricated `approvals/`
- Golden master edits
- Other people’s real faces
- Self-accept

## Files changed

- `00_Developer_Documents/docs/operations/app-store-connect-upload/` (paste pack + 5 PNGs)
- `apps/swipe/lib/testingCard.ts` (hide FAKE banner when `isInternalDogfoodBuild()` is false, including `EXPO_PUBLIC_STORE_SCREENSHOTS=1`)

## Screenshots (all 1290 × 2796)

| File | Screen | Notes |
|---|---|---|
| `screenshots/ios-6.7/01-age-gate.png` | Age gate | Store gate, no birthday wheels, no Expo chrome |
| `screenshots/ios-6.7/02-swipe.png` | Swipe | Synthetic Riley; no FAKE banner |
| `screenshots/ios-6.7/03-matches.png` | Matches | Synthetic Alex |
| `screenshots/ios-6.7/04-chat.png` | Chat | Public-place coffee line |
| `screenshots/ios-6.7/05-profile.png` | Profile | Owner photos are nature, no other people’s faces |

## Evidence

```
sips -g pixelWidth -g pixelHeight …/screenshots/ios-6.7/*.png
# each: pixelWidth 1290 pixelHeight 2796

cd apps/swipe && node --experimental-strip-types --test lib/testingCard.test.ts lib/storeBuild.test.ts
# tests 4, pass 4, fail 0
```

Captured on iPhone 16 Plus / iOS 26.5 simulator (`Getfkd-67`). Not submitted. Agent did not click App Store Connect.
