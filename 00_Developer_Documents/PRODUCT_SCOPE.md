# Product scope (canonical)

**Status:** ACTIVE — overrides conflicting product docs  
**Updated:** 2026-08-14  
**Audience:** adults 18+; visual and product design emphasis on ages **18–25**  
**Minimum account age:** **18** (16–17 is never an access path)  
**User-facing program name:** **Get fk'd** (user instruction, 2026-08-14). Internal repo and API names may still say Swipe.  
**Active client:** **Apple-first Expo** at `apps/swipe/` (React Native + Expo; Android is the same codebase). ADR-0016.  
**Golden master (frozen):** `golden-master/swipe-dating-web/` — Python FastAPI/Jinja R&D. Do not edit that tree. Do not wrap it as the store app.

This document is the product boundary for Swipe Dating. If another product brief, ADR interpretation, research note, or UI sketch conflicts with this file on age, navigation, privacy floors, or prohibited surfaces, **this file wins** until a deliberate product decision updates it.

System behavior for coding agents (scores, match lifecycle, Bot Hunter UX, free-tier economy, modules, build order) lives in `docs/architecture/minimum-sufficient-architecture.md` (ADR-0017). If an older product note conflicts with that file on those topics, the architecture spec wins.

Do **not** recreate the deleted UniFFI `apps/ios` or `apps/android` trees. The only mobile tree is `apps/swipe/`. Store submission stays blocked until release gates and authentic approvals exist.

## One-sentence product

> An adults-only swipe app that ranks compatible people, gets matches offline quickly, and uses trusted community members plus automation to remove bots.

Anything that does not directly support that sentence must be deleted, consolidated behind a sheet, deferred behind a feature flag, or rejected.

## Permitted user-facing areas

| Area | Role |
|---|---|
| Swipe and matching | Primary loop: full-screen card, pass, like, mutual match |
| Community bot detection | Private report → trusted review → containment / challenge / remove |
| Profiles and preferences | Nested sheet: photos, bio, identity, verification, account |
| Alignment scoring | Curated questionnaire ranks eligible people; no user-tuned weights |
| Looking For modes | Curated intent list; private until mutual compatibility |
| Matches, limited messaging, meetup planning | Match list, chat, meetup CTA, unmatch / block / report |
| Get fk’d proximity mode | Logo toggle on Swipe (ADR-0024); off by default; both must be in mode for a Get Fk'd match; those matches and chats dissolve when either exits; location-share consent is recorded; live map stays Phase 5 |
| Opt-in match location | From Matches only; per-match consent; expiring shares |
| Skin Shop cosmetics | From Profile sheet; never affects rank, match, moderation, or safety |
| Boost / Superlike | Disclosed paid or earned reach tools. Never buy moderation, age, or block/report. No host-node or blockchain path (ADR-0019) |
| Sign in with Apple | After the 18+ gate; durable account across devices. No email/password. ADR-0020 |
| Crowdsourced `!` reports | A `!` on every page, subpage, button, and section opens Bug or Feature Request and stores that surface's link. Daily agent compile; human review. Cybersecurity filings are admin-only and never enter the community queue (ADR-0025). |

Required infrastructure (authentication, age assurance, payments, blocking, appeals, logging, security) is allowed. It must not become additional product surface or permanent tabs.

## Primary navigation (hard limit)

Exactly **two permanent tabs**:

1. **Swipe** — app opens here on a full-screen profile card.
2. **Matches** — match list, unread state, chat, meetup CTA, location-sharing prompt, match-map entry.

**Chat** is the only normal nested full screen. Everything else is a sheet or nested view:

- Profile sheet
- Filters sheet
- Alignment sheet
- Skin Shop sheet
- Community review sheet (eligible moderators only)
- Match map sheet (from Matches)

The Administrator console is a **separate web surface** on the live API (`/operator`). It is not a third dating tab and is not inside the Expo app (ADR-0020).

## Swipe card contents (allowed)

- Current profile card
- Alignment percentage (plus at most one or two useful agreement areas)
- Looking For intent
- Approximate distance
- A few self-declared lifestyle or grooming traits
- Pass / Like / Superlike
- Visible `Boost` label when a Boost is active
- Report suspected bot
- Top bar: Get fk’d toggle, Filters, Profile/avatar
- Boost (self) as a disclosed reach action, not a secret admin control

## Explicitly prohibited

- UniFFI / Swift / Kotlin `apps/ios` and `apps/android` trees; WebView wrappers of the golden master; store submission before release gates
- “Deepen Connection” / relationship phases
- Bio-first or progressive profile reveal
- User-adjustable ranking algorithms or weight editors
- Forced conversation starters / mandatory shared-ground openers
- Social feeds, Stories, popularity scores, public follower counts
- Streaks or daily engagement mechanics
- Separate safety dashboards for ordinary users
- Relationship coaching or compatibility essays
- Public downvote / hot-or-not voting of people
- Race, ethnicity, skin-color, or height filters
- Inferred intelligence, attractiveness, hygiene, or sexuality scoring
- Gender-based privacy defaults (including proximity disclosure)
- Paid moderation power, secret or unlabeled boosts, or Skin Shop / filters buying rank
- Hosting or spend buying report priority, appeal power, weaker age checks, or a block/report bypass
- Blockchain, IPFS, libp2p, Web3 app stores, user-hosted replica nodes, or any other blockchain/P2P distribution of the app or of profiles, photos, messages, or discovery metadata (ADR-0019)
- “I’m hosting a node”, Verified Host-as-replica, pinning, or on-chain identity as product surface
- Operator access to ordinary profiles, photos, or messages (the `/operator` console is metadata and suspend only)
- Email/password, Google, or Facebook login for ordinary users
- Any new feature not added here through a deliberate product decision

## Adults only and age assurance

- Design audience and visual style: **18–25**
- Minimum account age: **18**
- Age assurance must be stronger than typing a birthday alone for real-user builds
- No visibility, matching, messaging, proximity, marketplace, or sexual-intent access until adult verification succeeds
- Fail closed when adult eligibility cannot be established

## Privacy defaults (gender-neutral)

Every adult gets the same proximity / profile-share choices:

1. **Ask before sharing** — recommended default
2. **Auto-share with compatible nearby users**
3. **Never share**

Do not infer consent from gender. Gender feed preferences remain private. Location and proximity remain off by default.

## Community bot control (private moderation)

Operating law: **automation first, community second, staff last.** Community work is one question, one tap, under 10 seconds: **Bot / Human / Unsure**. No essays. No third tab. No public downvote feed.

Keep three independent scores — never one social-credit number:

1. **Authenticity** — likely a real human
2. **Match Reliability** — participates after an intentional match
3. **Bot Hunter Reputation** — accuracy when reviewing suspected bots

- Report from every profile card and conversation (≤3 taps): Block, Report, or Report & Block
- Bot reports feed Authenticity. Other report categories stay out of bot scoring
- Users progress **NEW → VERIFIED → TRUSTED → BOT_HUNTER**. Thresholds are configuration-driven
- Eligibility must not depend on attractiveness, match count, spend, hosting, or popularity
- Authenticity states: NORMAL → SUPPRESSED → CHALLENGED → REVIEW → FROZEN → REMOVED. A single community report never auto-bans
- Progressive challenges before removal. Real humans get a path back without staff
- Weighted Bot Hunter consensus; accurate reviewers gain influence; bad-faith or inaccurate reviewers lose it
- Users cannot review themselves or the same target repeatedly. Review rewards have daily limits
- Blocking is absolute, reciprocal, silent to the blocked person, and never lowers Reliability

## Free-tier economy and match lifecycle

- Free discovery: **30 swipes/day** (configurable). That allotment stays unpaywalled
- Extra swipes may come from verification, Bot Hunter work, achievements, or paid plans — never from Skin Shop cosmetics buying rank
- Matches are a state machine (MATCHED → AWAITING_REPLY → ACTIVE, or EXPIRED / UNMATCHED / BLOCKED) with configurable expiration and a visible countdown
- Configurable active-match limit to stop hoarding
- Reliability penalizes only: intentional match → received first message → never replied → expired. Do not penalize block, report, reject, unmatch, or conversations both people joined

## Matching and ranking

Hard eligibility first:

- Both verified adults
- Mutual gender/feed compatibility
- Overlapping Looking For modes
- Allowed distance
- Neither blocked the other
- Neither contained as a likely bot

Then a **labeled priority cohort** (active Boost only) may be shown before the ordinary alignment-ranked deck. Paying more never creates a second, higher queue. Alignment weights stay fixed and must not include purchases or Boost/Superlike as score dimensions. Dealbreakers may exclude. Users cannot tune algorithm weights. Filters use self-declared choices only (curiosity / conversation depth — never inferred “intelligence”). Skin Shop cosmetics cannot buy extra rank.

## Messaging and meetup

- Initial experiment: 20 messages per match with a visible counter
- Persistent Plan a meetup button
- At the limit: plan meetup, mutually extend once, or unmatch — do not silently delete the chat
- No mandatory openers, synthetic reply buttons, relationship-phase prompts, or reflection questionnaires in chat

## Feature flags (until core acceptance)

Get fk’d proximity, Match Map, and Skin Shop remain Phase 5 / feature-flagged until Phases 1–4 in the minimum-sufficient architecture are working. Creator Skin Shop sales require moderation, payments, copyright, and abuse controls first.

## Execution sequence

Follow ADR-0017 phases. Each phase must leave the local app runnable.

| Phase | Focus | Exit condition |
|---|---|---|
| 1 | Functional dating core | Account, profile, discover, swipe, match, message, block |
| 2 | Differentiation | Match states, expiration, reliability, active-match limit, Looking For, alignment |
| 3 | Human verification | Verification ladder, authenticity score/events, suppression, progressive challenges |
| 4 | Community anti-bot | Report queue, Bot Hunters, weighted consensus, swipe rewards, badges |
| 5 | Expansion | Proximity, match map, marketplace / creator economy |

## Definition of done (product)

- Only two permanent tabs exist
- First normal screen is a swipe card
- No questionnaire, algorithm editor, or research explanation blocks swiping
- Deepen Connection and relationship phases are completely gone
- Bot reporting ≤3 taps; Bot Hunter review is Bot / Human / Unsure in under 10 seconds
- One malicious voter cannot bury a profile; authenticity, reliability, and hunter reputation stay separate
- Qualified weighted consensus can suppress or remove a likely bot; a single report never auto-bans
- Automation first, community second, staff last — staff still handle legal / NCII / child-safety exceptions
- Strictly 18+; gender never sets privacy defaults
- No race/ethnicity/skin-color/height filters; no inferred intimate trait scoring
- Purchases never buy moderation power
- Skin Shop cosmetics cannot buy reach
- Disclosed Boost / Superlike reach is allowed; it is never a secret admin boost and is not a host-node or blockchain reward (ADR-0019)
- Location and proximity off by default
- Messaging points toward meetup or mutual extension
