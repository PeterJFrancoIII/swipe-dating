# Live chat typing bubble instead of 4s refresh

- **ID:** 2026-08-16-live-chat-typing
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** Stop the chat screen from reloading every 4 seconds. Show a Typing bubble, then append the message in real time.

## Allowed files
- `apps/swipe/app/matches/[id].tsx`
- `apps/swipe/lib/chatLive.ts`
- `apps/swipe/lib/types.ts`
- Live API sibling `swipe-dating-web-repo` (not golden master): chat hub, mobile API, nginx, tests, `pyproject.toml`
- `.agent-memory/CURRENT.md` and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- Store submit / `eas submit`

## Acceptance criteria
- No periodic chat poll
- Peer sees Typing, then the message without a full refresh
- Typing is ephemeral and not stored
- Tests + NAS evidence recorded

## Implementation summary
- Removed the 4s `setInterval` reload on the Expo chat screen
- Added an in-process WebSocket hub; REST remains the write path
- Installed `websockets` so uvicorn can actually upgrade the socket (TestClient hid this gap)

## Files changed
- `apps/swipe/app/matches/[id].tsx`
- `apps/swipe/lib/chatLive.ts`
- `apps/swipe/lib/types.ts`
- `swipe-dating-web-repo/src/swipe_dating/web/chat_hub.py`
- `swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py`
- `swipe-dating-web-repo/src/swipe_dating/web/app.py`
- `swipe-dating-web-repo/src/swipe_dating/web/load_guard.py`
- `swipe-dating-web-repo/deploy/nas-arch/nginx.conf`
- `swipe-dating-web-repo/pyproject.toml`
- `swipe-dating-web-repo/tests/unit/test_chat_hub.py`
- `swipe-dating-web-repo/tests/integration/test_chat_live.py`

## Validation evidence
- `uv run pytest tests/unit tests/integration tests/property -q` in swipe-dating-web-repo → **278 passed**
- `npx tsc --noEmit && npm test` in `apps/swipe` → **10 passed**
- NAS deploy exit 0; `GET /api/health` 200 `{"status":"ok","client":"expo"}`
- NAS localhost smoke: typing event then message `live typing then message` over nginx `:18081` → `SMOKE_OK`
- Protected containers still Up

## Blockers / questions
- Cloudflare 1010 blocked a Python user-agent on the public hostname; phones use a normal browser/app signature. Public WSS was not re-smoked from this environment.

## Deploy evidence (2026-08-16 12:10 ET)
- iOS production IPA build 6 `cbf383bb-b56b-461e-822e-bb3d7b2a7bb4` FINISHED
- IPA: https://expo.dev/artifacts/eas/EdkrwHocCIYwhc-8sUxzrco7zsO5no3vb0HOqvGh-kY.ipa
- No `eas submit`

## Architect review
- Pending Codex. Cursor does not self-approve.
