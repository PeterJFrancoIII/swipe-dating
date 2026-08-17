# Daily free swipe cap

- **ID:** 2026-08-16-daily-swipe-cap
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Enforce the existing 30 free swipes/day cap (PRODUCT_SCOPE / ADR-0017). Do not lock the account. Do not paywall the 30. Also stop HTML discover/chat from showing exact km.

## Allowed files
- Live API sibling `swipe-dating-web-repo` (domain, session, sqlite, mobile_api, app.py, templates, tests)
- `apps/swipe/` discover chrome + `lib/types.ts`
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- App Attest / CAPTCHA
- Community auto-ban
- UniFFI `apps/ios` / `apps/android`

## Acceptance criteria
- 31st like/pass in a day returns `daily_swipe_limit` and does not record the decision
- Undo of a non-match refunds one swipe
- New calendar day resets the count
- Discover `reach` includes `swipes_remaining` and `daily_swipe_limit`
- Locked signup path unchanged; hitting the cap does not set `signup_locked`
- HTML discover/chat use `distance_label_for`, never `distance_km`
- Tests + NAS health evidence recorded
- No `eas submit`

## Implementation summary
- Domain `swipe_allotment.py` consumes/refunds against `GETFKD_DAILY_FREE_SWIPES` / `daily_free_swipes` (default 30)
- Session persists `swipe_day` + `swipes_used` in the SQLite snapshot
- Like, pass, and superlike consume one swipe after the decision succeeds; a failed consume leaves the decision unapplied
- Superlike does not double-count (it goes through `express_interest`)
- HTML cookie sessions now persist after each request (same as the API header)
- Expo Swipe chrome shows remaining swipes and disables like/pass/superlike at 0
- HTML leftover km leak from ADR-0022 closed on discover + chat

## Files changed
- `swipe-dating-web-repo/src/swipe_dating/domain/swipe_allotment.py`
- `swipe-dating-web-repo/src/swipe_dating/application/session.py`
- `swipe-dating-web-repo/src/swipe_dating/adapters/sqlite_control.py`
- `swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py`
- `swipe-dating-web-repo/src/swipe_dating/web/app.py`
- `swipe-dating-web-repo/src/swipe_dating/web/templates/discover.html`
- `swipe-dating-web-repo/src/swipe_dating/web/templates/chat.html`
- `swipe-dating-web-repo/tests/unit/test_swipe_allotment.py`
- `swipe-dating-web-repo/tests/unit/test_session.py`
- `swipe-dating-web-repo/tests/unit/test_sqlite_control.py`
- `swipe-dating-web-repo/tests/integration/test_mobile_api.py`
- `apps/swipe/lib/types.ts`
- `apps/swipe/app/(tabs)/index.tsx`
- `.agent-memory/CURRENT.md`, `DECISIONS.md` (AM-008), this task

## Validation evidence
- `cd "/Users/computer/App Development/swipe-dating-web-repo" && uv run pytest tests/unit tests/integration tests/property -q` → **306 passed**, 1 warning
- `cd "/Users/computer/App Development/Swipe Dating/apps/swipe" && npx tsc --noEmit && npm test` → **13 passed**
- `NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh` → exit 0; `swipe-dating-web` recreated; protected containers still Up
- Live `GET https://getfkd.sentineldefensetechnologies.co.za/api/health` → 200 `{"status":"ok","client":"expo"}`
- Live unauth `GET /api/discover` and `POST /api/discover/pass` → 401 `adult_gate_required`
- No `eas submit`. Golden master not edited.

## Blockers / questions
- Extra swipes (verification / Bot Hunter / paid) are still out of scope
- App Attest is still the next anti-bot slice and needs Apple keys
- Store IPA 7 does not include this client change

## Architect review
- 
