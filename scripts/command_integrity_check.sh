#!/usr/bin/env bash
# Verify deploy command SHA-256 matches recorded digest.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMMAND="${ROOT}/.cursor/commands/deploy-decentralized-dating-app.md"
RECORDED="${ROOT}/docs/execution/deploy-command.sha256"

if [[ ! -f "${COMMAND}" ]]; then
  echo "ERROR: deploy command missing: ${COMMAND}"
  exit 1
fi

if [[ ! -f "${RECORDED}" ]]; then
  echo "ERROR: digest file missing: ${RECORDED}"
  exit 1
fi

expected="$(awk '{print $1}' "${RECORDED}")"
actual="$(shasum -a 256 "${COMMAND}" | awk '{print $1}')"

if [[ "${expected}" != "${actual}" ]]; then
  echo "INTEGRITY_FAIL: deploy command digest mismatch"
  echo "  expected: ${expected}"
  echo "  actual:   ${actual}"
  exit 1
fi

echo "OK: deploy command integrity verified (${actual})"
