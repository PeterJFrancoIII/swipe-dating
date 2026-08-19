# GitHub bidirectional sync

**Engineering source of truth:** GitHub repo (public)  
https://github.com/PeterJFrancoIII/swipe-dating

Local path:

`/Users/computer/App Development/Swipe Dating`

Remote:

`origin` → `git@github.com:PeterJFrancoIII/swipe-dating.git`

## Commands

```bash
make sync-status   # ahead/behind + dirty files
make sync-pull     # fetch + rebase from GitHub
make sync-push     # push current branch (updates main when on feat/local-first-dating-platform)
make sync          # pull then push (bidirectional)
```

Equivalent:

```bash
./scripts/git-sync.sh status
./scripts/git-sync.sh pull
./scripts/git-sync.sh push
./scripts/git-sync.sh sync
```

## How it works

1. **Pull:** `git fetch` + `git pull --rebase` from the tracked upstream.
2. **Dirty tree:** auto-stashes (including untracked, not ignored) before pull; restores after.
3. **Push:** refuses if you are still behind; otherwise pushes the current branch.
4. **Main mirror:** when on `feat/local-first-dating-platform`, push also updates `origin/main` unless `GIT_SYNC_UPDATE_MAIN=0`.

## Rules of thumb

- Commit (or stash) intentional work before sharing with GPT/collaborators.
- Run `make sync` after local agent sessions and before starting work on another machine.
- Do **not** force-push to `main` from this script.
- Secrets stay out of git (`.env` is ignored).

## Google Drive

Drive and local folders may still diverge as **separate directories**. Prefer GitHub for engineering sync. See `docs/operations/google-drive-sync.md` for Drive-specific notes (Drive is no longer the engineering authority).

## Sharing with GPT

Point GPT at the GitHub URL (or paste diffs from `git log` / PR). After local changes: `make sync` so `main` is current.
