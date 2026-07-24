# Google Drive sync notes

## Engineering authority (updated 2026-07-21)

**GitHub is the engineering source of truth** for this project:

https://github.com/PeterJFrancoIII/swipe-dating

Use `make sync` / `docs/operations/github-sync.md` for bidirectional local ↔ GitHub sync.

Google Drive may still hold a **mirror or convenience copy**. It is **not** authoritative for code once the GitHub repo exists. If Drive and local diverge, prefer Git (commit + `make sync`) over Drive conflict copies.

## Drive path (optional mirror)

Drive for Desktop path (if present):

`~/Library/CloudStorage/GoogleDrive-…/My Drive/App Development/Swipe Dating`

Local Cursor workspace:

`/Users/computer/App Development/Swipe Dating`

These are currently **separate directories** (different inodes) unless you intentionally re-symlink.

## Local-only caches (do not sync to Drive or git)

Prefer parking build artifacts under `~/.cache/swipe-dating-local/`:

- `target/`
- `.toolchains/`
- `apps/android/app/build/`
- `apps/ios/.build/`
- `apps/ios/Native/lib/*.a` (gitignored; rebuild with `make ios-uniffi`)

## Related Drive pointer

`My Drive/Dating.gprj` may reference Drive id `10fykI-lY--GrFiWUf8NiPleaj_FVcJxg`. That folder is not automatically merged with this GitHub repo.

## Notes

- Avoid editing the same file in Drive and local Git without syncing via GitHub.
- Drive “conflict copies” of `.git/refs` break git — delete refs named like `branch (1)`.
- Keep secrets out of both Drive and git (`.env` is gitignored).
