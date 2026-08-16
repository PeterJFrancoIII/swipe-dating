# Swipe — Apple-first Expo client

**Status:** Synthetic R&D. Not a store build.  
**Stack:** React Native + Expo (SDK 57). Same project for iOS and Android.  
**Scope:** ADR-0016. Golden master web app stays frozen.

## Run (local)

```bash
cd apps/swipe
npx expo start --port 8082
```

Then press `i` for the iOS Simulator (Apple first). Press `a` later for Android.

Do **not** run `eas submit`. App Store and Play stay blocked until release gates and authentic approvals exist.

## Dual binaries later

When gates pass, the same tree can produce both stores:

```bash
eas build --platform ios
eas build --platform android
```

That is not authorized today.
