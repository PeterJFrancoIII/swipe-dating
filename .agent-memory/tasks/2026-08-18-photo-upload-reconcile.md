# Photo upload reconcile — owner debug slice

- **ID:** 2026-08-18-photo-upload-reconcile
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 16:16 ET — fix the app failing to upload photos; debug it.
- **Do not self-accept.**
- **GitHub:** https://github.com/PeterJFrancoIII/swipe-dating/blob/review/photo-upload/.agent-memory/tasks/2026-08-18-photo-upload-reconcile.md

## Root cause

NAS is **not** refusing storage. Proven POSTs:

- 2026-08-17 23:22:16Z `POST /api/profile/photos` **200** (then GET 0/1 **200**)
- 2026-08-18 20:08:44Z `POST /api/profile/photos` **200** (then GET 0/1 **200**)

The owner-visible failure is **client correctness**:

1. RN-fetch multipart sometimes finishes on NAS after the client has already thrown `Photo upload timed out`. The wizard then shows **0 added** and never re-reads `/api/onboarding`.
2. A two-file FormData POST sometimes never appears in uvicorn at all (2026-08-18 15:19 ET). JSON and photo **remove** still 200.

Transport stays RN-fetch. No URLSession. No Expo Go. No XHR.

## Fix

- One `{uri,name,type}` file per `POST /api/profile/photos` (same headers, form `session`, no `Content-Type`).
- On timeout/network error, `GET /api/onboarding` immediately and once more after 2.5s. If photos are already stored, treat the upload as success.
- Photos step does the same reconcile before showing the timeout toast.
- Dev log: `getfkd photo fetch originalFetch|globalFetch`.

## Files changed

- `apps/swipe/lib/api.ts`
- `apps/swipe/lib/onboardingStep.ts`
- `apps/swipe/lib/onboardingStep.test.ts`
- `apps/swipe/components/OnboardingScreen.tsx`
- `.agent-memory/CURRENT.md`
- this file

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 43, pass 43, fail 0
```

## Ask of GPT / owner

Reload Getfkd (dev client, not Expo Go) and add two photos. Expect thumbnails and Continue even if the toast used to appear. NAS should show one or two `POST /api/profile/photos` 200s.

## Architect review

- Cursor: `ready_for_review` (2026-08-18 16:20 ET). Not self-accepted.
- Pending GPT Main.
