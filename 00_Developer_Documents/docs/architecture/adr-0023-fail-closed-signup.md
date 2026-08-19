# ADR-0023: Fail-closed fraudulent signup

**Status:** Accepted by user instruction (2026-08-16)  
**Date:** 2026-08-16

## Context

A script can mint unlimited `live:{random}` sessions, pass the typed age gate, skip Sign in with Apple by omitting `X-Getfkd-Release`, finish onboarding in milliseconds with reused bytes, and appear in discovery. Store/preview already require Apple on gated routes. That does not stop account farming. Community Bot Hunter is a later, human-review path: a single community report never auto-bans.

The product owner asked for hyper-critical anti-botting that always fails closed when signup looks fraudulent. App Attest is deferred to a later slice.

## Decision

- **Strict mode** (NAS default, store, preview, and any client that omits the release header): treat as production. Missing `X-Getfkd-Release` is not a bypass.
- **Relaxed mode** (`create_test_app` and `GETFKD_SIGNUP_RELAXED=1`): skip velocity, Apple-to-finish, too-fast, photo-reuse, and lock so pytest and local Metro keep working.
- Fail closed means: do not set `onboarding_complete`, do not enter `live_profiles()`, return stable codes, and lock the session when the signal is fraud (not merely “slow down”).
- Do not tell the client which signal fired.
- Risk inputs may be request velocity, hashed install, hashed client IP, photo SHA-256, frozen birth submission, and prior lock. Risk inputs must not be private messages, questionnaire answers, sexual intent, orientation, gender, race, ethnicity, disability, or spend.
- Client IP is used only as a velocity bucket. Never as location. Prefer `CF-Connecting-IP`. Store only hashes.
- Exact coordinates stay forbidden on signup, discover, and ordinary chat. The only future exact-location path is Get Fk'd mode after both adults toggle it on and both agree to Get Fk'd Matching, shown on the in-app map (Phase 5; not this slice).
- This path is not community auto-ban. Bot Hunter and “one report never auto-bans” are unchanged.

## Consequences

- We cannot prove a human. A determined person with a real Apple ID and unique photos can still get through until App Attest exists.
- Cafe/campus NAT may hit IP caps. Caps are configurable. Apple bind remains the expensive unique signal.
- Existing already-onboarded accounts stay complete (sticky `onboarding_complete`) even without Apple.
- Expo Go against NAS cannot finish a **new** signup without Apple. That is intended.
- Adult API routes (`/api/profile/photos`, onboarding, discover) must not mint a session. Missing or stale `X-Swipe-Session` returns `401 session_required` and does not count toward the IP mint cap. Only `/api/session` and `/api/bootstrap` without a live token may mint.

## Rejected alternatives

- App Attest / Play Integrity / CAPTCHA in this slice.
- Using quiz answers, gender, bio similarity, or messages as bot-risk inputs.
- Auto-banning from a single community report.
- Treating a missing release header as a development bypass on NAS.
- Using IP as a city or distance substitute.
- Building the Get Fk'd live map or Skin Shop here.
