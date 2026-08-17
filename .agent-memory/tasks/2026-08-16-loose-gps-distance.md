# Loose GPS distance with anti-spoof fail-closed

- **ID:** 2026-08-16-loose-gps-distance
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Show rounded mile bands from Apple reduced-accuracy GPS, server-jittered 1 mile, fail closed on spoof. No peer coordinates.

## Allowed files
- `00_Developer_Documents/docs/architecture/adr-0022-loose-gps-distance.md`
- `00_Developer_Documents/docs/architecture/dependency-register.md`
- Live API sibling `swipe-dating-web-repo` (not golden master)
- `apps/swipe/`
- `.agent-memory/CURRENT.md` and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`

## Implementation summary
- ADR-0022 accepted by user instruction
- `POST /api/location` validates native flags, rejects teleport/stale/spoof, stores only a 1-mile jittered cell
- Discover/chat expose `distance_label` only (About 1/5/15 miles, Farther, Distance unavailable)
- Expo: `expo-location` + `getfkd-location` native `isSimulatedBySoftware`; swipe focus sync, 15-minute throttle
- Swipe works if GPS is denied

## Files changed
- ADR-0022, dependency-register
- `swipe-dating-web-repo` domain/session/sqlite/mobile_api/legal + tests
- `apps/swipe` location module, distance labels, swipe/chat cards, app.json, legal draft

## Validation evidence
- `uv run pytest tests/unit tests/integration tests/property -q` → **291 passed**
- `npx tsc --noEmit` + `npm test` in `apps/swipe` → **10 passed**
- NAS deploy exit 0; `POST /api/location` live (fail-closed without a session)
- No `eas submit`. Golden master not edited.

## Blockers / questions
- GPS authenticity cannot be proven. Common simulator/GPX/mock cases fail closed.
- Store IPA still needs a human rebuild if this client should ship; agent will not submit.

## Architect review
- Pending Codex. Cursor does not self-approve.
