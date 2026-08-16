# Photo upload hit signup rate limit

- **ID:** 2026-08-16-photo-session-rate-limit
- **Status:** ready_for_review
- **Architect:** Codex
- **Implementer:** Cursor IDE Agent
- **Objective:** A real photo add returned `signup_rate_limited` / "Slow down and try again later." because `/api/profile/photos` minted a session when the token was missing or stale. Do not weaken ADR-0023 velocity caps. Do not mint on adult/photo routes.

## Allowed files
- `apps/swipe/lib/api.ts`
- `apps/swipe/lib/config.ts`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/lib/signupErrors.ts`
- `apps/swipe/lib/signupErrors.test.ts`
- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/app/profile.tsx`
- `/Users/computer/App Development/swipe-dating-web-repo/src/swipe_dating/domain/signup_fraud.py`
- `/Users/computer/App Development/swipe-dating-web-repo/src/swipe_dating/web/signup_guard.py`
- `/Users/computer/App Development/swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py`
- `/Users/computer/App Development/swipe-dating-web-repo/tests/unit/test_signup_fraud.py`
- `/Users/computer/App Development/swipe-dating-web-repo/tests/integration/test_signup_gates.py`
- `/Users/computer/App Development/swipe-dating-web-repo/tests/integration/test_mobile_api.py`
- `00_Developer_Documents/docs/architecture/adr-0023-fail-closed-signup.md`
- `.agent-memory/CURRENT.md`, `DECISIONS.md`, and this task file

## Forbidden files
- `golden-master/swipe-dating-web/`
- `approvals/`
- `eas submit`
- UniFFI `apps/ios` / `apps/android`
- Production / App Store
- Raising `SESSIONS_PER_IP_HOUR` / age-gate / onboard caps

## Acceptance criteria
- `POST /api/profile/photos` without a live session returns `401 session_required` and does not mint
- A live adult session can still add a photo after the IP mint cap is exhausted
- A stale `X-Swipe-Session` header does not mint
- Expo restores the stored token before upload (Fast Refresh must not drop it)
- No store submit. Age / fraud floors unchanged.

## Implementation summary
- `_api_adult` now `require_existing_session` — photo/onboarding/discover no longer mint
- Stale `X-Swipe-Session` on bootstrap/session is `401 session_required`, not a new mint
- Expo `request()` reloads the token from AsyncStorage and sends plain-object headers
- Bootstrap retries once after `session_required`
- Photo UI maps API codes and does not leave an uncaught add-photo promise

## Files changed
- `apps/swipe/lib/api.ts`
- `apps/swipe/lib/config.ts`
- `apps/swipe/lib/session.tsx`
- `apps/swipe/lib/signupErrors.ts`
- `apps/swipe/lib/signupErrors.test.ts`
- `apps/swipe/components/OnboardingScreen.tsx`
- `apps/swipe/app/profile.tsx`
- `swipe-dating-web-repo/src/swipe_dating/domain/signup_fraud.py`
- `swipe-dating-web-repo/src/swipe_dating/web/signup_guard.py`
- `swipe-dating-web-repo/src/swipe_dating/web/mobile_api.py`
- `swipe-dating-web-repo/tests/unit/test_signup_fraud.py`
- `swipe-dating-web-repo/tests/integration/test_signup_gates.py`
- `swipe-dating-web-repo/tests/integration/test_mobile_api.py`
- `00_Developer_Documents/docs/architecture/adr-0023-fail-closed-signup.md`
- `.agent-memory/CURRENT.md`, `DECISIONS.md` (AM-019), this task

## Validation evidence
- NAS logs before fix: `GET /api/onboarding` and `GET /api/discover/pack` **429** (same mint path as photos)
- After deploy, public `POST /api/profile/photos` with no session → **401** `{"error":"Your session expired. Try again.","code":"session_required"}`
- Stale `X-Swipe-Session: dead-token` → **401** `session_required`
- `https://getfkd.sentineldefensetechnologies.co.za/api/health` → **200** `{"status":"ok","client":"expo"}`
- `cd apps/swipe && npx tsc --noEmit && npm test` → **24 passed**, 0 failed
- `cd swipe-dating-web-repo && uv run pytest tests/unit/test_signup_fraud.py tests/integration/test_signup_gates.py tests/integration/test_mobile_api.py -q` → **36 passed**
- `NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh` → exit 0
- No `eas submit`. Golden master not edited. Session mint / age / onboard caps unchanged.

## Blockers / questions
- Expo Go must reload to pick up token restore. If the stored session is gone and the IP mint cap is still full, bootstrap can still 429 for up to an hour — that gate is unchanged.
- Shared memory `CONTEXT.md` / `CURSOR_IDE_AGENT_UPDATE.md` still say no product task; user instruction wins.

## Architect review
- 
