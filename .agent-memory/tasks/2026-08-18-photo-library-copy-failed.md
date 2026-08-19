# Photo library copy failed on additional profile photos

- **ID:** 2026-08-18-photo-library-copy-failed
- **Status:** ready_for_review
- **Architect:** Codex / GPT Main (owner report)
- **Implementer:** Cursor IDE Agent
- **Owner:** 2026-08-18 19:33 ET — adding additional profile photos shows `Could not copy that photo from the library.`

## Root cause

PHPicker returns a readable file URI and an `assetId`. Staging required a PHAsset copy and never used that file. PHAsset fetch often fails for later picks (limited Photos access, or no `stagePickedPhoto` in the binary).

## Fix

If that picker URI is unique in the batch, copy the PHPicker file when PHAsset staging fails or is missing. Shared ImagePicker cache URIs still fail closed.

## Validation

```text
cd apps/swipe && npx tsc --noEmit && npm test
# tests 72, pass 72
```

JS-only. Metro reload is enough for unique additional picks. Do not self-accept.
