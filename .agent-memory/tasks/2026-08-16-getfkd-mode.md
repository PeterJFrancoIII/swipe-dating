# Get Fk'd mode toggle and ephemeral matches

- **ID:** 2026-08-16-getfkd-mode
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Make the in-app lockup a Get Fk'd mode button with enter/exit prompts; dissolve mode-only matches and chats on exit.

## Allowed files
- `00_Developer_Documents/docs/architecture/adr-0024-getfkd-mode.md`
- `00_Developer_Documents/PRODUCT_SCOPE.md`
- `apps/swipe/components/GetFkdLogo.tsx`
- `apps/swipe/components/GetFkdModeButton.tsx`
- `apps/swipe/components/TopChrome.tsx`
- `apps/swipe/components/MatchMoment.tsx`
- `apps/swipe/app/(tabs)/matches.tsx`
- `apps/swipe/app/matches/[id].tsx`
- `apps/swipe/lib/getfkdMode.ts`
- `apps/swipe/lib/getfkdMode.test.ts`
- `apps/swipe/lib/api.ts`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/lib/types.ts`
- `apps/swipe/package.json`
- `/Users/computer/App Development/swipe-dating-web-repo/src/swipe_dating/domain/conversations.py`
- `/Users/computer/App Development/swipe-dating-web-repo/src/swipe_dating/application/session.py`
- `/Users/computer/App Development/swipe-dating-web-repo/src/swipe_dating/adapters/sqlite_control.py`
- `/Users/computer/App Development/swipe-dating-web-repo/src/swipe_dating/web/app.py`
- `/Users/computer/App Development/swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py`
- `/Users/computer/App Development/swipe-dating-web-repo/tests/unit/test_conversations.py`
- `/Users/computer/App Development/swipe-dating-web-repo/tests/integration/test_mobile_api.py`
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- Exact peer coordinates / live map UI
- UniFFI `apps/ios` / `apps/android`

## Acceptance criteria
- Logo on Swipe chrome toggles mode after an enter prompt
- Active state glows, pulses, and drips
- Exit warns to exchange numbers; local “don't show again”
- Matches created while both are in mode, and those chats, disappear on exit
- Ordinary matches stay
- No exact location on discover/chat
- No store submit

## Implementation summary
- ADR-0024 + AM-016: lockup is the mode toggle; dual-consent Get Fk'd matches; dissolve on exit; live map stays Phase 5.
- Expo lockup is `GetFkdModeButton`: enter warning, glow/pulse/drip while on, exit “get numbers” prompt with local skip.
- API `POST /api/getfkd` persists `get_fkd_enabled`. Mutual likes while both are on are tagged `getfkd`. Exit dissolves those matches and purges chats for both sides. Ordinary matches stay.
- Chat banner and match-moment copy warn that the thread ends when either leaves.

## Files changed
- `00_Developer_Documents/docs/architecture/adr-0024-getfkd-mode.md`
- `00_Developer_Documents/PRODUCT_SCOPE.md`
- `apps/swipe/components/GetFkdModeButton.tsx`
- `apps/swipe/components/TopChrome.tsx`
- `apps/swipe/components/MatchMoment.tsx`
- `apps/swipe/app/(tabs)/matches.tsx`
- `apps/swipe/app/matches/[id].tsx`
- `apps/swipe/lib/getfkdMode.ts`
- `apps/swipe/lib/getfkdMode.test.ts`
- `apps/swipe/lib/api.ts`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/lib/types.ts`
- `apps/swipe/package.json`
- `swipe-dating-web-repo/src/swipe_dating/domain/conversations.py`
- `swipe-dating-web-repo/src/swipe_dating/application/session.py`
- `swipe-dating-web-repo/src/swipe_dating/adapters/sqlite_control.py`
- `swipe-dating-web-repo/src/swipe_dating/web/app.py`
- `swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py`
- `swipe-dating-web-repo/tests/unit/test_conversations.py`
- `swipe-dating-web-repo/tests/integration/test_mobile_api.py`
- `.agent-memory/DECISIONS.md`
- `.agent-memory/CURRENT.md`
- this task file

## Validation evidence
- `cd apps/swipe && npx tsc --noEmit && npm test` → **21 passed**, 0 failed (2026-08-16)
- `cd swipe-dating-web-repo && uv run pytest tests/unit/test_conversations.py tests/integration/test_mobile_api.py::test_getfkd_mode_match_dissolves_for_both_adults tests/integration/test_mobile_api.py::test_two_adults_can_match_each_other tests/integration/test_mobile_api.py::test_two_adults_share_the_same_chat_thread -q` → **18 passed**
- NAS: `NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh` → container recreated, healthy
- `curl http://127.0.0.1:18081/api/health` on NAS → 200 `{"status":"ok","client":"expo"}`
- `curl https://getfkd.sentineldefensetechnologies.co.za/api/health` → 200
- `POST /api/getfkd` without session → 401 `adult_gate_required` (route is live)
- No `eas submit`. Golden master not edited.

## Blockers / questions
- Shared memory `CURSOR_IDE_AGENT_UPDATE.md` still describes the frozen web client as active; `PRODUCT_SCOPE.md` / user instruction win (Apple-first Expo).
- Live map / exact peer coordinates stay Phase 5. This slice records consent and ephemeral matches only.
- Reload Expo Go to pick up the logo button. Store IPA 7 does not include this toggle.

## Architect review
- 
