# Android verification (staging skeleton)

## Structural checks

- [ ] `settings.gradle.kts` includes `:app`
- [ ] `MainActivity.kt` displays STAGING text
- [ ] `AndroidManifest.xml` uses `SwipeDatingApp`

## Build checks (optional)

```bash
cd apps/android
./gradlew :app:assembleDebug
```

**Known blockers:**

| Blocker | Impact |
|---------|--------|
| Java runtime missing | Gradle cannot run (`make doctor` reports MISSING) |
| `gradle-wrapper.jar` absent | `./gradlew` fails until wrapper generated |
| Android SDK not installed | assembleDebug fails |
| UniFFI not generated | No shared Rust core |

## CI

`.github/workflows/ci.yml` skips Android job when Java/SDK unavailable.
