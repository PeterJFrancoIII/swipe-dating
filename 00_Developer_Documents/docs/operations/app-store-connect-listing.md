# App Store Connect listing (human paste)

**Updated:** 2026-08-20  
**Status:** Paste aid only. Not a launch approval. Agent does not submit.

Upload **store IPA 12** (`713f97cc-bc96-4ddd-9a25-c4b9a3d98955`). IPA 11 tightened policy; IPA 12 is the first-pass harden (age-gate unavailable vs declined, finished fail-closed, leave-Get-Fk'd-off, discover retry). Do not upload build 11 or earlier.

Public HTTPS (operational copy for this version; not counsel-signed):

- Privacy: https://getfkd.sentineldefensetechnologies.co.za/legal/privacy
- Terms: https://getfkd.sentineldefensetechnologies.co.za/legal/terms
- Support: https://getfkd.sentineldefensetechnologies.co.za/legal/support
- Community rules: https://getfkd.sentineldefensetechnologies.co.za/legal/community

Operator contact: `peterjfrancoiii@icloud.com`

## Listing

| Field | Value |
|---|---|
| Name | Getfkd |
| Subtitle | Casual adult dating |
| Bundle ID | app.getfkd.ios |
| SKU | getfkd-ios |
| Primary category | Lifestyle (or Social Networking if Apple’s form fits better) |
| Age rating | Complete the questionnaire; dating + sexual content typically lands 17+ |
| In-app name | Get fk'd |
| Privacy Policy URL | https://getfkd.sentineldefensetechnologies.co.za/legal/privacy |
| Support URL | https://getfkd.sentineldefensetechnologies.co.za/legal/support |
| Copyright | 2026 Peter Franco |

Promotional text (170):

> Adults-only dating with heat. Swipe singles, match, flirt, and plan a real night out. Optional Get Fk'd nearby. 18+ only. Block and report stay free.

Description:

See `app-store-connect-upload/03-description.txt` (conversion copy; Apple does not index the long description for US search).

Keywords (100 chars, hidden; no repeats of name/subtitle):

> singles,match,swipe,chat,meet,flirt,local,nearby,romance,hookup,lgbtq,gay,lesbian,bi,crush,spark,hot

## Screenshots (you take these on a device)

Required for iPhone (tablet not used; `supportsTablet` is false):

- 6.7" display: 1290 × 2796
- Capture at least: Age gate, Swipe card, Matches list, a chat, Profile

Do not include other people’s real faces without consent. Sample deck adults are fine.

## Privacy nutrition labels (intended)

Collect / linked to identity:

- User Content — profile text and photos you upload
- Identifiers — session / account id
- Coarse Location — a reduced-accuracy GPS sample is turned into a 1-mile randomized cell; peers see a rounded mile band only
- Sensitive Info — optional gender, lifestyle, and looking-for fields used only to match adults
- Other Diagnostic Data — only if you later enable crash reporting (off now)

Do **not** declare:

- Precise Location
- Nearby Interactions as collected data (Get Fk'd Bluetooth RSSI stays on-device and is not uploaded)
- Contact Info — only if Apple shares an email on first Sign in with Apple (not shown on the dating card)
- Purchases (no IAP in this version)
- Advertising Data
- Used for tracking
- Sold to data brokers

## Age rating questionnaire (honest answers)

- Unrestricted web access: No
- Gambling: No
- Mature/suggestive themes: Yes, frequent
- Sexual content or nudity: Yes if users can upload it; otherwise frequent mature themes
- Profanity: Yes (the name)
- Horror/violence: No
- Alcohol/drugs/tobacco references: Yes, self-declared profile fields
- Medical/treatment: No
- In-app purchases: No

Apple 17+ is the expected floor. An App Store 18+ download block is not worldwide.

## App Store Connect review notes (paste)

```
FIRST-PASS
- Review on a device that can share Apple Declared Age Range 18+ (iOS 26+). If age cannot be shared, the app stays on a finished age-check screen on purpose. That is not a crash.
- No demo user/password. Use Sign in with Apple.
- Leave Get Fk'd OFF. Ordinary swipe, photos, chat, and meetup work with it off.
- The deck includes sample adults so review is not empty.
- No IAP. Boost/Superlike appear only when granted. Zero allotment hides or disables the control; it does not offer a purchase.

Getfkd is an adults-only (18+) dating app. In-app name: Get fk'd. Store listing name: Getfkd.

SIGN IN: After the 18+ gate, Sign in with Apple. No email/password. Sign out keeps the Apple-linked account. Delete account wipes it (Profile → Delete account; in-app; permanent).

AGE: Entitlement com.apple.developer.declared-age-range; ageGates 18. Fail closed if declined, unavailable, or under 18. No parental-consent bypass. No birthday workaround on store builds.

WALKTHROUGH
1. Continue with Apple age. Privacy, Terms, Community Rules, and Support are linked first.
2. Sign in with Apple.
3. Onboarding: gender + smoking/drinking/drugs. Agree to Community rules. Photo policy, then photos.
4. Swipe: Pass / Superlike (if granted) / Like. Card tap opens the full profile. Report includes Appears under 18 and Non-consensual intimate images.
5. Matches: message, Plan a meetup (meet in public), Block/Report.
6. Profile: Safety box, export, delete.
7. Optional only: Get Fk'd logo → read confirm → enter. Bluetooth is requested only after confirm. Leave from the same control.

GET FK'D: Optional, off by default. 1-mile discovery. Foreground Bluetooth only; radio carries no name/photos/profile. Ambient sonar, no lock-screen/background cues, no exact distance. Mutual mode match only. Exit dissolves those chats. RSSI is not uploaded.

SAFETY / 1.2: Block and report are free. Under-18 and NCII reports are treated as urgent; also email peterjfrancoiii@icloud.com with URGENT. Underage/CSAM/trafficking text is filtered before post. Photos: you only; no one under 18; no NCII; EXIF not requested. Adult sexual content between consenting 18+ users is allowed. Dating app, not a porn viewer.

LOCATION: Coarse region / mile band only. No exact peer coordinates.

HOST: https://getfkd.sentineldefensetechnologies.co.za (Privacy and Support on that host). Contact: peterjfrancoiii@icloud.com
```

## What you click (agent will not)

Store IPA **12** is the first-pass review binary. Declared Age Range is already on the App ID. Do this next, in order:

1. App Store Connect → create the Getfkd iOS app if it does not exist (bundle `app.getfkd.ios`).
2. Take 6.7" screenshots (1290 × 2796): Age gate, Swipe, Matches, chat, Profile. Optional: Get Fk'd confirm sheet. Sample adults only.
3. Paste the listing fields, privacy nutrition labels, age questionnaire, and review notes above.
4. Upload IPA 12 yourself once EAS marks it FINISHED (pin that build id; do not use `--latest` if an older store IPA exists):

```bash
cd "/Users/computer/App Development/Swipe Dating/apps/swipe"
eas submit --platform ios --id 713f97cc-bc96-4ddd-9a25-c4b9a3d98955
```

5. You click **Submit for Review**. The agent will not.

## Honest remaining blockers

A public App Store release can still be rejected after IPA 12:

- Counsel has not signed `approvals/`; `make production-preflight` must fail closed
- The live API is a NAS dogfood host, not a verified production account
- In-app name **Get fk'd** will be 17+ and may be fought
- Review the age gate on a real iOS 26+ device (Declared Age Range)
- Get Fk'd stays in this iteration: optional, disclosed, foreground-only Bluetooth. Apple can still question a sexual-context proximity cue; the review notes explain it.
- Boost / Superlike are granted-only controls with no StoreKit; say that in review notes (already above)
- Store ATS no longer allows local networking; the client talks HTTPS only
- Get Fk'd sonar is ambient foreground audio, not a background-audio mode
- You still have to take screenshots, upload, and click Submit
