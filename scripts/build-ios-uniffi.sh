#!/usr/bin/env bash
# Build dating-uniffi-bindings staticlib for iOS Simulator and stage link artifacts.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-${ROOT}/target}"
source "${HOME}/.cargo/env"

TARGET="${IOS_SIM_TARGET:-aarch64-apple-ios-sim}"
PROFILE_DIR="${PROFILE_DIR:-debug}"

echo "Ensuring Rust target ${TARGET}..."
rustup target add "${TARGET}" >/dev/null

echo "Refreshing host bindings (Swift/Kotlin)..."
# Host build + bindgen so Generated/ matches current #[uniffi::export] surface.
cargo build -p dating-uniffi-bindings
HOST_LIB="${CARGO_TARGET_DIR}/debug/libdating_uniffi_bindings.dylib"
if [[ ! -f "${HOST_LIB}" ]]; then
  HOST_LIB="${CARGO_TARGET_DIR}/debug/libdating_uniffi_bindings.so"
fi
IOS_OUT="${ROOT}/apps/ios/Generated"
mkdir -p "${IOS_OUT}"
cargo run -p dating-uniffi-bindings --bin uniffi-bindgen -- generate \
  --library "${HOST_LIB}" \
  --language swift \
  --out-dir "${IOS_OUT}"



echo "Building dating-uniffi-bindings for ${TARGET}..."
# Match Xcode iOS 17 deployment; avoid "built for newer iOS-simulator" link warnings.
export IPHONEOS_DEPLOYMENT_TARGET="${IPHONEOS_DEPLOYMENT_TARGET:-17.0}"
cargo build -p dating-uniffi-bindings --target "${TARGET}"

LIB_SRC="${CARGO_TARGET_DIR}/${TARGET}/${PROFILE_DIR}/libdating_uniffi_bindings.a"
if [[ ! -f "${LIB_SRC}" ]]; then
  echo "missing ${LIB_SRC}" >&2
  exit 1
fi

NATIVE_DIR="${ROOT}/apps/ios/Native"
mkdir -p "${NATIVE_DIR}/lib" "${NATIVE_DIR}/include"
cp "${LIB_SRC}" "${NATIVE_DIR}/lib/libdating_uniffi_bindings.a"
cp "${ROOT}/apps/ios/Generated/dating_uniffi_bindingsFFI.h" "${NATIVE_DIR}/include/"

# modulemap name expected by generated Swift: dating_uniffi_bindingsFFI
cat > "${ROOT}/apps/ios/Generated/dating_uniffi_bindingsFFI.modulemap" <<'EOF'
module dating_uniffi_bindingsFFI {
    header "dating_uniffi_bindingsFFI.h"
    export *
}
EOF
cp "${ROOT}/apps/ios/Generated/dating_uniffi_bindingsFFI.modulemap" "${NATIVE_DIR}/include/module.modulemap"

echo "Staged:"
echo "  ${NATIVE_DIR}/lib/libdating_uniffi_bindings.a"
echo "  ${ROOT}/apps/ios/Generated/*.swift + FFI module"
ls -la "${NATIVE_DIR}/lib/libdating_uniffi_bindings.a"
