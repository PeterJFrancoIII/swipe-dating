# Honor Apple review policy without dropping features

- **ID:** 2026-08-20-apple-policy-honor
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-20 13:55 ET — honor Apple policy requirements without forfeiting project functionality.

## Bound

Closed 1.2 / 5.1.1 / 5.1.1(v) gaps. Kept Get Fk'd, swipe, photos, chat, meetup, Boost, and block/report. Did **not** `eas submit`. Did **not** write `approvals/`.

## This slice

- Privacy / Terms / Community / Support linked on age gate and Sign in with Apple before account creation (5.1.1).
- Community-rules agreement required before photos (1.2).
- Fail-closed UGC text filter for underage / CSAM / trafficking only; adult sexual copy stays.
- Approximate-location explanation before the iOS prompt (5.1.1).
- Account deletion copy is permanent in-app deletion (5.1.1(v)).
- Privacy manifest: `NSPrivacyTracking` false + collected data types.
- iOS `buildNumber` 10. EAS production **build** only.

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 81, pass 81

uv run pytest tests/integration/test_mobile_api.py::test_legal_privacy_page_is_public
# 1 passed

GET /legal/privacy → 200 filter underage + Bluetooth (no "not in force")
GET /legal/community → 200 filtered before + Meet in public
GET /api/health → 200

eas build --profile production --platform ios
# FINISHED c5ab838a-699e-4ea9-94dd-09a77136bcb2
# IPA: https://expo.dev/artifacts/eas/P-MPBIIyOUlW6sB7-v__BV66mxpH1qHtUIPQUFWp8Hc.ipa
# Page: https://expo.dev/accounts/sentinel-defense-technologies/projects/getfkd/builds/c5ab838a-699e-4ea9-94dd-09a77136bcb2
```

Did not run eas submit.

## Remaining human

1. You `eas submit --platform ios --id c5ab838a-699e-4ea9-94dd-09a77136bcb2` and click Submit.
2. Paste review notes from `docs/operations/app-store-connect-listing.md` (includes UGC 1.2 and safety).
3. Nutrition: User Content, Identifiers, Coarse Location, Sensitive Info. No Precise Location, tracking, ads, purchases.
