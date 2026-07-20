#!/usr/bin/env bash
# Production preflight — validation only; never deploys.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPROVALS_DIR="${ROOT}/approvals"
REQUIRED_ROLES=(
  legal
  privacy
  security
  trust-safety
  executive
  mobile
  infra
)

echo "=== production-preflight (validation only) ==="

missing=0
found=0

if [[ ! -d "${APPROVALS_DIR}" ]]; then
  echo "ERROR: approvals directory missing: ${APPROVALS_DIR}"
  exit 1
fi

# Ignore README and hidden files; require at least one signed artifact per role prefix.
shopt -s nullglob
for role in "${REQUIRED_ROLES[@]}"; do
  matches=("${APPROVALS_DIR}/${role}"*)
  if [[ ${#matches[@]} -eq 0 ]]; then
    echo "MISSING approval: ${role}*"
    missing=$((missing + 1))
  else
    echo "OK approval: ${matches[0]##*/}"
    found=$((found + 1))
  fi
done

if [[ ${found} -eq 0 ]]; then
  echo ""
  echo "PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED"
  echo "No signed approval artifacts in ${APPROVALS_DIR}/."
  echo "See approvals/README.md for required roles and freshness."
  exit 1
fi

if [[ ${missing} -gt 0 ]]; then
  echo ""
  echo "PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED"
  echo "${missing} approval role(s) still missing."
  exit 1
fi

echo "All required approval prefixes present — human must still verify authenticity."
exit 0
