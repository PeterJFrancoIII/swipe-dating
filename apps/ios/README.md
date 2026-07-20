# Swipe Dating — iOS (staging skeleton)

Structural Swift package placeholder for Phases 7–17. **Not App Store ready.**

## Layout

- `Package.swift` — SwiftPM library (no Xcode project required for structure review)
- `Sources/` — `StagingRootView`, `AgeGateView`, `DiscoveryView` placeholders
- `VERIFY.md` — local verification steps and known blockers

## Tuist (optional)

A Tuist project is **not** generated in this scaffold. If the team adopts Tuist later:

1. Add `Project.swift` at this directory root.
2. Point dependencies at `Package.swift` local path or generated XCFramework from UniFFI.

## UniFFI boundary (pending)

Shared Rust core (`core/`) will expose audited APIs via UniFFI. Until then:

- No cryptographic or matching logic in Swift views
- Age assurance remains fail-closed stub
- Do not claim production privacy/safety properties from this skeleton

## Build expectations

Xcode 15+ / Swift 5.9+. Structural review only — full Xcode build success is not required for this phase.

```bash
cd apps/ios
swift build  # may require macOS + Xcode toolchain
```

See `VERIFY.md` for pass/fail criteria.
