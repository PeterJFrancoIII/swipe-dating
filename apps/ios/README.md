# Swipe Dating — iPhone (STAGING)

Runnable SwiftUI iPhone app for the local-first dating staging client.

## Open in Xcode

```bash
cd apps/ios
xcodegen generate   # regenerates SwipeDating.xcodeproj from project.yml
open SwipeDating.xcodeproj
```

Select an **iPhone simulator** whose runtime matches your installed iOS platform (Xcode → Settings → Components), then Run (⌘R).

## Build from CLI

```bash
cd apps/ios
xcodegen generate
xcodebuild -project SwipeDating.xcodeproj -scheme SwipeDating \
  -destination 'platform=iOS Simulator,name=iPhone 17' \
  -configuration Debug build
```

If xcodebuild says `iOS 26.5 is not installed`, install the simulator platform:

```bash
xcodebuild -downloadPlatform iOS
```

## Flows included

1. Welcome + staging disclosure  
2. Age gate (18+, fail-closed mock)  
3. Local identity + recovery acknowledgment  
4. Permission education (coarse region only)  
5. Profile setup  
6. Discover deck with **Interested / Pass / Details / Block / Report** (not swipe-only)  
7. Matches + conversation  
8. Safety center + emergency privacy mode  
9. Settings (relay-only, mailbox opt-in off by default, delete local account)  
10. Internal diagnostics (redacted)

## UniFFI

Shared Rust core is linked into the iPhone staging app:

```bash
make ios-uniffi   # aarch64-apple-ios-sim staticlib + Generated Swift
make ios-build    # DATING_UNIFFI_LINKED app build
```

Settings → Diagnostics shows **Core path: UniFFI linked** when the native library is present. SPM-only builds without `Native/lib` keep the STAGING mock.

Local control-plane probe (Simulator → Mac localhost): Settings → Diagnostics → Probe `/healthz` after `make smoke-local`.
