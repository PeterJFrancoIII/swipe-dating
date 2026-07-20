# iOS verification — LocalFirst Dating STAGING

## Project

- [x] `project.yml` + `xcodegen generate` → `SwipeDating.xcodeproj`
- [x] `@main` app target `App/SwipeDatingApp.swift`
- [x] STAGING banner on onboarding + main surfaces
- [x] Age gate fail-closed via `DatingCoreBridge`
- [x] Discover actions: Interested, Pass, Details, Block, Report (not swipe-only)
- [x] Matches + conversation + safety center + settings

## Build

```bash
cd apps/ios
xcodegen generate
# Compile check (no device needed):
xcodebuild -project SwipeDating.xcodeproj -scheme SwipeDating \
  -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' \
  -configuration Debug build CODE_SIGNING_ALLOWED=NO
# Run on Simulator (requires matching iOS platform runtime):
open SwipeDating.xcodeproj
```

## Known blockers

| Blocker | Impact |
|---------|--------|
| iOS 26.5 Simulator runtime may need download | `xcodebuild -downloadPlatform iOS` (~8.5GB) |
| UniFFI native lib not linked | STAGING mock bridge |
| No live control-plane from phone yet | Synthetic discovery deck |
