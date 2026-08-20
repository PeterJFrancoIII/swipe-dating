# Tighten Apple policy honor without dropping critical functions

- **ID:** 2026-08-20-apple-policy-tighten
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-20 15:13 ET — make Apple review as tight as possible without losing critical functions.

## Bound

Tighten 1.2 / 3.1.1 / 5.1.1 / 2.5.4. Keep Get Fk'd, swipe, photos, chat, meetup, granted Boost/Superlike, block/report. Do **not** `eas submit`. Do **not** write `approvals/`.

## This slice

- Report reasons include Appears under 18 and Non-consensual intimate images (1.2 / CSAE).
- Boost / Superlike are use-granted only; no purchase-shaped control when inventory is 0 (3.1.1).
- Photo picker does not request EXIF; one-time photo policy confirm (1.2 / 5.1.1).
- Remove store `NSAllowsLocalNetworking` (ATS).
- Get Fk'd ding uses ambient audio (no background-audio appearance).
- Safety copy on Profile. Tighter usage strings.
- Bump iOS `buildNumber` to 11 and start an EAS production **build** only.

## Forbidden

- Hiding Get Fk'd / stripping BLE, photos, chat, meetup, or granted reach
- Golden master, UniFFI trees
- `eas submit` / Submit for Review
- Fabricated `approvals/`
- Exact peer coordinates or live distance
- Merging PR 11
- Self-accept

## Files changed

Client (`apps/swipe/`):

- `app.json` — build 11; no local ATS; tighter photo / location / Bluetooth strings
- `package.json` — include new tests
- `lib/reportOptions.ts` + `lib/reportOptions.test.ts`
- `lib/photoConsent.ts` + `lib/photoConsent.test.ts` + `lib/photoConsentPrompt.ts`
- `lib/photoUpload.ts` — `exif: false`, `allowsEditing: false`
- `lib/swipeQuota.ts` + `lib/swipeQuota.test.ts` — granted inventory helpers
- `lib/session.tsx` — merge safety report reasons
- `lib/getfkdMode.ts` + `lib/getfkdMode.test.ts` — BT after confirm; no lock-screen cues
- `lib/legalDocs.ts` + `lib/legalDocs.test.ts`
- `app/(tabs)/index.tsx` — hide Boost at 0; disable Superlike at 0; "Use granted Boost"
- `app/profile.tsx` — photo policy + Safety box
- `app/matches/[id].tsx` — merge safety report reasons
- `components/OnboardingScreen.tsx` — photo policy before library
- `modules/getfkd-location/ios/ProximityRadio.swift` — ambient + mixWithOthers; no restore identifier

API (sibling `swipe-dating-web-repo`, not golden master):

- `src/swipe_dating/domain/bot_moderation.py` — `UNDER_18`, `NCII`
- `src/swipe_dating/web/app.py` — those reasons first in `REPORT_OPTIONS`
- `src/swipe_dating/web/legal_pages.py` — community report-reason copy
- `tests/unit/test_bot_moderation.py`
- `tests/integration/test_mobile_api.py`

Docs / memory:

- `00_Developer_Documents/docs/operations/app-store-connect-listing.md`
- `.agent-memory/CURRENT.md`
- this task

## Evidence

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 85, pass 85, fail 0

cd swipe-dating-web-repo
uv run pytest tests/unit/test_bot_moderation.py::test_safety_report_reasons_exist \
  tests/integration/test_mobile_api.py::test_legal_privacy_page_is_public \
  tests/integration/test_mobile_api.py::test_legal_community_page_lists_safety_reports
# 3 passed

NAS_HOST=MediaServer2 bash deploy/nas-arch/deploy-to-nas.sh
# exit 0; swipe-dating-web recreated

curl live:
# /legal/community 200 — Appears under 18, Non-consensual intimate images, filtered before
# /legal/privacy 200 — Bluetooth, filter underage
# /api/health 200
# /api/bootstrap report_options first: under_18, ncii
```

Store IPA **11** (FINISHED, not submitted):

- ID: `050d4d90-a64e-46de-a48b-207882d2585f`
- Page: https://expo.dev/accounts/sentinel-defense-technologies/projects/getfkd/builds/050d4d90-a64e-46de-a48b-207882d2585f
- IPA: https://expo.dev/artifacts/eas/GheUI8ZO7KhIBTARW5nkIFSZgcj3oabl7phKUn-mYcQ.ipa
- Finished: 2026-08-20 3:29 PM ET

## Not done (human / Codex)

- `eas submit` and Submit for Review
- 6.7" screenshots
- App Store Connect listing + 17+ questionnaire + privacy nutrition
- `approvals/` remain empty
- Do not merge PR 11
- Cursor does not self-accept
