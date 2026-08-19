# Fail-closed fraudulent signup

- **ID:** 2026-08-16-fail-closed-signup
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Fail closed when signup looks automated or duplicated. App Attest deferred. Community Bot Hunter unchanged.

## Allowed files
- `00_Developer_Documents/docs/architecture/adr-0023-fail-closed-signup.md`
- `00_Developer_Documents/docs/architecture/dependency-register.md`
- Live API sibling `swipe-dating-web-repo` (not golden master)
- `apps/swipe/`
- `.agent-memory/CURRENT.md` and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`

## Implementation summary
- ADR-0023: strict NAS/store vs relaxed tests; opaque error copy; IP is a velocity bucket only
- SQLite schema 5: `signup_events`, `photo_hashes`, `accounts.signup_locked`
- Strict finish requires Apple bind; too-fast (<45s), birth-date change, photo reuse, and velocity caps fail closed
- Locked accounts hidden from `live_profiles()`
- Expo sends `X-Getfkd-Install`; shows opaque signup errors
- nginx passes `CF-Connecting-IP`
- Get Fk'd exact-location map recorded as Phase 5 only; not built

## Files changed
- ADR-0023, dependency-register
- `swipe-dating-web-repo` domain/signup_fraud, signup_guard, sqlite, session, mobile_api, app.py, nginx, tests
- `apps/swipe` installId, signupErrors, api headers, session copy
- `.agent-memory/CURRENT.md` and this task

## Validation evidence
- `uv run pytest tests/unit tests/integration tests/property -q` → **302 passed**
- `npx tsc --noEmit` + `npm test` in `apps/swipe` → **13 passed**
- NAS deploy exit 0; health 200 `{"status":"ok","client":"expo"}`; sqlite version `5`; tables `signup_events`, `photo_hashes`
- Live headerless finish after age + 2 photos → **401 `apple_sign_in_required`**, `onboarding_complete: false`
- Protected containers still Up. No `eas submit`. Golden master not edited.

## Blockers / questions
- App Attest still deferred. We cannot prove a human.
- Exact location remains forbidden except future mutual Get Fk'd Matching on the in-app map.

## Architect review
- 
