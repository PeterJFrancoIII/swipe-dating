# Current task

- **Task:** 2026-08-18-photo-multi-pick-duplicate
- **Status:** ready_for_review
- **Authorization:** Owner 2026-08-18 17:27 ET — 3-pick upload sometimes stores a duplicate of the first.

## GPT start here

https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-photo-multi-pick-duplicate.md

## This slice

- Unique picks by `assetId` (fallback `uri`).
- Stage each pick to a unique file before encode. Native PHAsset copy when the rebuilt client is present.
- `npx tsc --noEmit && npm test` → **56 passed**, 0 failed.

## Review branches

- https://github.com/PeterJFrancoIII/swipe-dating/pull/11
- https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2
