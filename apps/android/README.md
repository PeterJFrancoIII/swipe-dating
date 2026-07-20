# Swipe Dating — Android (staging skeleton)

Minimal Kotlin + Jetpack Compose app module. **Not Play Store ready.**

## Layout

- `settings.gradle.kts` / `build.gradle.kts` — Gradle Kotlin DSL
- `app/` — `SwipeDatingApp`, `MainActivity` with STAGING text
- `gradle/wrapper/gradle-wrapper.properties` — wrapper config (**jar not committed**)

## UniFFI (pending)

Rust core bindings will land via UniFFI-generated Kotlin. No business logic in Activities.

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
