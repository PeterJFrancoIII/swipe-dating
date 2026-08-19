# It's a match moment

- **ID:** 2026-08-16-its-a-match
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** When two adults like each other, show a visible match moment and put faces on the Matches list so the user can see and test the core loop.

## Allowed files
- Live API sibling `swipe-dating-web-repo` (`mobile_api.py`, session, app.py, tests)
- `apps/swipe/` swipe, matches, chat, shared photo/match-moment components, types
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- App Attest / Get Fk'd live map / Skin Shop
- UniFFI `apps/ios` / `apps/android`

## Acceptance criteria
- Mutual like returns `matched_with` (name, age, photo, match_id)
- Match list rows include `photo_url`
- Expo shows a match overlay with Say hi / Keep swiping
- Matches list and chat header show the peer photo when present
- Live uploaded photos appear on discover after this deploy
- Tests + NAS health evidence
- No `eas submit`

## Implementation summary
- Discover like/superlike now returns `matched_with`
- `deck_photo` serves sqlite photos for live accounts; synthetic portraits stay for fixtures
- After a match, the peer remains photo-visible; passed people stay hidden
- Expo `MatchMoment` overlay + `AuthPhoto` on Matches and chat

## Files changed
- `swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py`
- `swipe-dating-web-repo/src/swipe_dating/application/session.py`
- `swipe-dating-web-repo/src/swipe_dating/web/app.py`
- `swipe-dating-web-repo/tests/integration/test_mobile_api.py`
- `apps/swipe/components/MatchMoment.tsx`
- `apps/swipe/components/AuthPhoto.tsx`
- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/app/(tabs)/matches.tsx`
- `apps/swipe/app/matches/[id].tsx`
- `apps/swipe/app/profile.tsx`
- `apps/swipe/lib/types.ts`
- `.agent-memory/CURRENT.md`, `DECISIONS.md` (AM-009), this task

## Validation evidence
- `cd "/Users/computer/App Development/swipe-dating-web-repo" && uv run pytest tests/unit tests/integration tests/property -q` → **306 passed**
- `cd "/Users/computer/App Development/Swipe Dating/apps/swipe" && npx tsc --noEmit && npm test` → **13 passed**
- `NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh` → exit 0
- Live `GET /api/health` → 200 `{"status":"ok","client":"expo"}`
- No `eas submit`. Golden master not edited.

## Blockers / questions
- Store IPA 7 does not include this Expo overlay. Test in Expo Go / Metro on port 8082.
- App Attest still deferred.

## Architect review
- 
