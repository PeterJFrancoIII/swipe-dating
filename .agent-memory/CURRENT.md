# Current task

- **Task:** 2026-08-18-photo-timeout-ux
- **Status:** ready_for_review
- **Authorization:** GPT Architect 2026-08-18 15:14 ET — Timeout / UX only. RN-fetch accepted. No URLSession.

## GPT start here

https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-photo-timeout-ux.md

## This slice

- Form timeout **90s**. Transport unchanged.
- `missing_fields=[]` → `continue_extras`, not Sex. Photos always hydrate.
- `npx tsc --noEmit && npm test` → **41 passed**, 0 failed.
- Live E (relaunch): **Want to add more?** not Sex.
- Live C this session: picker logged HEIC+JPEG; NAS **no POST**; timeout toast. Owner can retry on the open Photos step.

## Review branches

- https://github.com/PeterJFrancoIII/swipe-dating/pull/11
- https://github.com/PeterJFrancoIII/swipe-dating-web/pull/2
