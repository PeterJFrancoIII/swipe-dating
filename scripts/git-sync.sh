#!/usr/bin/env bash
# Bidirectional sync: local working tree ↔ GitHub (origin).
#
# Default flow (safe):
#   1) fetch
#   2) if dirty: stash (including untracked, excluding ignored)
#   3) pull --rebase --autostash onto upstream
#   4) push
#   5) restore stash if we created one
#
# Usage:
#   ./scripts/git-sync.sh           # sync current branch both ways
#   ./scripts/git-sync.sh pull      # fetch + rebase only
#   ./scripts/git-sync.sh push      # push only (fails if behind)
#   ./scripts/git-sync.sh status    # show divergence
#
# Env:
#   GIT_SYNC_REMOTE=origin
#   GIT_SYNC_NO_STASH=1   # refuse to run when working tree is dirty
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

REMOTE="${GIT_SYNC_REMOTE:-origin}"
MODE="${1:-sync}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: not a git repository: ${ROOT}" >&2
  exit 1
fi

if ! git remote get-url "${REMOTE}" >/dev/null 2>&1; then
  echo "ERROR: remote '${REMOTE}' is not configured." >&2
  echo "Expected: git remote add origin git@github.com:PeterJFrancoIII/swipe-dating.git" >&2
  exit 1
fi

BRANCH="$(git branch --show-current)"
if [[ -z "${BRANCH}" ]]; then
  echo "ERROR: detached HEAD — checkout a branch before syncing." >&2
  exit 1
fi

upstream_ref() {
  git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true
}

ensure_upstream() {
  local up
  up="$(upstream_ref)"
  if [[ -n "${up}" ]]; then
    return 0
  fi
  # Prefer same-named remote branch; else main.
  if git show-ref --verify --quiet "refs/remotes/${REMOTE}/${BRANCH}"; then
    git branch --set-upstream-to="${REMOTE}/${BRANCH}" "${BRANCH}"
  elif git show-ref --verify --quiet "refs/remotes/${REMOTE}/main"; then
    echo "NOTE: no remote branch '${BRANCH}'; tracking ${REMOTE}/main for pull; push will create ${REMOTE}/${BRANCH}."
    git branch --set-upstream-to="${REMOTE}/main" "${BRANCH}" || true
  else
    echo "NOTE: no upstream yet; first push will create ${REMOTE}/${BRANCH}."
  fi
}

tree_dirty() {
  ! git diff --quiet || ! git diff --cached --quiet || [[ -n "$(git ls-files --others --exclude-standard)" ]]
}

print_status() {
  echo "=== git sync status ==="
  echo "repo:    ${ROOT}"
  echo "remote:  ${REMOTE} ($(git remote get-url "${REMOTE}"))"
  echo "branch:  ${BRANCH}"
  local up
  up="$(upstream_ref)"
  echo "upstream:${up:-"(none)"}"
  git fetch --quiet "${REMOTE}" || true
  if [[ -n "${up}" ]]; then
    local left right
    left="$(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)"
    right="$(git rev-list --count 'HEAD..@{u}' 2>/dev/null || echo 0)"
    echo "ahead:   ${left} commit(s)"
    echo "behind:  ${right} commit(s)"
  fi
  git status -sb
}

cmd_pull() {
  git fetch "${REMOTE}"
  ensure_upstream
  local up
  up="$(upstream_ref)"
  if [[ -z "${up}" ]]; then
    echo "Nothing to pull (no upstream)."
    return 0
  fi
  if tree_dirty; then
    if [[ "${GIT_SYNC_NO_STASH:-}" == "1" ]]; then
      echo "ERROR: working tree dirty and GIT_SYNC_NO_STASH=1" >&2
      git status -sb
      exit 1
    fi
    echo "Stashing local changes (including untracked)…"
    git stash push -u -m "git-sync auto $(date -u +%Y-%m-%dT%H:%MZ)"
    STASHED=1
  fi
  echo "Pulling with rebase from ${up}…"
  git pull --rebase --autostash
}

cmd_push() {
  git fetch "${REMOTE}"
  ensure_upstream
  local up
  up="$(upstream_ref)"
  if [[ -n "${up}" ]]; then
    local behind
    behind="$(git rev-list --count 'HEAD..@{u}' 2>/dev/null || echo 0)"
    if [[ "${behind}" != "0" ]]; then
      echo "ERROR: local is behind ${up} by ${behind} commit(s). Run: ./scripts/git-sync.sh pull (or sync)" >&2
      exit 1
    fi
  fi
  echo "Pushing ${BRANCH} → ${REMOTE}…"
  git push -u "${REMOTE}" "HEAD:refs/heads/${BRANCH}"
  # Keep main aligned when syncing the primary feature branch (optional convenience).
  if [[ "${BRANCH}" == "feat/local-first-dating-platform" ]] && git show-ref --verify --quiet "refs/remotes/${REMOTE}/main"; then
    if [[ "${GIT_SYNC_UPDATE_MAIN:-1}" == "1" ]]; then
      echo "Also updating ${REMOTE}/main to match (GIT_SYNC_UPDATE_MAIN=1)…"
      git push "${REMOTE}" "HEAD:refs/heads/main"
    fi
  fi
}

STASHED=0
case "${MODE}" in
  status)
    print_status
    ;;
  pull)
    cmd_pull
    if [[ "${STASHED}" == "1" ]]; then
      echo "Restoring stash…"
      git stash pop || echo "WARNING: stash pop had conflicts — resolve manually (git stash list)."
    fi
    print_status
    ;;
  push)
    cmd_push
    print_status
    ;;
  sync)
    cmd_pull
    cmd_push
    if [[ "${STASHED}" == "1" ]]; then
      echo "Restoring stash…"
      git stash pop || echo "WARNING: stash pop had conflicts — resolve manually (git stash list)."
    fi
    print_status
    echo "SYNC_OK local ↔ ${REMOTE}"
    ;;
  *)
    echo "Usage: $0 [sync|pull|push|status]" >&2
    exit 2
    ;;
esac
