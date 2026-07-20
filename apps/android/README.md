# Swipe Dating — Android (staging skeleton)

Minimal Kotlin + Jetpack Compose app module. **Not Play Store ready.**

## Layout

- `settings.gradle.kts` / `build.gradle.kts` — Gradle Kotlin DSL
- `app/` — `SwipeDatingApp`, `MainActivity` with STAGING text
- `gradle/wrapper/gradle-wrapper.properties` — wrapper config (**jar not committed**)

## UniFFI

Rust core bindings are generated from `core/uniffi-bindings` via UniFFI. No business logic in Activities.

```bash
source "$HOME/.cargo/env"
./scripts/generate-uniffi.sh
```

Kotlin sources are written to `app/src/main/java/dating/swipe/core/`. Package the native `libdating_uniffi_bindings` for each Android ABI before shipping.

## Build

Requires **Java 17+** and Android SDK (not verified on all dev hosts).

```bash
cd apps/android
./gradlew :app:assembleDebug   # requires gradle-wrapper.jar
```

If `gradle-wrapper.jar` is missing, generate with a local Gradle install:

```bash
gradle wrapper --gradle-version 8.7
```

See `VERIFY.md` for blockers.
