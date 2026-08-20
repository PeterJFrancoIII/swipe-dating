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

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 76, pass 76

uv run pytest tests/integration/test_mobile_api.py::test_legal_privacy_page_is_public
# 1 passed

eas build --profile production --platform ios --non-interactive
# FINISHED c6bdb507-5122-4aa0-bdd9-02c9bd9c4afd
# IPA: https://expo.dev/artifacts/eas/q2H1_4eGJILsvo8zqAi5LGu729j10jQ8HU8Anh-WoZM.ipa

GET /legal/privacy → 200 Adults 18+ only (no "not in force")
GET /api/health → 200
```

Did not run eas submit. Did not click Submit for Review.

## Remaining for a full review packet (human)

Binary work for IPA 8 is done. Full review still needs:

1. You `eas submit --platform ios --id c6bdb507-5122-4aa0-bdd9-02c9bd9c4afd` and click Submit for Review.
2. 6.7" screenshots (1290×2796): Age gate, Swipe, Matches, chat, Profile.
3. App Store Connect listing paste from `docs/operations/app-store-connect-listing.md` (updated 2026-08-19; do not paste the old “draft / not in force” sentence).
4. Privacy nutrition + 17+ questionnaire from that same doc.
5. Device walkthrough on iOS 26+ (Declared Age Range).
6. Optional next IPA (owner must authorize): hide Get Fk'd BLE on store — release gates still say it is unavailable to real users.

`approvals/` stays empty. Do not merge PR 11.

## Forbidden

- `eas submit` / App Store Connect Submit
- Fabricated `approvals/`
- Weakening 18+, block/report, encryption
- Golden master, UniFFI trees, merging PR 11
- Self-accept
