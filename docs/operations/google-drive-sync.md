# Google Drive bi-directional sync

## Setup (2026-07-20)

The **Swipe Dating** repo lives inside Google Drive for Desktop:

`My Drive/App Development/Swipe Dating`

The old path is a symlink:

`/Users/computer/App Development/Swipe Dating` → Drive location above

Drive for Desktop syncs that folder **bi-directionally** with Google Drive (local ↔ cloud).

## Local-only (not meant for cloud)

These are symlinked to `~/.cache/swipe-dating-local/` so build caches stay off Drive:

- `target/`
- `.toolchains/`
- `apps/android/app/build/`
- `apps/ios/.build/`

## Notes

- Edits in Finder/Drive web/Cursor all share the same files once Drive finishes syncing.
- Conflict copies can appear if the same file is edited offline on two machines.
- Do not put secrets in the synced tree; prefer local env files (already gitignored).
