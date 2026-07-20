# Google Drive bi-directional sync

## Source of truth

**Google Drive (cloud) is the current / authoritative version** of this project.

Local Cursor/Finder edits go through the Drive for Desktop mount and sync both ways. If a conflict copy appears, prefer the Drive/cloud revision unless you intentionally keep a local conflict file.

## Setup (2026-07-20)

Canonical path on this Mac (Drive-backed):

`My Drive/App Development/Swipe Dating`

Convenience symlink (same files):

`/Users/computer/App Development/Swipe Dating` → that Drive folder

Drive for Desktop syncs **bi-directionally** (this Mac ↔ Google Drive cloud).

## Local-only (not for cloud)

Symlinked to `~/.cache/swipe-dating-local/`:

- `target/`
- `.toolchains/`
- `apps/android/app/build/`
- `apps/ios/.build/`

## Related Drive pointer

`My Drive/Dating.gprj` references Drive id `10fykI-lY--GrFiWUf8NiPleaj_FVcJxg`. If GPT edited a *different* Drive folder than `App Development/Swipe Dating`, point Cursor at that folder so we can align paths.

## Notes

- Wait for Drive upload/download icons to settle after large changes.
- Avoid editing the same file offline on two machines without syncing first.
- Keep secrets out of the synced tree (use local `.env`, already gitignored).
