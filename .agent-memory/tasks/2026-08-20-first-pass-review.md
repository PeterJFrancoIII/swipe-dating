# First-pass Apple review harden (keep functions)

- **ID:** 2026-08-20-first-pass-review
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-20 16:11 ET — make first-pass approval as perfect as possible without losing critical functions.

## Bound

Close residual first-pass reject risks: age-gate 2.1, Get Fk'd leave-off, backend retry UX, CSAE report path, reviewer notes. Keep Get Fk'd, swipe, photos, chat, meetup, granted Boost/Superlike, block/report. Do **not** `eas submit`. Do **not** write `approvals/`. Do **not** add a store birthday bypass.

## Files changed

Client:

- `lib/appleAge.ts`, `lib/appleAgeResult.ts`, `lib/appleAge.test.ts`
- `components/AgeGateScreen.tsx`
- `lib/getfkdMode.ts`, `lib/getfkdMode.test.ts`
- `app/(tabs)/index.tsx` — discover retry empty state; CSAE URGENT on report
- `app/matches/[id].tsx` — CSAE URGENT on chat report
- `app.json` — buildNumber 12
- `package.json` — include appleAge tests

API (sibling, not golden master):

- `src/swipe_dating/domain/bot_moderation.py` — `report_received_notice`
- `src/swipe_dating/web/mobile_api.py`
- `tests/unit/test_bot_moderation.py`

Docs / memory:

- `00_Developer_Documents/docs/operations/app-store-connect-listing.md`
- `00_Developer_Documents/docs/operations/app-store-connect-preview-checklist.md`
- `.agent-memory/CURRENT.md`
- this task

## Evidence

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 88, pass 88, fail 0

uv run pytest tests/unit/test_bot_moderation.py::test_safety_report_reasons_exist \
  tests/unit/test_bot_moderation.py::test_urgent_report_notice_asks_for_email \
  tests/integration/test_mobile_api.py::test_legal_community_page_lists_safety_reports
# 3 passed

NAS deploy exit 0
live /legal/privacy 200 Bluetooth
live /legal/community 200 Appears under 18
live /api/health 200
```

Store IPA **12** (FINISHED, not submitted):

- ID: `713f97cc-bc96-4ddd-9a25-c4b9a3d98955`
- Page: https://expo.dev/accounts/sentinel-defense-technologies/projects/getfkd/builds/713f97cc-bc96-4ddd-9a25-c4b9a3d98955
- IPA: https://expo.dev/artifacts/eas/pbfBIfb75AA_rMcWOJoYFlozFzNLDcAZz6JFwxWHLcI.ipa
- Finished: 2026-08-20 4:21 PM ET

## Not done

- `eas submit` / Submit for Review
- 6.7" screenshots
- App Store Connect listing paste (FIRST-PASS notes are in the listing doc)
- `approvals/` empty
- Store birthday bypass (intentionally not added)
- Image CSAM scanner (intentionally not faked)
- Do not merge PR 11
- Cursor does not self-accept
