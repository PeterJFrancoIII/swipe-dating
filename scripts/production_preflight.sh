#!/usr/bin/env bash
# Production preflight — validation only; never deploys.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPROVALS_DIR="${ROOT}/approvals"
RELEASE_COMMIT_SHA="${RELEASE_COMMIT_SHA:-}"

if [[ -z "${RELEASE_COMMIT_SHA}" ]]; then
  if git -C "${ROOT}" rev-parse HEAD >/dev/null 2>&1; then
    RELEASE_COMMIT_SHA="$(git -C "${ROOT}" rev-parse HEAD)"
  else
    echo "ERROR: set RELEASE_COMMIT_SHA when git metadata is unavailable" >&2
    exit 1
  fi
fi

REQUIRED_ROLES=(
  legal
  privacy
  security
  trust-safety
  executive
  mobile
  infra
  child-safety
  ncii
  proximity
  location
  anti-abuse
  marketplace
)

echo "=== production-preflight (validation only) ==="
echo "release commit: ${RELEASE_COMMIT_SHA}"

if [[ ! "${RELEASE_COMMIT_SHA}" =~ ^[0-9a-fA-F]{40}$ ]]; then
  echo "ERROR: RELEASE_COMMIT_SHA must be a 40-character git SHA" >&2
  exit 1
fi

if [[ ! -d "${APPROVALS_DIR}" ]]; then
  echo "PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED"
  echo "ERROR: approvals directory missing: ${APPROVALS_DIR}"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "ERROR: python3 is required to validate approval JSON" >&2
  exit 1
fi

set +e
python3 - "${APPROVALS_DIR}" "${RELEASE_COMMIT_SHA}" "${REQUIRED_ROLES[@]}" <<'PY'
import datetime as dt
import glob
import json
import os
import re
import sys

approvals_dir = sys.argv[1]
release_commit = sys.argv[2].lower()
roles = sys.argv[3:]
now = dt.datetime.now(dt.timezone.utc)
hex64 = re.compile(r"^[0-9a-fA-F]{64}$")
hex40 = re.compile(r"^[0-9a-fA-F]{40}$")
placeholder_tokens = {
    "",
    "change_me",
    "changeme",
    "replace_me",
    "placeholder",
    "null",
    "none",
    "human_workflow_placeholder",
}


def norm(value):
    return str(value if value is not None else "").strip().lower()


def parse_utc(value, field, path, errors):
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{path}: missing {field}")
        return None
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = dt.datetime.fromisoformat(text)
    except ValueError:
        errors.append(f"{path}: invalid {field}: {value!r}")
        return None
    if parsed.tzinfo is None:
        errors.append(f"{path}: {field} must include a timezone")
        return None
    return parsed.astimezone(dt.timezone.utc)


def non_placeholder(value):
    return norm(value) not in placeholder_tokens and "change_me" not in norm(value)

all_errors = []
valid_roles = []

for role in roles:
    pattern = os.path.join(approvals_dir, f"{role}-*.approval.json")
    paths = sorted(glob.glob(pattern))
    if not paths:
        all_errors.append(f"MISSING approval: {role}-*.approval.json")
        continue

    role_valid = False
    role_errors = []
    for path in paths:
        errors = []
        try:
            with open(path, "r", encoding="utf-8") as handle:
                data = json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:
            role_errors.append(f"{path}: unreadable/invalid JSON: {exc}")
            continue

        if data.get("schema_version") != 1:
            errors.append(f"{path}: schema_version must be 1")
        if data.get("role") != role:
            errors.append(f"{path}: role must be {role!r}")
        if data.get("status") != "APPROVED":
            errors.append(f"{path}: status must be APPROVED")

        approved_by = data.get("approved_by")
        organization = data.get("approver_organization")
        evidence_uri = data.get("evidence_uri")
        if not non_placeholder(approved_by):
            errors.append(f"{path}: approved_by is missing/placeholder")
        if not non_placeholder(organization):
            errors.append(f"{path}: approver_organization is missing/placeholder")
        if not non_placeholder(evidence_uri):
            errors.append(f"{path}: evidence_uri is missing/placeholder")

        commit_sha = norm(data.get("commit_sha"))
        if not hex40.fullmatch(commit_sha):
            errors.append(f"{path}: commit_sha must be 40 hexadecimal characters")
        elif commit_sha != release_commit:
            errors.append(
                f"{path}: commit_sha {commit_sha} does not match release {release_commit}"
            )

        artifact_sha = str(data.get("artifact_sha256", "")).strip()
        if not hex64.fullmatch(artifact_sha):
            errors.append(f"{path}: artifact_sha256 must be 64 hexadecimal characters")

        approved_at = parse_utc(data.get("approved_at_utc"), "approved_at_utc", path, errors)
        expires_at = parse_utc(data.get("expires_at_utc"), "expires_at_utc", path, errors)
        if approved_at and approved_at > now + dt.timedelta(minutes=5):
            errors.append(f"{path}: approved_at_utc is in the future")
        if expires_at and expires_at <= now:
            errors.append(f"{path}: approval is expired")
        if approved_at and expires_at and expires_at <= approved_at:
            errors.append(f"{path}: expires_at_utc must be after approved_at_utc")

        signature = data.get("signature")
        if not isinstance(signature, dict):
            errors.append(f"{path}: signature object is required")
        else:
            if not non_placeholder(signature.get("type")):
                errors.append(f"{path}: signature.type is missing/placeholder")
            if not non_placeholder(signature.get("verification_reference")):
                errors.append(
                    f"{path}: signature.verification_reference is missing/placeholder"
                )

        if errors:
            role_errors.extend(errors)
        else:
            role_valid = True
            print(f"OK approval: {role} -> {os.path.basename(path)}")
            break

    if role_valid:
        valid_roles.append(role)
    else:
        all_errors.append(f"INVALID approval role: {role}")
        all_errors.extend(role_errors)

if all_errors:
    print("")
    print("PRODUCTION_BLOCKED_HUMAN_APPROVALS_REQUIRED")
    for error in all_errors:
        print(error)
    print("")
    print("See approvals/README.md and docs/governance/release-gates.md.")
    sys.exit(1)

print("")
print("MECHANICAL_APPROVAL_VALIDATION_PASSED")
print(f"Validated {len(valid_roles)} role(s) for commit {release_commit}.")
print("Protected humans must still verify authenticity, scope, signatures, conflicts, and artifacts.")
PY
status=$?
set -e

if [[ ${status} -ne 0 ]]; then
  exit ${status}
fi

echo "PRODUCTION_PREFLIGHT_MECHANICALLY_PASSED_HUMAN_RELEASE_CONTROL_STILL_REQUIRED"
exit 0
