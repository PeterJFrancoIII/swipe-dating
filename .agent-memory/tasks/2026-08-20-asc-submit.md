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

IPA is in Connect. Public API + iris filled most of the listing. Owner supplied the review contact phone at 2026-08-20 17:55 ET. Review details created; submission PATCH `submitted: true` returned 200. Version and submission are `WAITING_FOR_REVIEW`. `approvals/` not written. Release gates still fail closed. Not self-accepted.

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
- Review submission `7dcd3703-c49e-444c-9b5a-268f10b7bdaa` created, **not submitted** — missing `appStoreReviewDetail.contactPhone` (resolved 17:56 ET)

## Privacy alignment 2026-08-20 17:46 ET

Republished App Privacy to match Apple category meanings + the iOS privacy manifest:

- Removed `EMAILS_OR_TEXT_MESSAGES` (that token is email/SMS, not in-app chat)
- Added `NAME` (display names; already in `PrivacyInfo`)
- Kept linked App Functionality: Name, Other User Content, Photos, User ID, Coarse Location, Sensitive Info
- No tracking

## Submit 2026-08-20 17:56 ET

Owner-supplied `+` country-code review phone (digits not stored in repo).

```
POST /v1/appStoreReviewDetails → 201
# contactFirstName Peter, contactLastName Franco
# contactEmail peterjfrancoiii@icloud.com
# demoAccountRequired false
# notes from 07-review-notes.txt (2398 chars)
# contactPhone set (starts with +)

POST /v1/reviewSubmissionItems → 201
# submission 7dcd3703-c49e-444c-9b5a-268f10b7bdaa
# version 4b71401d-f929-4379-a7a5-3c2c211d7115

PATCH /v1/reviewSubmissions/7dcd3703-c49e-444c-9b5a-268f10b7bdaa submitted=true → 200
# submittedDate 2026-08-20T21:56:57.028Z
# state WAITING_FOR_REVIEW

GET /v1/appStoreVersions/4b71401d-f929-4379-a7a5-3c2c211d7115
# versionString 0.1.0
# appStoreState WAITING_FOR_REVIEW
# releaseType MANUAL
```

`eas submit:status` still showed App Store Live/In review/Pending release none immediately after (EAS lag; ASC API is the source of truth). Phone number was not written to git.

## Publish + URL audit 2026-08-20 17:59 ET

Owner: publish the app and fill/correct URLs. The binary cannot go live while `WAITING_FOR_REVIEW`. Release type changed so Apple publishes it on approval.

```
PATCH /v1/appStoreVersions/4b71401d-f929-4379-a7a5-3c2c211d7115
# releaseType MANUAL → AFTER_APPROVAL (200)
# appStoreState still WAITING_FOR_REVIEW

PATCH appInfoLocalizations e09dd158-2ed6-402e-abf6-e2416ae86be8
# privacyPolicyUrl https://getfkd.sentineldefensetechnologies.co.za/legal/privacy (200)

PATCH appStoreVersionLocalizations 5d0801e0-b810-424e-ba69-cd6cf39c8b8a
# supportUrl https://getfkd.sentineldefensetechnologies.co.za/legal/support (200)
# marketingUrl https://getfkd.sentineldefensetechnologies.co.za/ (200)
# whatsNew locked (409 STATE_ERROR) — first version, not a URL
```

Live GET (HTTP 200, TLS ok, no “draft / not in force”):

- `/legal/privacy`
- `/legal/terms`
- `/legal/support`
- `/legal/community`
- `/` (marketing)

Terms and community are not App Store listing fields; they are on the host and in-app. `privacyChoicesUrl` left empty (no separate CCPA page). Not live on the App Store. No `approvals/`.

## Local verification 2026-08-20 17:55 ET

```
cd apps/swipe && npx tsc --noEmit && npm test
# tests 89, pass 89, fail 0
```

## Architect review (Sol 5.6)

Please review this packet + [PR 12](https://github.com/PeterJFrancoIII/swipe-dating/pull/12) (`review/asc-first-pass-submit`, `b57720c`). Confirm:

1. IPA 12 is the review binary; listing/age/privacy/screenshots match the upload pack.
2. App Privacy tokens are Name, Other User Content, Photos, User ID, Coarse Location, Sensitive Info — no tracking, no Emails or Text Messages.
3. UniFFI deletions and `golden-master/` were **not** committed.
4. PR 11 was **not** merged.
5. `approvals/` was not written. Release gates still fail closed.
6. Review details exist (phone set, no demo account). Submission `7dcd3703-c49e-444c-9b5a-268f10b7bdaa` and version 0.1.0 / build 12 are `WAITING_FOR_REVIEW` as of 2026-08-20T21:56:57Z. Release type is now `AFTER_APPROVAL`. Privacy, support, and marketing URLs are live HTTPS 200. Not yet for sale. No `approvals/`.

## ASO copy 2026-08-20 18:25 ET

Owner asked for a sexier description and popular dating search terms. Apple indexes name + subtitle + 100-char keyword field, not the long description. No competitor brand names. No guarantee of chart position.

```
PATCH appInfoLocalizations subtitle → Casual adult dating (200)
PATCH version localization
# promotionalText 149/170 (200)
# description 1632/4000 (200) first line: Meet singles who want chemistry. Swipe. Match. Flirt. Get fk'd.
# keywords 100/100 (200)
# singles,match,swipe,chat,meet,flirt,local,nearby,romance,hookup,lgbtq,gay,lesbian,bi,crush,spark,hot
```

Omitted from keywords because already indexed: Getfkd, casual, adult, dating. Residual review risk: `hookup` in the hidden keyword field (Guideline 1.1.4).

## Subtitle theme 2026-08-20 18:30 ET

Owner chose “Swipe, match, meet tonight”. Rebuilt keywords so swipe/match/meet/tonight are not repeated; dating/adult/casual moved into the keyword field.

```
PATCH appInfoLocalizations subtitle → Swipe, match, meet tonight (200)
PATCH version localization description/keywords/promotionalText (200)
# keywords 99/100 dating,adult,casual,singles,chat,flirt,local,nearby,romance,hookup,lgbtq,gay,lesbian,bi,crush,spark
# desc first line: Swipe, match, meet tonight. Get fk'd.
```

## Query research 2026-08-20 18:38 ET

US iTunes software search + AppTweak 2025 dating downloads + Apple search rules. Web language (hookup) is not store language: hookup/FWB/adult dating return 0 apps. romance/crush/spark/adult open the wrong category. meet tonight already maps to casual dating.

```
PATCH keywords → dating,date,casual,singles,chat,flirt,local,nearby,lgbtq,gay,lesbian,bi,queer,college (85/100)
```

Canvas: dating-app-store-queries.canvas.tsx. No competitor names used.

Cursor does not self-accept.
