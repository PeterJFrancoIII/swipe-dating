#!/usr/bin/env bash
# Generate Swift and Kotlin bindings from the audited UniFFI crate.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-${ROOT}/target}"

source "${HOME}/.cargo/env"

PROFILE="${PROFILE:-dev}"
LIB_NAME="libdating_uniffi_bindings"
case "$(uname -s)" in
  Darwin) LIB_EXT="dylib" ;;
  Linux) LIB_EXT="so" ;;
  MINGW*|MSYS*|CYGWIN*) LIB_EXT="dll" ;;
  *) echo "unsupported platform for binding generation" >&2; exit 1 ;;
esac

# Cargo profile `dev` maps to target/debug/.
TARGET_DIR="debug"
if [[ "${PROFILE}" != "dev" ]]; then
  TARGET_DIR="${PROFILE}"
fi
LIB_PATH="target/${TARGET_DIR}/${LIB_NAME}.${LIB_EXT}"

echo "Building dating-uniffi-bindings (${PROFILE})..."
cargo build -p dating-uniffi-bindings

if [[ ! -f "${LIB_PATH}" ]]; then
  echo "expected library at ${LIB_PATH}" >&2
  exit 1
fi

IOS_OUT="${ROOT}/apps/ios/Generated"
ANDROID_OUT="${ROOT}/apps/android/app/src/main/java/dating/swipe/core"

mkdir -p "${IOS_OUT}" "${ANDROID_OUT}"

echo "Generating Swift bindings -> ${IOS_OUT}"
cargo run -p dating-uniffi-bindings --bin uniffi-bindgen -- generate \
  --library "${LIB_PATH}" \
  --language swift \
  --out-dir "${IOS_OUT}"

echo "Generating Kotlin bindings -> ${ANDROID_OUT}"
cargo run -p dating-uniffi-bindings --bin uniffi-bindgen -- generate \
  --library "${LIB_PATH}" \
  --language kotlin \
  --out-dir "${ANDROID_OUT}"

cat <<EOF

Done. Next steps:
  iOS:     add ${IOS_OUT} sources to apps/ios/Package.swift
  Android: wire ${ANDROID_OUT} into app/build.gradle.kts + jniLibs for ${LIB_NAME}.${LIB_EXT}

Re-run after any #[uniffi::export] API change.
EOF
