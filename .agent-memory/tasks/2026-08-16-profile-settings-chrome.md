# Profile photo chrome, gear settings, quiz on profile

- **ID:** 2026-08-16-profile-settings-chrome
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Quiz lives on Profile settings. Chrome uses a small round main photo for profile and a gear for Settings.

## Allowed files
- `apps/swipe/components/TopChrome.tsx`
- `apps/swipe/app/profile.tsx`
- `apps/swipe/app/filters.tsx`
- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/app/(tabs)/matches.tsx`
- `apps/swipe/lib/session.tsx`
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- UniFFI `apps/ios` / `apps/android`

## Acceptance criteria
- Compatibility quiz button is on Profile settings, not Swipe/Matches chrome
- Profile entry is the user's main photo, round and smaller
- Settings entry is a gear icon
- No store submit

## Implementation summary
- Top chrome: 36px round main photo → `/profile`; gear → `/filters` (Settings)
- Profile settings shows a round 88px main photo and the quiz button at the top
- Quiz chips removed from Swipe and Matches
- Session keeps `selfPhotoUrl` from `/api/profile`

## Files changed
- `apps/swipe/components/TopChrome.tsx`
- `apps/swipe/app/profile.tsx`
- `apps/swipe/app/filters.tsx`
- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/app/(tabs)/matches.tsx`
- `apps/swipe/lib/session.tsx`
- `.agent-memory/CURRENT.md`, `DECISIONS.md` (AM-013), this task

## Validation evidence
- `cd "/Users/computer/App Development/Swipe Dating/apps/swipe" && npx tsc --noEmit && npm test` → **13 passed**, 0 failed
- No `eas submit`. Golden master not edited.

## Blockers / questions
- None

## Architect review
- 
