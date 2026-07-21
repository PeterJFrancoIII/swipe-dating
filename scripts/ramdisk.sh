#!/usr/bin/env bash
# macOS RAM disk for high-speed agent coding/debugging.
#
# This is NOT Linux tmpfs. On macOS we create an in-memory APFS volume via hdiutil.
#
# IMPORTANT (this machine):
#   - M3 Max with 36 GB unified memory (soldered; cannot add DIMMs to reach 64 GB)
#   - Large RAM disks that push the system into swap will SLOW agents down
#   - Default size is conservative; override with RAMDISK_GB=
#
# Usage:
#   ./scripts/ramdisk.sh status
#   ./scripts/ramdisk.sh create          # create empty RAM volume
#   ./scripts/ramdisk.sh up              # create + mirror project into RAM
#   ./scripts/ramdisk.sh sync-back       # copy RAM worktree → persistent project
#   ./scripts/ramdisk.sh down            # sync-back (default) then destroy volume
#   ./scripts/ramdisk.sh destroy         # destroy without sync (DANGEROUS)
#
# Env:
#   RAMDISK_GB=4                 # volume size in GiB (default 4 on ≤36GB hosts)
#   RAMDISK_NAME=SwipeDatingRAM
#   RAMDISK_PERSIST="/Users/computer/App Development/Swipe Dating"
#   RAMDISK_SKIP_SYNC_BACK=1     # on `down`, destroy without syncing
set -euo pipefail

NAME="${RAMDISK_NAME:-SwipeDatingRAM}"
MOUNT="/Volumes/${NAME}"
PERSIST="${RAMDISK_PERSIST:-/Users/computer/App Development/Swipe Dating}"
WORK="${MOUNT}/Swipe Dating"
STATE_DIR="${HOME}/.cache/swipe-dating-local/ramdisk"
DEVICE_FILE="${STATE_DIR}/device"
MARKER_FILE="${STATE_DIR}/active"

mkdir -p "${STATE_DIR}"

total_ram_gb() {
  local bytes
  bytes="$(sysctl -n hw.memsize)"
  echo $((bytes / 1024 / 1024 / 1024))
}

default_gb() {
  local total
  total="$(total_ram_gb)"
  if (( total <= 24 )); then
    echo 2
  elif (( total <= 40 )); then
    echo 4
  elif (( total <= 64 )); then
    echo 8
  else
    echo 16
  fi
}

GB="${RAMDISK_GB:-$(default_gb)}"

sectors_for_gb() {
  # hdiutil ram:// uses 512-byte sectors
  echo $((GB * 1024 * 1024 * 1024 / 512))
}

mem_pressure_warn() {
  local total free_pages page_size free_gb
  total="$(total_ram_gb)"
  page_size="$(pagesize)"
  free_pages="$(vm_stat | awk '/Pages free/ {gsub("\\.","",$3); print $3}')"
  free_gb="$(awk -v p="${free_pages:-0}" -v s="${page_size}" 'BEGIN{printf "%.1f", (p*s)/1024/1024/1024}')"
  echo "host_ram_gb=${total} proposed_ramdisk_gb=${GB} approx_pages_free_gb=${free_gb}"
  if (( GB * 2 > total )); then
    echo "ERROR: RAMDISK_GB=${GB} is too large for ${total} GB host (would thrash swap)." >&2
    exit 1
  fi
  if (( GB >= total / 3 )); then
    echo "WARNING: RAM disk uses ≥1/3 of RAM. Expect compressor/swap pressure on M3 Max 36GB." >&2
  fi
}

is_mounted() {
  [[ -d "${MOUNT}" ]] && mount | grep -q " on ${MOUNT} "
}

cmd_status() {
  echo "=== ramdisk status ==="
  echo "persist: ${PERSIST}"
  echo "mount:   ${MOUNT}"
  echo "work:    ${WORK}"
  mem_pressure_warn
  if is_mounted; then
    echo "state:   MOUNTED"
    df -h "${MOUNT}" | tail -1
    if [[ -d "${WORK}/.git" ]]; then
      echo -n "work_git: "; git -C "${WORK}" rev-parse --short HEAD 2>/dev/null || echo "?"
    fi
  else
    echo "state:   not mounted"
  fi
  if [[ -f "${DEVICE_FILE}" ]]; then
    echo "device:  $(cat "${DEVICE_FILE}")"
  fi
}

cmd_create() {
  if is_mounted; then
    echo "Already mounted at ${MOUNT}"
    return 0
  fi
  mem_pressure_warn
  local sectors disk
  sectors="$(sectors_for_gb)"
  echo "Creating ${GB} GiB RAM disk (${sectors} sectors)…"
  disk="$(hdiutil attach -nomount "ram://${sectors}" | tr -d '[:space:]')"
  if [[ -z "${disk}" ]]; then
    echo "ERROR: hdiutil failed to attach ram://" >&2
    exit 1
  fi
  echo "${disk}" >"${DEVICE_FILE}"
  diskutil erasevolume APFS "${NAME}" "${disk}" >/dev/null
  touch "${MARKER_FILE}"
  echo "Mounted ${MOUNT} (device ${disk})"
  df -h "${MOUNT}" | tail -1
}

rsync_to_ram() {
  mkdir -p "${WORK}"
  # Mirror source + git. Keep caches out unless RAMDISK_INCLUDE_TARGET=1.
  local excludes=(
    --exclude '.DS_Store'
    --exclude '.tmp.drivedownload/'
    --exclude '.tmp.driveupload/'
    --exclude 'apps/ios/Native/lib/*.a'
  )
  if [[ "${RAMDISK_INCLUDE_TARGET:-0}" != "1" ]]; then
    excludes+=(--exclude 'target/' --exclude 'apps/ios/.build/' --exclude 'apps/android/**/build/')
  fi
  rsync -a --delete \
    "${excludes[@]}" \
    "${PERSIST}/" "${WORK}/"
  # Point cargo target at a RAM-local dir for max compile speed when included,
  # otherwise keep using persistent cache via symlink if present.
  if [[ "${RAMDISK_INCLUDE_TARGET:-0}" == "1" ]]; then
    mkdir -p "${MOUNT}/cargo-target"
    rm -rf "${WORK}/target"
    ln -sfn "${MOUNT}/cargo-target" "${WORK}/target"
  elif [[ -L "${PERSIST}/target" || -d "${PERSIST}/target" ]]; then
    # Preserve existing target strategy from persist tree (rsync may have copied symlink)
    :
  fi
}

cmd_up() {
  cmd_create
  echo "Mirroring project → ${WORK} …"
  rsync_to_ram
  echo "READY"
  echo "Open Cursor on: ${WORK}"
  echo "Then: cd \"${WORK}\" && make sync-status"
  echo "When done: make ramdisk-down   # syncs back then destroys"
}

cmd_sync_back() {
  if ! is_mounted || [[ ! -d "${WORK}" ]]; then
    echo "ERROR: RAM worktree not present; nothing to sync back." >&2
    exit 1
  fi
  echo "Syncing ${WORK} → ${PERSIST} …"
  rsync -a \
    --exclude '.DS_Store' \
    --exclude 'target/' \
    --exclude 'apps/ios/.build/' \
    --exclude 'apps/android/**/build/' \
    --exclude 'apps/ios/Native/lib/*.a' \
    "${WORK}/" "${PERSIST}/"
  echo "sync-back OK → ${PERSIST}"
  echo "Persist git status:"
  git -C "${PERSIST}" status -sb || true
}

cmd_destroy() {
  if ! is_mounted; then
    echo "Not mounted."
    rm -f "${DEVICE_FILE}" "${MARKER_FILE}"
    return 0
  fi
  echo "Unmounting/destroying ${MOUNT}…"
  diskutil eject "${MOUNT}" >/dev/null || true
  if [[ -f "${DEVICE_FILE}" ]]; then
    local disk
    disk="$(cat "${DEVICE_FILE}")"
    hdiutil detach "${disk}" -force >/dev/null 2>&1 || true
  fi
  # Fallback: detach by volume name
  diskutil unmount force "${MOUNT}" >/dev/null 2>&1 || true
  rm -f "${DEVICE_FILE}" "${MARKER_FILE}"
  echo "Destroyed. Volatile RAM contents are gone."
}

cmd_down() {
  if [[ "${RAMDISK_SKIP_SYNC_BACK:-0}" == "1" ]]; then
    echo "WARNING: skipping sync-back (RAMDISK_SKIP_SYNC_BACK=1)"
  else
    cmd_sync_back
  fi
  cmd_destroy
}

usage() {
  echo "Usage: $0 {status|create|up|sync-back|down|destroy}" >&2
  exit 2
}

cmd="${1:-status}"
case "${cmd}" in
  status) cmd_status ;;
  create) cmd_create ;;
  up) cmd_up ;;
  sync-back) cmd_sync_back ;;
  down) cmd_down ;;
  destroy) cmd_destroy ;;
  *) usage ;;
esac
