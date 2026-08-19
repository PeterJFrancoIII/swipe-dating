# Store review prep — IPA 8 (no submit)

- **ID:** 2026-08-19-store-review-prep
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-19 18:21 ET — do everything possible so the app can pass Apple review today. Do not stop until finished.

## Bound

Maximize review-pass chance. Do **not** `eas submit`, do **not** click Submit for Review, do **not** write `approvals/`.

## This slice

- Store binaries hide FAKE banners and `!` QA marks. Sample adults stay in the deck so review is not empty.
- Unfinished “yet / draft / internal” user copy is removed on store builds.
- Legal URLs and in-app legal describe this version’s real rules. No counsel-approval claim.
- Age gate stays Apple Declared Age Range and fail-closed on store.
- Bump iOS `buildNumber` to 8 and start an EAS production **build** only.

## Allowed

- `apps/swipe/lib/storeBuild.ts`
- `apps/swipe/lib/storeBuild.test.ts`
- `apps/swipe/lib/testingCard.ts`
- `apps/swipe/lib/testingCard.test.ts`
- `apps/swipe/lib/legalDocs.ts`
- `apps/swipe/components/ReportBugButton.tsx`
- `apps/swipe/components/SignInScreen.tsx`
- `apps/swipe/app/(tabs)/index.tsx`
- `apps/swipe/app/profile.tsx`
- `apps/swipe/app/legal/[slug].tsx`
- `apps/swipe/app/+not-found.tsx`
- `apps/swipe/app.json`
- `apps/swipe/package.json` (test list only)
- API `src/swipe_dating/web/legal_pages.py` + NAS deploy of working tree
- `.agent-memory/CURRENT.md` and this task

## Forbidden

- `eas submit` / App Store Connect Submit
- Fabricated `approvals/`
- Weakening 18+, block/report, encryption
- Golden master, UniFFI trees, merging PR 11
- Self-accept
