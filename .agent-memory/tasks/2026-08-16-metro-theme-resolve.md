# Metro cannot resolve @/lib/theme

- **ID:** 2026-08-16-metro-theme-resolve
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Restore Expo bundling after `@/lib/theme` failed to resolve.

## Allowed files
- `apps/swipe/babel.config.js`
- `apps/swipe/metro.config.js`
- `apps/swipe/tsconfig.json`
- `.agent-memory/CURRENT.md` and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- UniFFI `apps/ios` / `apps/android`

## Acceptance criteria
- Metro resolves `@/lib/theme`
- Simulator can reload without the RCTFatal module error
- No store submit

## Implementation summary
- `lib/theme.ts` was present. Metro on 8082 had been running ~2 days and failed to resolve `@/`.
- Added the standard Expo `babel.config.js` and `metro.config.js`.
- Restarted that same Metro on 8082 with `--clear` (did not start a second server).

## Files changed
- `apps/swipe/babel.config.js`
- `apps/swipe/metro.config.js`
- `.agent-memory/CURRENT.md`
- this task file

## Validation evidence
- iOS entry bundle HTTP 200, 6.5 MB, contains theme tokens and `components/Screen.tsx`
- Metro: `iOS Bundled 2431ms node_modules/expo-router/entry.js (1370 modules)`
- `npx tsc --noEmit` → exit 0
- No `eas submit`. Golden master not edited.

## Blockers / questions
- Reload Expo Go / the simulator against port 8082.

## Architect review
- 
