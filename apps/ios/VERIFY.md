# iOS verification — LocalFirst Dating STAGING

## Project

- [x] `project.yml` + `xcodegen generate` → `SwipeDating.xcodeproj`
- [x] `@main` app target `App/SwipeDatingApp.swift`
- [x] STAGING banner on onboarding + main surfaces
- [x] Age gate fail-closed via `DatingCoreBridge` → UniFFI
- [x] Discover actions: Interested, Pass, Details, Block, Report (not swipe-only)
- [x] Matches + conversation + safety center + settings
- [x] Native UniFFI staticlib linked (`DATING_UNIFFI_LINKED`)
- [x] Local identity via `generateIdentity()` (public summary only)
- [x] Like / pass / block / staging-match via `AuditedMatchStore`
- [x] Ticket-derived Discover deck (self filtered; synthetic fallback offline)
- [x] Presence refresh loop (~45s) + Sync control

## Build

```bash
make ios-uniffi   # builds aarch64-apple-ios-sim staticlib + refreshes Generated/
make ios-build    # xcodegen + xcodebuild (arm64 simulator)
```

Or:

```bash
cd apps/ios
xcodegen generate
xcodebuild -project SwipeDating.xcodeproj -scheme SwipeDating \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -configuration Debug build CODE_SIGNING_ALLOWED=NO ARCHS=arm64 ONLY_ACTIVE_ARCH=YES
```

## Known blockers

| Blocker | Impact |
|---------|--------|
| Discovery deck still synthetic labels | No live peer presence yet |
| No phone→control-plane wiring | Use `make smoke-local` on Mac for services |
| Messaging is on-device staging only | No E2EE peer path / WebRTC yet |
| Store / production | Blocked by `docs/governance/release-gates.md` |
