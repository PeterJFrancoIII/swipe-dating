# Real-data-only discovery

- **ID:** 2026-08-16-real-data-only-discovery
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Remove fake dating profiles from the product. Discovery uses only real onboarded accounts. App Store submit stays blocked.

## Allowed files
- Live API sibling `swipe-dating-web-repo` (not golden master)
- `apps/swipe/` empty-deck copy and unused synthetic deck
- `.agent-memory/CURRENT.md` and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- Store review buttons

## Acceptance criteria
- Product `create_web_app()` / NAS path does not inject `SYNTHETIC_PROFILES`
- Session restore does not re-attach fixture profiles
- Two live onboarded accounts see each other; one account sees an empty deck
- Tests may opt in to fixtures via `create_test_app`
- No store submit

## Implementation summary
- `ResearchSession` and `BrowserSessionStore` default to an empty fixture deck
- `restore_session(..., profiles=())` so NAS restarts do not re-attach Alex/Jordan/Morgan/Riley/Casey
- Integration tests that still need p1 use `create_test_app`
- Expo unused `SYNTHETIC_DECK` removed; empty copy says only real members appear
- App Store submit not performed

## Files changed
- `swipe-dating-web-repo/src/swipe_dating/application/session.py`
- `swipe-dating-web-repo/src/swipe_dating/adapters/sqlite_control.py`
- `swipe-dating-web-repo/src/swipe_dating/web/app.py`
- `swipe-dating-web-repo/src/swipe_dating/web/templates/discover.html`
- `swipe-dating-web-repo/tests/onboarding_support.py`
- `swipe-dating-web-repo/tests/unit/test_session.py`
- `swipe-dating-web-repo/tests/unit/test_sqlite_control.py`
- `swipe-dating-web-repo/tests/integration/test_mobile_api.py`
- `swipe-dating-web-repo/tests/integration/test_web.py`
- `swipe-dating-web-repo/tests/integration/test_operator_console.py`
- `apps/swipe/lib/deck.ts`
- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/app/(tabs)/matches.tsx`
- `.agent-memory/CURRENT.md`
- this task file

## Validation evidence
- `uv run pytest tests/unit tests/integration tests/property -q` in swipe-dating-web-repo → **284 passed**
- `npx tsc --noEmit` + `npm test` in `apps/swipe` → **10 passed**
- NAS deploy `NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh` exit 0
- Live `GET /api/health` → 200 `{"status":"ok","client":"expo"}`
- Live discover pack IDs were all `live:…`; `any_fixture=False`; no Alex/Jordan/Morgan/Riley/Casey
- Protected containers still Up. No `eas submit`. Golden master not edited.

## Blockers / questions
- App Store launch still requires a human `eas submit` and Submit for Review. Agent will not click those.
- `approvals/` empty. Legal still Draft — not in force.
- Existing NAS accounts without a stored display name show as `Member`. Those are real accounts, not fixture cards.

## Architect review
- Pending Codex. Cursor does not self-approve.
