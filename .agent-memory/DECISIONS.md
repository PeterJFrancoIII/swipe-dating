# Shared decisions

Architect-owned. Append only. Do not rewrite or delete prior entries.

## Format

```md
### AM-NNN — short title
- **Date:** YYYY-MM-DD
- **Status:** accepted
- **Decision:** ...
- **Rationale:** ...
- **Consequences:** ...
```

## Decisions

### AM-019 — Photo and adult API routes must not mint sessions
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** `/api/profile/photos` and other adult/gated routes require a live session. Missing or stale `X-Swipe-Session` returns `401 session_required` and does not count as signup velocity. Caps in ADR-0023 stay as they are.
- **Rationale:** A real photo add returned "Slow down and try again later." because the photo POST minted when the Expo token was missing or stale, then hit the IP mint cap. Probe POSTs without a session had the same effect.
- **Consequences:** Bootstrap without a live token still mints. Expo restores the stored token before upload. No store submit.

### AM-001 — Adopt repository-tracked shared memory
- **Date:** 2026-08-12
- **Status:** accepted
- **Decision:** Adopt `.agent-memory/` as the durable coordination space shared by Codex and Cursor.
- **Rationale:** Cross-agent handoffs need a tracked, reviewable place for context, decisions, and task records without relying on chat transcripts.
- **Consequences:** Agents must read shared memory on startup. Task status and evidence live under `.agent-memory/tasks/`. Shared memory cannot override user instruction, product scope, mission, or governance.

### AM-002 — Role split: Codex architect, Cursor implementer
- **Date:** 2026-08-12
- **Status:** accepted
- **Decision:** Codex is architect/admin; Cursor IDE agents are bounded implementers.
- **Rationale:** Clear ownership prevents scope drift, conflicting product decisions, and self-approval of incomplete work.
- **Consequences:** Codex alone assigns work, curates `CONTEXT.md`/`DECISIONS.md`/`CURRENT.md`, and changes status from `ready_for_review` to `accepted`. Cursor works only inside architect-provided allowed files and returns evidence for review.

### AM-003 — Freeze Python web R&D as golden master
- **Date:** 2026-08-13
- **Status:** accepted (user instruction)
- **Decision:** Snapshot the current FastAPI/Jinja web app into `golden-master/swipe-dating-web/` and lock it as the golden master. Do not edit that tree.
- **Rationale:** Preserve the working swipe deck (including full-detail discovery photos) as the reference implementation before any later client work.
- **Consequences:** `PRODUCT_SCOPE.md`, `make web-test`, and `make web-governance` point at the freeze. Public/Cloudflare/App Store deploy remain blocked.

### AM-004 — Apple-first Expo client
- **Date:** 2026-08-13
- **Status:** accepted (user instruction)
- **Decision:** Active client is React Native + Expo at `apps/swipe/`. Apple first; Android is the same codebase. Do not use Flutter, a React website, or a WebView of the golden master.
- **Rationale:** TypeScript is what current coding models write most reliably. EAS Build produces iOS and Android binaries from one project (`eas build --platform all`).
- **Consequences:** ADR-0016. UniFFI `apps/ios` / `apps/android` stay deleted. Store submission stays blocked until release gates pass.

### AM-005 — Minimum Sufficient Architecture (coding-agent handoff)
- **Date:** 2026-08-14
- **Status:** accepted (user instruction)
- **Decision:** Adopt `docs/architecture/minimum-sufficient-architecture.md` (ADR-0017) as the system-behavior spec for coding agents: automation first, community second (Bot / Human / Unsure, under 10 seconds), staff last; three independent scores; 30 free swipes/day with earned or paid extras; match state machine and expiration; five-phase build order on the existing Expo + live API stack.
- **Rationale:** The product owner handed this as the version they would actually give Cursor. Older crowd-essay, unpaid-only-swipe, and “no discovery until full bot control” notes conflicted with it.
- **Consequences:** `PRODUCT_SCOPE.md` keeps age, two-tab nav, and privacy floors. The architecture spec wins on scores, match lifecycle, Bot Hunter UX, economy, and build order. Implementation still requires a bounded slice; this decision does not authorize production, store submission, or editing the golden master.

### AM-006 — No blockchain distribution
- **Date:** 2026-08-14
- **Status:** accepted (user instruction)
- **Decision:** Remove blockchain, IPFS, libp2p, Web3 catalogs, and user-hosted replica nodes as a distribution or product path. ADR-0019. ADR-0015 replica/host-node path withdrawn. Boost/Superlike may remain as ordinary disclosed reach.
- **Rationale:** Product owner: remove anything related to blockchain distribution of this app.
- **Consequences:** No hosting toggle or Verified Host replica badge in Expo. Historical decentralized research is not an implementation spec. Do not edit the golden master.

### AM-007 — Fail-closed fraudulent signup
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** ADR-0023. Strict mode fails closed on automated or duplicated signup (velocity, frozen birth date, Apple bind to finish, too-fast onboarding, photo hash reuse, session lock). App Attest is the next slice. A single community report still never auto-bans.
- **Rationale:** Product owner asked for hyper-critical anti-botting that always fails closed when signup looks fraudulent.
- **Consequences:** NAS and store clients cannot complete onboarding without Apple. Tests use `signup_relaxed`. Exact location stays off except future mutual Get Fk'd Matching on the in-app map.

### AM-008 — Enforce 30 free swipes per day
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** Enforce `system_config.daily_free_swipes` (default 30) on like, pass, and superlike. Hitting the cap returns `daily_swipe_limit` and does not record the decision. It does not lock the account. Undo of a non-match refunds one swipe. A new calendar day resets the count. Extra swipes from verification / Bot Hunter / paid stay out of this slice. HTML discover/chat must use mile-band labels, never exact km.
- **Rationale:** Product owner said keep going after fail-closed signup. A bound Apple account could still farm the deck. PRODUCT_SCOPE and ADR-0017 already specified 30 free swipes/day.
- **Consequences:** Discover `reach` exposes `swipes_remaining` and `daily_swipe_limit`. The 30 are not paywalled. App Attest remains the next anti-bot slice.

### AM-018 — Phone converts picks to HEIC before upload
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** The iPhone encodes each profile pick to HEIC (1080×2400, no GPS) on-device, then uploads that file. Expo Go without the native encoder still sends the original pick so the server can convert.
- **Rationale:** Product owner said the phone should automatically convert to the default format before upload.
- **Consequences:** New `getfkd-photo` module. A native rebuild is required for on-device encode. No store submit.

### AM-017 — iPhone 14+ photos stay HEIC
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** Profile photos use HEIC for store and iOS decode. That is the most efficient still format iPhone 14+ can encode and hardware-decompress. Do not JPEG-transcode library picks (`Current` representation, no picker `quality`). iOS fetches send `Accept: image/heic`. Server HEIC uses 4:2:0. AVIF stays the non-iOS display fallback.
- **Rationale:** Product owner asked for the highest compression efficiency supported by iPhone 14 and up for storage and decompression. AM-015’s client JPEG resize is superseded for Expo Go.
- **Consequences:** ADR-0007 addendum. Server still rasterizes to 1080×2400 and strips EXIF/GPS. NAS 48 MB upload cap remains. No store submit.

### AM-016 — Get Fk'd mode is an ephemeral dual-consent toggle
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** ADR-0024. The in-app lockup toggles Get Fk'd mode. Enter warns that location may be shared only with someone you match while both are in the mode. Exit dissolves those matches and chats after a numbers prompt (skippable locally). Exact coordinates stay off discover/chat in this slice.
- **Rationale:** Product owner asked for a glowing/pulsing/dripping logo button, the location warning, and mode-only matches that disappear on exit.
- **Consequences:** Ordinary matches are unchanged. Live map remains Phase 5. No store submit.

### AM-015 — Profile photo uploads must clear the NAS 8 MB nginx cap
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** NAS nginx allows 48 MB profile-photo bodies and 90s encode; Expo resizes picks to the 1080×2400 raster as JPEG before upload. HTML 413 maps to `photo_too_large`.
- **Rationale:** A real selfie POST of 9 MB was rejected live with nginx HTML 413 (`client_max_body_size 8m`). The client showed "Upload failed."
- **Consequences:** tmpfs for nginx client bodies is 80 MB. Store IPA 7 still sends full-size originals; Expo Go / next client build send compressed JPEGs. No store submit.

### AM-014 — Governed 2K in-app lockup
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** The canonical in-app lockup is `00_Developer_Documents/Logo's & Marketing/GetFk'd_In-App_Logo_2k_10bit.png`. Expo derivatives are generated from that file only. Do not treat Downloads or chat attachments as the source of truth.
- **Rationale:** Product owner placed and renamed the 2K 10-bit lockup for governance records and said it is the main in-app logo.
- **Consequences:** AM-012/AM-011 marks are superseded for the current lockup; those entries stay as history. Do not copy the 2K master into `apps/swipe/assets/images/`. Store submission stays blocked.

### AM-013 — Profile photo chrome, gear settings, quiz on profile
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** The compatibility quiz is opened from Profile settings only. The swipe chrome profile control is the user's main photo, round and smaller. Settings (discovery filters) is a gear icon.
- **Rationale:** Product owner asked to move the quiz off the swipe/matches chrome and to use photo + gear as the two overlay entries.
- **Consequences:** Swipe and Matches no longer show a quiz chip. `/filters` is titled Settings.

### AM-012 — Owner Gemini lockup is the Get fk'd logo
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** The in-app logo, splash, favicon, and app icons are the owner-supplied Gemini lockup (mark plus `GetFk'd` wordmark), not the earlier programmatic pink glyph.
- **Rationale:** Product owner pointed at `Gemini_Generated_Image_eenzd1eenzd1eenz.jpg` and said to use it as the logo.
- **Consequences:** AM-011 glyph generation is retired. Expo Go still cannot replace its home-screen icon. No store submit.

### AM-011 — Get fk'd mark is a pink heart-to-glans glyph
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** The brand mark is a single reddish-pink heart color. The top is a heart; the bottom is a rounded glans tip, not a sharp triangle. A cute vein runs down the center in the same pink family (slightly deeper rose), never white or blue.
- **Rationale:** Product owner specified the current suggestive mark should stay suggestive, with the bottom reading as a tip and the whole glyph staying heart-pink.
- **Consequences:** App icons, splash, and in-app chrome use this mark. Expo Go cannot replace its own home-screen icon. No store submit.

### AM-010 — 200-question compatibility quiz; Skip is an answer
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** The compatibility quiz is 200 relationship and sex questions. Users may skip any question. Skip is stored as answer id `skip`, counts toward `answered`, and is excluded from pairwise comparison with `prefer_not`. If there is no overlapping comparable answer, hide the score (`None`) instead of showing 0%.
- **Rationale:** Product owner asked for a large, skippable bank of questions that matter to relationship and sex compatibility, without skip feeling like a penalty.
- **Consequences:** `QUESTIONNAIRE_ID` stays `getfkd-alignment-v1`. Quiz answers stay out of bot-risk inputs (ADR-0013). Two iOS Simulators are the local way to test a match without two phones.

### AM-009 — It's a match moment and live photos
- **Date:** 2026-08-16
- **Status:** accepted (user instruction)
- **Decision:** Mutual like shows a visible match overlay (Say hi / Keep swiping). Live uploaded photos are served on discover, the match moment, Matches, and chat. After a match, the peer's photos stay visible. Passed people stay hidden.
- **Rationale:** Product owner asked to keep going until there was something new to see and test. The core loop was a toast plus letter avatars.
- **Consequences:** Discover actions return `matched_with`. Match rows include `photo_url`. Store IPA 7 does not include the Expo overlay.
