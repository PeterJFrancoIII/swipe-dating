# Temporary Apple sign-in bypass (dev / Metro)

- **ID:** 2026-08-18-dev-apple-bypass
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 16:36 ET — bypass Sign in with Apple for now; cannot reliably complete it.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-dev-apple-bypass.md

## Why

NAS finish is fail-closed on Apple (ADR-0023). Simulator / Metro cannot reliably produce a verifiable Apple identity token. Owner asked for a temporary bypass so dogfood can reach Swipe.

## What this is

- Metro `__DEV__` hides `SignInScreen` again.
- NAS `GETFKD_DEV_SKIP_APPLE=1` lets an unbound **non-store** finish succeed.
- Store / preview (`X-Getfkd-Release: store|preview`) still get `401 apple_sign_in_required`.
- Velocity, too-fast, photo-reuse, and locks are unchanged. Not `GETFKD_SIGNUP_RELAXED`.

## Files

Client (`review/photo-upload`):

- `apps/swipe/lib/appleGate.ts`
- `apps/swipe/lib/appleGate.test.ts`
- `apps/swipe/app/_layout.tsx`
- this packet, `.agent-memory/CURRENT.md`

API (`review/photo-upload-session`, sibling `swipe-dating-web-repo`):

- `src/swipe_dating/domain/signup_fraud.py`
- `src/swipe_dating/web/signup_guard.py`
- `tests/unit/test_signup_fraud.py`
- `tests/integration/test_signup_gates.py`
- `deploy/nas-arch/docker-compose.yml`

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 46, pass 46, fail 0

cd swipe-dating-web-repo && uv run pytest tests/unit/test_signup_fraud.py tests/integration/test_signup_gates.py -q
# 16 passed
```

NAS `NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh` exit 0. Container recreated. Live `/api/health` **200** `{"status":"ok","client":"expo"}`. Container env `GETFKD_DEV_SKIP_APPLE=1`. Protected stacks still Up.

## Ask of owner

After NAS is up, reload Getfkd and tap **Not now** on optional extras. Swipe should open. Store builds still require Apple.

## Architect review

- Cursor: `ready_for_review`. Not self-accepted.
- Pending GPT Main. Temporary owner bypass — revert `GETFKD_DEV_SKIP_APPLE` when Apple sign-in is reliable.
