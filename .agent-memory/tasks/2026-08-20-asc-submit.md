# App Store Connect first-pass submit

- **ID:** 2026-08-20-asc-submit
- **Status:** ready_for_review
- **Reviewer:** Main GPT Sol 5.6 (Codex / architect). Cursor does not self-accept.
- **Architect:** Codex / GPT Main
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-20 16:57 ET — “alright, let's send it all for apple for review”

## Bound

Owner-authorized first-pass send of store IPA 12 plus the upload pack. Do **not** fabricate `approvals/`. Do **not** claim release gates passed. Do **not** merge PR 11.

## Binary

`713f97cc-bc96-4ddd-9a25-c4b9a3d98955`

## Forbidden

- Fabricated `approvals/`
- Golden master edits
- Self-accept
- Claiming production launch or counsel sign-off

## Evidence

```
eas submit:list --non-interactive
# ID 2ee79949-92ff-4469-bf05-7fb2e07cb224
# Status finished
# ASC App ID 6803669203
# Build ID 713f97cc-bc96-4ddd-9a25-c4b9a3d98955
# App Version 0.1.0 / Build 12
# Started 8/20/2026, 5:03:58 PM

eas submit:status --platform ios --non-interactive
# App Store: Live none / In review none / Pending release none
# TestFlight 0.1.0 (12): internal in beta testing, external ready for beta submission
```

IPA is in Connect. Public API + iris filled most of the listing. **Submit for Review** is blocked on App Store Review contact phone (`+` country code). `approvals/` not written. Release gates still fail closed. Not self-accepted.

## Applied 2026-08-20 17:29 ET

- Version `1.0` renamed to `0.1.0` (`4b71401d-f929-4379-a7a5-3c2c211d7115`, PREPARE_FOR_SUBMISSION)
- en-US description / keywords / promo / support URL
- Name Getfkd, subtitle Adult dating, Lifestyle, privacy URL
- Copyright 2026 Peter Franco, manual release
- Build 12 attached (`9e8209aa-4d65-4ed0-90c6-2bee39a39505`, VALID)
- Age rating questionnaire filled (17+ floor from frequent sexual/mature/profanity; age assurance + UGC + chat + social/age-restricted)
- 5 iPhone 6.7" screenshots uploaded, `COMPLETE`
- Content rights: `DOES_NOT_USE_THIRD_PARTY_CONTENT`
- Price: USA $0 (`appPriceSchedules` 201)
- Availability: all 175 territories, new territories on
- App Privacy published (no tracking; linked User Content / Photos / Chat / User ID / Coarse Location / Sensitive Info → App Functionality)
- Build export compliance: `usesNonExemptEncryption` false
- Review submission `7dcd3703-c49e-444c-9b5a-268f10b7bdaa` created, **not submitted** — missing `appStoreReviewDetail.contactPhone`

## Privacy alignment 2026-08-20 17:46 ET

Republished App Privacy to match Apple category meanings + the iOS privacy manifest:

- Removed `EMAILS_OR_TEXT_MESSAGES` (that token is email/SMS, not in-app chat)
- Added `NAME` (display names; already in `PrivacyInfo`)
- Kept linked App Functionality: Name, Other User Content, Photos, User ID, Coarse Location, Sensitive Info
- No tracking

## Still needed (human)

Owner review contact phone in `+1 …` form. Then create review details and PATCH `submitted: true`.

## Local verification 2026-08-20 17:55 ET

```
cd apps/swipe && npx tsc --noEmit && npm test
# tests 89, pass 89, fail 0
```

## Architect review (Sol 5.6)

Please review this packet + the `review/asc-first-pass-submit` PR. Confirm:

1. IPA 12 is the review binary; listing/age/privacy/screenshots match the upload pack.
2. App Privacy tokens are Name, Other User Content, Photos, User ID, Coarse Location, Sensitive Info — no tracking, no Emails or Text Messages.
3. UniFFI deletions and `golden-master/` were **not** committed.
4. PR 11 was **not** merged.
5. `approvals/` was not written. Release gates still fail closed.
6. Submit for Review is still correctly blocked on `contactPhone`.

Cursor does not self-accept.
