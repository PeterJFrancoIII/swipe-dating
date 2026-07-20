# Mission

## User objective

Build a local-first, privacy-preserving, adults-only swipe dating platform. **Current focus: the iPhone (iOS) client first** — a runnable staging app on Simulator/device that exercises onboarding, discovery, match, chat, and safety flows.

## Current objective

Ship a working **LocalFirst Dating STAGING** iPhone app (`apps/ios/SwipeDating.xcodeproj`) with Phase 9 flows, accessibility actions (not swipe-only), fail-closed age gate, and visible STAGING banner. Android and cloud staging are secondary until the iPhone client is solid.

## Success criteria

- [ ] iPhone app builds and launches on Simulator
- [ ] Age gate fail-closed; adults-only path into discovery
- [ ] Swipe deck with Interested / Pass / Details / Block / Report buttons
- [ ] Match → conversation; block/report/safety center
- [ ] STAGING banner always visible; no production claims

## Non-goals (this slice)

- App Store submission
- Production deploy
- Full UniFFI native link (STAGING bridge OK until XCFramework wired)
- Android feature parity (deferred)

## Constraints

- Stack: SwiftUI, iOS 17+, Xcode
- Privacy: no exact location; relay-first default; no operator plaintext custody claims beyond staging honesty
- Safety: block/report free; limitations disclosed

## Source of truth

- Spec: docs/specs/current-objective.md
- Deploy command: .cursor/commands/deploy-decentralized-dating-app.md (Phase 9)
- iOS: apps/ios/

## Red-zone areas

Auth/age/crypto/production require human approval for real vendors and release.
