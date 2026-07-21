# ADR-0012: Skin Shop marketplace boundary

Date: 2026-07-21  
Status: accepted for staging catalog; commerce blocked  
Decision owners: Product + Security + Mobile + Finance + Trust & Safety

## Context

Users should be able to create, share, and purchase avatars, profile skins, and chat themes. Public marketplace assets are different from private dating data and can be centrally cached, but arbitrary executable customization would introduce malware, tracking, phishing, decoder, copyright, and supply-chain risk.

Purchases must never distort dating outcomes or paywall safety.

## Decision

Create a separately governed **Skin Shop** domain:

- public catalog metadata;
- content-addressed public asset files;
- creator public identity and moderation state;
- platform-billing receipt validation;
- signed portable entitlements where platform rules permit;
- creator accounting isolated from dating and safety systems.

Allowed initial asset formats:

- bounded PNG/WebP/AVIF images;
- a restricted declarative vector format;
- bounded declarative animations;
- curated system-symbol composition.

Not allowed initially:

- JavaScript, HTML, WebViews, executable plugins;
- arbitrary shaders;
- embedded network requests;
- native code, scripts, macros, fonts, or archives;
- unbounded 3D models;
- hidden analytics or tracking identifiers.

## Identity honesty

- Profiles distinguish avatar-only, photo profile, and photo-verified status.
- An avatar cannot imply that it is a verified depiction of the user.
- Creator verification is separate from dating identity and must not expose safety cases or private profile information.

## Economic boundary

Purchases may change appearance only. They never affect:

- candidate ranking;
- discovery reach;
- proximity delivery;
- response priority;
- moderation or appeal decisions;
- bot challenges;
- block/report/delete access;
- adult eligibility;
- location precision.

## Marketplace operations

Required before commerce:

- creator terms and payout policy;
- copyright/DMCA-equivalent intake appropriate to launch markets;
- impersonation, hate, sexual-content, extremist, malware, and child-safety rules;
- asset scanning and bounded decode/re-encode pipeline;
- moderation queue and appeals;
- receipt validation, refunds, chargebacks, tax, sanctions, and payout holds;
- independent financial records;
- no creator/sponsor access to dating data or safety cases.

## Consequences

- A central catalog/CDN is acceptable because assets are intentionally public and non-sensitive.
- Marketplace operations add substantial moderation and financial obligations.
- Creator-generated content creates app-store UGC duties independent of private dating content.

## Validation gates

- parser/decoder fuzzing and decompression bounds;
- no executable/network-capable asset path;
- content hash and signature verification;
- StoreKit and Play Billing server validation;
- entitlement restore and refund tests;
- creator payout and fraud controls;
- copyright and impersonation workflows;
- asset moderation SLA and appeal process;
- proof that purchases cannot influence ranking or safety behavior.
