# iOS verification (staging skeleton)

## Structural checks (no Xcode required)

- [ ] `Package.swift` exists
- [ ] `Sources/StagingRootView.swift` shows STAGING banner
- [ ] `Sources/AgeGateView.swift` documents fail-closed stub
- [ ] `Sources/DiscoveryView.swift` placeholder present

## Optional build (requires macOS + Swift toolchain)

```bash
cd apps/ios
swift build
```

**Known blockers:**

| Blocker | Impact |
|---------|--------|
| UniFFI not generated | No shared Rust core on device |
| No Tuist/Xcode project | App target not packaged for TestFlight |
| Age vendor not integrated | Age gate is UI-only stub |

## CI

`.github/workflows/ci.yml` includes a placeholder iOS job that skips when Xcode unavailable.
