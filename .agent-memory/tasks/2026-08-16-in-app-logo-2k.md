# Governed 2K in-app lockup

- **ID:** 2026-08-16-in-app-logo-2k
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Record the owner-placed 2K lockup as the governed brand source and regenerate Expo logo derivatives from that file only.

## Allowed files
- `00_Developer_Documents/Logo's & Marketing/`
- `00_Developer_Documents/README.md`
- `00_Developer_Documents/docs/operations/app-store-connect-preview-checklist.md`
- `apps/swipe/assets/images/`
- `apps/swipe/scripts/render_logo.py`
- `apps/swipe/components/GetFkdLogo.tsx`
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- UniFFI `apps/ios` / `apps/android`
- NAS / API deploy (client assets only)

## Acceptance criteria
- Governed source exists at `00_Developer_Documents/Logo's & Marketing/GetFk'd_In-App_Logo_2k_10bit.png`
- Expo `logo.png` / icons / splash / favicon are derivatives of that file
- Age gate and sign-in do not stack a second italic "Get fk'd" text wordmark
- No store submit

## Implementation summary
- Owner placed and renamed the 2K 10-bit lockup under `Logo's & Marketing/`
- Folder README names that file as the in-app source of truth
- `render_logo.py` reads only that path, knocks out near-black, trims, writes 800-max `logo.png` and blush-backed icons
- `GetFkdLogo` aspect is `632 / 800` to match the trimmed derivative
- Checklist and developer-docs index point at the governed file

## Files changed
- `00_Developer_Documents/Logo's & Marketing/GetFk'd_In-App_Logo_2k_10bit.png` (owner-placed; not agent-authored)
- `00_Developer_Documents/Logo's & Marketing/README.md`
- `00_Developer_Documents/README.md`
- `00_Developer_Documents/docs/operations/app-store-connect-preview-checklist.md`
- `apps/swipe/scripts/render_logo.py`
- `apps/swipe/assets/images/logo.png`
- `apps/swipe/assets/images/icon.png`
- `apps/swipe/assets/images/splash-icon.png`
- `apps/swipe/assets/images/favicon.png`
- `apps/swipe/assets/images/android-icon-foreground.png`
- `apps/swipe/assets/images/android-icon-background.png`
- `apps/swipe/assets/images/android-icon-monochrome.png`
- `apps/swipe/components/GetFkdLogo.tsx`
- `.agent-memory/CURRENT.md`, `DECISIONS.md` (AM-014), this task

## Validation evidence
- Source: `GetFk'd_In-App_Logo_2k_10bit.png` — 1542502 bytes, 2752×1536 RGBA
- `python3 scripts/render_logo.py` → lockup `(632, 800)` from `GetFk'd_In-App_Logo_2k_10bit.png`
- `logo.png` RGBA, alpha 0–255, corners `(0,0,0,0)`, 201076 fully transparent of 505600
- `cd "/Users/computer/App Development/Swipe Dating/apps/swipe" && npx tsc --noEmit && npm test` → **13 passed**, 0 failed
- No `eas submit`. Golden master not edited. NAS not deployed.

## Blockers / questions
- Expo Go still shows the Expo home-screen icon. The lockup is visible inside the app after reload.
- Store IPA 7 does not include this mark.
- Shared memory `CONTEXT.md` / `CURSOR_IDE_AGENT_UPDATE.md` still say no product task; user instruction and this file win.

## Architect review
- 
