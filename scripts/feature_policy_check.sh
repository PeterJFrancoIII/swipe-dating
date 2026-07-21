#!/usr/bin/env bash
# Source/governance invariants for the adult consent feature foundation.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail() {
  echo "FEATURE_POLICY_CHECK_FAILED: $*" >&2
  exit 1
}

require_file() {
  [[ -f "$1" ]] || fail "missing required file: $1"
}

require_contains() {
  local file="$1"
  local text="$2"
  local description="$3"
  grep -Fq -- "$text" "$file" || fail "$description ($file must contain: $text)"
}

require_absent() {
  local file="$1"
  local text="$2"
  local description="$3"
  if grep -Fq -- "$text" "$file"; then
    fail "$description ($file contains forbidden text: $text)"
  fi
}

FILES=(
  MISSION.md
  policies/community-rules.md
  docs/governance/release-gates.md
  docs/privacy/data-map.md
  docs/security/threat-model.md
  apps/ios/Sources/AppModel.swift
  apps/ios/Sources/AgeGateView.swift
  apps/ios/Sources/ProductFeatureModels.swift
  apps/ios/Sources/AdultFeatureViews.swift
  core/anti-abuse/src/lib.rs
)

for file in "${FILES[@]}"; do
  require_file "$file"
done

# Absolute 18+ boundary.
require_contains MISSION.md "No person under 18" "mission must retain the absolute adult floor"
require_contains apps/ios/Sources/AgeGateView.swift "DatePicker(" "iOS must use exact date rather than birth-year subtraction"
require_contains apps/android/app/src/main/java/dating/swipe/staging/MainActivity.kt "LocalDate.parse" "Android must use an exact date"
require_absent apps/ios/Sources/AppModel.swift "submitAgeGate(birthYear" "birth-year-only iOS gate is forbidden"
require_absent apps/android/app/src/main/java/dating/swipe/staging/MainActivity.kt "currentYear - year" "birth-year subtraction is forbidden"

if grep -R -nE --exclude-dir=.git --exclude='*.md' --exclude='*.json' \
  'age[[:space:]]*(>=|>|==)[[:space:]]*16|minimumAge[[:space:]]*=[[:space:]]*16|min_age[[:space:]]*=[[:space:]]*16' \
  apps core services >/tmp/swipe-policy-minor.txt 2>/dev/null; then
  cat /tmp/swipe-policy-minor.txt >&2
  fail "minor dating access signal detected"
fi

# Equal proximity privacy defaults.
require_contains apps/ios/Sources/ProductFeatureModels.swift \
  "var enabled = false" "proximity must default off"
require_contains apps/ios/Sources/ProductFeatureModels.swift \
  "var disclosurePolicy: ProximityDisclosurePolicy = .prompt" \
  "prompt-before-sharing must be the proximity default"
require_contains MISSION.md \
  "Gender never determines an automatic privacy setting" \
  "mission must prohibit gender-based disclosure defaults"
require_contains apps/ios/Sources/AdultFeatureViews.swift \
  "Gender never causes automatic profile disclosure" \
  "proximity settings must explain equal defaults"

# Live mutual consent and location consent.
require_contains apps/ios/Sources/AppModel.swift \
  "autoMatchOnLike: false" \
  "live discovery tickets must not auto-match from one-sided interest"
require_contains MISSION.md \
  "Matching never shares location automatically" \
  "mission must retain location opt-in"
require_contains apps/ios/Sources/AppModel.swift \
  "pendingLocationSharePrompt = top" \
  "matching may prompt but must not silently share location"
require_contains apps/ios/Sources/AppModel.swift \
  "matchLocationShares[profileId] = nil" \
  "block must clear location access"

# Sensitive ranking and commerce boundaries.
require_contains apps/ios/Sources/ProductFeatureModels.swift \
  "static func score(" \
  "local alignment scoring must remain explicit"
require_contains MISSION.md \
  "Marketplace purchases never improve dating reach" \
  "purchases must not affect dating outcomes"
require_contains docs/privacy/data-map.md \
  "Questionnaire answers" \
  "sensitive answers must be represented in the data map"
require_contains policies/community-rules.md \
  "No sexual services marketplace" \
  "sexual services transactions must remain prohibited"

# Bot/Sybil foundation and privacy boundary.
require_contains core/anti-abuse/src/lib.rs \
  "MissingAdultCredential" \
  "anti-abuse must gate adult credentials"
require_contains core/anti-abuse/src/lib.rs \
  "RequestReplay" \
  "anti-abuse must reject request replay"
require_contains core/anti-abuse/src/lib.rs \
  "RiskDecision::Contain" \
  "anti-abuse must expose explicit containment"
require_contains docs/architecture/adr-0013-bot-sybil-defense.md \
  "Forbidden risk inputs" \
  "bot governance must retain the sensitive-data exclusion"

# High-risk features remain staged/blocked.
require_contains docs/audits/2026-07-21-adult-features-readiness-review.md \
  "REAL_USER_CLOSED_BETA_BLOCKED" \
  "latest audit must block real-user beta"
require_contains docs/governance/release-gates.md \
  "Agents must not enable real BLE" \
  "release gates must block autonomous high-risk activation"
require_contains apps/ios/Sources/AdultFeatureViews.swift \
  "STAGING simulation" \
  "proximity UI must be labeled as simulation"
require_contains apps/ios/Sources/AdultFeatureViews.swift \
  "STAGING synthetic coordinate" \
  "map UI must disclose synthetic coordinates"
require_contains apps/ios/Sources/AppModel.swift \
  "No charge or creator payout occurred" \
  "Skin Shop must not claim real commerce"

# No placeholder owner may be mistaken for production readiness.
require_contains docs/governance/roles-and-owners.md \
  "PLACEHOLDERS" \
  "owner registry must remain explicitly incomplete until humans fill it"

rm -f /tmp/swipe-policy-minor.txt

echo "FEATURE_POLICY_CHECK_OK"
