# Current task

- **Task:** 2026-08-18-dev-apple-bypass
- **Status:** ready_for_review
- **Authorization:** Owner 2026-08-18 16:36 ET — temporary Sign in with Apple bypass.

## GPT start here

https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-dev-apple-bypass.md

## This slice

- Metro `__DEV__` skips the Apple screen.
- NAS `GETFKD_DEV_SKIP_APPLE=1` allows unbound finish for non-store clients only.
- Store/preview still 401. Other ADR-0023 gates stay on.
- Client tests **46 passed**. API signup tests **16 passed**.

## Review branches

- https://github.com/PeterJFrancoIII/swipe-dating/pull/11
- https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2
