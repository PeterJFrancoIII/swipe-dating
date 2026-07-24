# Adult feature expansion

**Status:** APPROVED FOR STAGING SCAFFOLD ONLY  
**Updated:** 2026-07-21  
**Real-user status:** BLOCKED by `docs/governance/release-gates.md`

This document translates the requested proximity, marketplace, location, intent, preference, questionnaire, and anti-bot features into an implementable adults-only product specification.

## Product boundary

The app remains **18+ only**. Adults ages 18–25 are a primary design audience, but nobody age 16 or 17 may create a profile, broadcast proximity, select sexual intent, match, map, join a group encounter, or message.

The product is sex-positive and permits adults to express private relationship and sexual intent. It does not become a public pornographic feed, a sexual-services marketplace, a covert tracking tool, or a gender-asymmetric disclosure system.

## 1. Get fk'd proximity mode

### User promise

A user can turn **Get fk'd** on or off from the main Discover page. When two eligible, opted-in adults are within practical Bluetooth range, each device may produce a generic haptic alert and offer a consent-controlled profile exchange.

Detection is best effort. Operating-system suspension, permissions, battery state, radio conditions, and hardware affect results.

### Privacy defaults

The same defaults apply to every gender:

```text
Get fk'd: Off
Profile disclosure: Prompt before sharing
Lock-screen text: Generic
Encounter history: Not retained
```

A user may explicitly choose automatic profile disclosure to locally compatible nearby adults. No gender receives a forced or weaker default.

### Staging states

```text
Off
On — prompt before profile share
On — auto-share with compatible users
```

### BLE payload

Advertisement payload may contain only:

- protocol version;
- random rotating encounter ID;
- short epoch;
- capability flags that reveal no identity or sexual intent.

It must not contain profile ID, root key, rendezvous ID, gender, orientation, age band, Looking For mode, location, or marketplace identity.

### Encounter flow

1. Verify current adult credential and device/app integrity.
2. Begin bounded BLE advertise/scan.
3. Detect rotating identifier.
4. Perform challenge-response handshake and replay check.
5. Evaluate compatibility locally.
6. Emit one generic haptic within cooldown.
7. Ask each user whether to share a profile unless auto-share was separately enabled.
8. Exchange pairwise, expiring profile-fetch capabilities.
9. Transfer profile over relay-first encrypted transport.
10. Block, emergency privacy, or mode-off terminates scanning/advertising and suppresses future exchange.

### Explicit exclusions

- no exact distance;
- no direction arrow;
- no nearby user count in small venues;
- no server encounter graph;
- no persistent local encounter history by default;
- no automatic sexual-intent disclosure;
- no buzz from blocked users;
- no repeated buzzing within cooldown.

### Current implementation status

The iOS staging UI exposes the governed toggle and disclosure policy. Real CoreBluetooth advertising/scanning is **not implemented** and remains feature-gated.

## 2. Skin Shop

### Scope

Users may create, publish, obtain, and apply:

- avatars;
- profile-card themes;
- chat skins;
- reaction packs;
- bounded declarative animations.

### Identity labels

The UI must distinguish:

```text
Avatar profile
Photo profile
Photo-verified profile
```

An avatar cannot imply photo or identity verification.

### Marketplace isolation

Skin Shop is a separate public-asset plane. It may process catalog metadata, public assets, moderation state, purchase receipts, entitlements, creator payout records, and IP reports. It receives no profile preferences, messages, precise location, proximity history, questionnaire answers, safety cases, or dating rank data.

### Safe asset formats

Initial allowlist:

- PNG;
- WebP;
- AVIF;
- restricted SVG/declarative vector subset;
- bounded declarative animation manifest.

Initial denylist:

- JavaScript;
- arbitrary HTML;
- executable plugins;
- arbitrary shaders;
- embedded remote requests;
- unbounded 3D assets;
- archives with executable content.

### Commerce rules

- use platform billing where required;
- validate and restore entitlements;
- define creator revenue share before public claims;
- moderate assets before broad distribution;
- provide IP/takedown, refund, appeal, and payout-fraud processes;
- purchases never affect dating rank, reach, messaging, report priority, or safety access.

### Current implementation status

Staging contains a synthetic catalog and non-purchasing preview UI. StoreKit, Play Billing, creator uploads, moderation, payouts, and production asset storage are **not implemented**.

## 3. Matched-location map

### Separate grant types

1. **Approximate match-area snapshot** — coarse area from the moment both users consent.
2. **Meeting pin** — a deliberately selected place.
3. **Temporary live location** — 15 minutes, 1 hour, 4 hours, or explicit stop.

Matching alone shares no location. Default is off. Precise location requires a second confirmation.

### Grant requirements

A grant contains:

- share ID;
- sender and recipient profile IDs;
- mode and precision;
- purpose;
- issue and expiry times;
- sequence number;
- signing key ID and signature.

The grant and coordinates/cell are encrypted to the recipient. The relay handles ciphertext only.

### Revocation

Explicit stop, block, unmatch, emergency privacy, or account deletion ends active grants. The receiver hides cached display immediately and retains no historical trail unless the sender deliberately shared a meeting pin that remains within its stated purpose and expiry.

### Current implementation status

Staging provides consent choices and a synthetic map/list presentation only. Core Location, MapKit, E2EE location envelopes, background sharing, and revocation networking are **not implemented**.

## 4. Looking For modes

Initial adult taxonomy:

- long-term relationship;
- dating;
- casual sex;
- group encounter;
- cuddles;
- movie night;
- dinner or drinks;
- concert or event;
- gaming;
- gym or activity partner;
- sober hangout;
- conversation;
- friends first;
- non-monogamous connection;
- still figuring it out.

Each selection supports visibility and duration:

```text
Visibility: compatible users only | matches only | hidden
Duration: tonight | 24 hours | 7 days | persistent
```

Sexual intent is disclosed only after both users independently select compatible adult intent.

Group encounters require the complete participant roster and renewed consent whenever membership changes.

## 5. Audience and experience

The design audience is adults 18–25, with:

- expressive avatars and skins;
- fast but honest onboarding;
- event and activity modes;
- local explainable compatibility;
- clear consent controls;
- strong bot and verification signals;
- no popularity leaderboard;
- no pay-to-win discovery;
- accessible alternatives to gesture-only interaction.

A separate product would be required for any under-18 social experience. It cannot share discovery, sexual modes, profiles, or messaging with this app.

## 6. Gender, orientation, and visibility

Model separate optional fields:

- gender identity;
- pronouns;
- sexual orientation;
- who I want to see;
- who may see me;
- visibility of each field.

Candidate preferences control only the user’s private feed. The system never tells another person why they were excluded and never labels one identity as normal or abnormal.

## 7. Filters

### Not supported

- race;
- ethnicity;
- skin color;
- disability;
- height;
- nationality used as an ethnicity proxy;
- photograph-inferred attractiveness;
- photograph-inferred intelligence, hygiene, sexuality, gender, fitness, grooming, or body hair.

### Eligible self-reported compatibility fields

- activity/fitness lifestyle;
- smoking/vaping;
- alcohol/sober lifestyle;
- sleep schedule;
- education or trade path;
- conversation depth and curiosity;
- social energy;
- relationship style;
- adult intimacy interests;
- body-hair preference;
- grooming style;
- fragrance preference;
- distance band;
- availability.

Use neutral private preference language. Do not display humiliating hygiene scores or degrading badges.

## 8. Alignment questionnaire

The questionnaire is versioned data, not an unchangeable code constant. The app ships a reviewed built-in version and can migrate locally to later versions.

Each question supports:

- skip / prefer not to say;
- answer;
- importance 0–5;
- dealbreaker on/off;
- visibility: profile, score only, private/unused.

Categories include values, politics, education/work, money/health, relationship structure, communication, lifestyle, adult intimacy, grooming, family goals, religion/philosophy, and technology.

### Ranking

Scoring runs locally:

```text
score = matched reciprocal weight / comparable reciprocal weight
```

A reciprocal dealbreaker conflict excludes the candidate. Score inputs exclude popularity, attractiveness, purchases, spending, creator status, race, ethnicity, skin color, disability, and other protected traits.

The UI explains strongest alignment areas and material differences without claiming to predict relationship success.

### Sensitive answers

Political, sex-life, orientation, and relationship data require category consent, encrypted local storage, export/delete controls, and exclusion from ads and ordinary telemetry.

## 9. Bot, spam, scraping, and Sybil protection

Layer controls:

1. passkey or equivalent account authentication;
2. root-authorized device key;
3. expiring adult credential;
4. iOS App Attest / Android Play Integrity assertion with server nonce/request binding;
5. signed requests and replay cache;
6. pairwise or anonymous quotas;
7. adaptive velocity and graph-risk signals;
8. proof-of-work or additional verification only for elevated risk;
9. human review and appeal for consequential containment.

Risk signals may include registration velocity, profiles per attested device, discovery/profile-fetch velocity, automated fan-out, impossible travel, BLE replay, malicious links, repeated hashes, coordinated reports, and marketplace fraud.

Private message plaintext, questionnaire answers, orientation, sexual intent, and protected traits are not general bot-scoring inputs.

Ordinary human use remains free; payment is not the anti-bot gate.

## Delivery order

1. governance and protocol freeze;
2. network-enforced adult credential and anti-bot foundation;
3. local preferences and questionnaire;
4. consent-based proximity;
5. match-scoped location;
6. Skin Shop commerce;
7. adversarial testing and staffed safety operations;
8. closed beta only after all gates pass.
