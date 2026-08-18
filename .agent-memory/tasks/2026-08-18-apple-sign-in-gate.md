# Apple sign-in gate — owner debug slice

- **ID:** 2026-08-18-apple-sign-in-gate
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 16:31 ET — photos work; “Sign in with Apple required” blocks proceed.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-apple-sign-in-gate.md

## Root cause

NAS finish is fail-closed (ADR-0023 / AM-007). `POST /api/onboarding` with `finish` returns **401 `apple_sign_in_required`** unless the session has an Apple `sub`.

The Getfkd development client skipped `SignInScreen` when `__DEV__` was true (`app/_layout.tsx`). The owner completed photos, tapped **Not now**, and only saw the toast. No Apple bind was possible.

`apple_required` in bootstrap is false for Metro (no `X-Getfkd-Release: store`). That header is **not** a NAS finish bypass. Do not set `GETFKD_SIGNUP_RELAXED` on NAS.

## Fix

- Show Sign in with Apple on iOS after the age gate when the session is not Apple-bound, including Metro `__DEV__`.
- Web Metro stays anonymous (ADR-0020).
- Sign-in copy no longer says development builds can skip.
- Simulator hint: sign into an Apple ID in Settings if Apple is unavailable.

## Files changed

- `apps/swipe/app/_layout.tsx`
- `apps/swipe/components/SignInScreen.tsx`
- `apps/swipe/lib/appleGate.ts`
- `apps/swipe/lib/appleGate.test.ts`
- `apps/swipe/lib/signupErrors.test.ts`
- `apps/swipe/package.json`
- `.agent-memory/CURRENT.md`
- this file

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 45, pass 45, fail 0
```

NAS was not relaxed. Golden master not edited.

## Ask of owner

Reload Getfkd. Sign in with Apple. Then **Not now** on optional extras should enter Swipe. Simulator must be signed into an Apple ID.

## Architect review

- Cursor: `ready_for_review` (2026-08-18 16:34 ET). Not self-accepted.
- Pending GPT Main.
