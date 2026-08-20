# App Store Connect / preview checklist (human only)

**Status:** Agent must not submit. You click every Apple button.  
**Updated:** 2026-08-20

This is not a launch approval. `approvals/` is still empty. `make production-preflight` must still fail closed. Paste-ready listing copy: `docs/operations/app-store-connect-listing.md`.

## What the agent will not do

- `eas submit`
- TestFlight external or App Store review
- Fabricated legal / T&S / executive sign-off
- Filling `CHANGE_ME` owners
- Production cloud deploy

## Binary prep (done)

1. Paid Apple Developer Program for `app.getfkd.ios` (team S8QMQZA656).
2. EAS project `@sentinel-defense-technologies/getfkd`.
3. Store profile: `eas.json` `production` / `distribution: store`.
4. Store IPA **12** is the first-pass review binary (age-gate unavailable vs declined, finished fail-closed, leave-Get-Fk'd-off). Builds 3–11 are stale.
5. Android / Play is out of scope for Apple review.

## What you do to put it in review

1. Install IPA 12 on a real iOS 26+ device and walk Age gate → Sign in with Apple → onboarding → swipe. Leave Get Fk'd OFF unless you are capturing that optional sheet.
2. In App Store Connect, create Getfkd if needed (bundle `app.getfkd.ios`).
3. Paste fields from the listing doc (name, subtitle, description, keywords, 17+ questionnaire, privacy nutrition, FIRST-PASS review notes).
4. Take 6.7" screenshots (1290 × 2796): Age gate, Swipe, Matches, chat, Profile. Sample adults only.
5. You upload and click Submit after EAS marks IPA 12 FINISHED. Pin that build id. Do not use `--latest`.

A public click can still be rejected: empty approvals, NAS-hosted API, profane in-app name, optional Get Fk'd Bluetooth, age-range only on devices that can share it.

## In-app vs home screen

- Home screen / store listing: **Getfkd**
- In-app lockup: `00_Developer_Documents/Logo's & Marketing/GetFk'd_In-App_Logo_2k_10bit.png` (mark + `GetFk'd`; do not stack a second text wordmark)
