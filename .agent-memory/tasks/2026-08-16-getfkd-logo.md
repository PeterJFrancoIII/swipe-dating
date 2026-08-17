# Get fk'd logo: owner Gemini lockup

- **ID:** 2026-08-16-getfkd-logo
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Use the owner-supplied Gemini lockup (`GetFk'd` wordmark + mark) as the in-app logo, splash, favicon, and app icons.

## Allowed files
- `apps/swipe/assets/images/`
- `apps/swipe/scripts/render_logo.py`
- `apps/swipe/components/GetFkdLogo.tsx`
- `apps/swipe/components/AgeGateScreen.tsx`
- `apps/swipe/components/SignInScreen.tsx`
- `apps/swipe/components/TopChrome.tsx`
- `apps/swipe/app/_layout.tsx`
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- UniFFI `apps/ios` / `apps/android`

## Acceptance criteria
- Age gate, sign-in, swipe chrome, splash, and app icons use the owner lockup
- Duplicate italic "Get fk'd" text is not stacked on top of the wordmark
- No store submit

## Implementation summary
- Copied the owner JPG to `assets/images/logo-source.jpg`
- `render_logo.py` trims the near-white canvas and writes PNG derivatives
- In-app `logo.png` is the full lockup; icon/splash/favicon sit on blush `#FFF0F4`
- `GetFkdLogo` uses the lockup aspect ratio instead of a square crop
- Age gate and sign-in no longer repeat the wordmark in text

## Files changed
- `apps/swipe/scripts/render_logo.py`
- `apps/swipe/assets/images/logo-source.jpg`
- `apps/swipe/assets/images/logo.png`
- `apps/swipe/assets/images/icon.png`
- `apps/swipe/assets/images/splash-icon.png`
- `apps/swipe/assets/images/favicon.png`
- `apps/swipe/assets/images/android-icon-foreground.png`
- `apps/swipe/assets/images/android-icon-background.png`
- `apps/swipe/assets/images/android-icon-monochrome.png`
- `apps/swipe/components/GetFkdLogo.tsx`
- `apps/swipe/components/AgeGateScreen.tsx`
- `apps/swipe/components/SignInScreen.tsx`
- `apps/swipe/components/TopChrome.tsx`
- `apps/swipe/app/_layout.tsx`
- `.agent-memory/CURRENT.md`, `DECISIONS.md` (AM-012), this task
- removed stale `apps/swipe/assets/images/logo.svg`

## Validation evidence
- `cd "/Users/computer/App Development/Swipe Dating/apps/swipe" && npx tsc --noEmit && npm test` → **13 passed**, 0 failed
- No `eas submit`. Golden master not edited.

## Blockers / questions
- Expo Go still shows the Expo home-screen icon. The new lockup is visible inside the app after reload. A store/dev-client build is required before the iOS icon changes.
- Store IPA 7 does not include this mark.

## Architect review
- 
