#!/usr/bin/env bash
# Refuse staging infra operations until human verifies account identity.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IDENTITY="${ROOT}/infra/terraform/environments/staging/ACCOUNT_IDENTITY.md"

if [[ ! -f "${IDENTITY}" ]]; then
  echo "STAGING_BLOCKED: missing ${IDENTITY}"
  exit 1
fi

if grep -qE '^status:\s*UNVERIFIED' "${IDENTITY}" || grep -q 'status: UNVERIFIED' "${IDENTITY}"; then
  echo "STAGING_BLOCKED: staging account identity is UNVERIFIED."
  echo "A human operator must update ${IDENTITY} before deploy-staging or infra-plan-staging."
  exit 1
fi

if ! grep -qE '^status:\s*VERIFIED' "${IDENTITY}" && ! grep -q 'status: VERIFIED' "${IDENTITY}"; then
  echo "STAGING_BLOCKED: could not find status: VERIFIED in ${IDENTITY}"
  exit 1
fi

echo "OK: staging account identity marked VERIFIED (human attestation on file)."
