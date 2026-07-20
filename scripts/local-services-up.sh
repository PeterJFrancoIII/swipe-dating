#!/usr/bin/env bash
# Start control-plane services on localhost and leave them running (for Simulator probes).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
# shellcheck source=/dev/null
source "$HOME/.cargo/env"
export CARGO_TARGET_DIR="${CARGO_TARGET_DIR:-${ROOT}/target}"

PID_DIR="${ROOT}/.local/service-pids"
mkdir -p "${PID_DIR}"

start_one() {
  local pkg="$1"
  local bin="$2"
  local port="$3"
  local pidfile="${PID_DIR}/${bin}.pid"
  if curl -sf "http://127.0.0.1:${port}/healthz" >/dev/null 2>&1; then
    echo "ok  ${bin} already healthy on ${port}"
    return 0
  fi
  if [[ -f "${pidfile}" ]] && kill -0 "$(cat "${pidfile}")" 2>/dev/null; then
    echo "waiting for ${bin} pid=$(cat "${pidfile}")..."
  else
    PORT="${port}" cargo run -q -p "${pkg}" --bin "${bin}" \
      >"${PID_DIR}/${bin}.log" 2>&1 &
    echo $! >"${pidfile}"
    echo "started ${bin} pid=$(cat "${pidfile}") port=${port}"
  fi
  local attempt
  for attempt in $(seq 1 60); do
    if curl -sf "http://127.0.0.1:${port}/healthz" >/dev/null 2>&1; then
      echo "ok  ${bin} http://127.0.0.1:${port}/healthz"
      return 0
    fi
    sleep 0.5
  done
  echo "FAIL ${bin} did not become healthy; see ${PID_DIR}/${bin}.log" >&2
  return 1
}

cargo build -q -p dating-rendezvous -p dating-push-broker -p dating-turn-credentials \
  -p dating-sealed-mailbox -p dating-report-ingest -p dating-safety-console-api

start_one dating-rendezvous rendezvous 8080
start_one dating-push-broker push-broker 8081
start_one dating-turn-credentials turn-credentials 8082
start_one dating-sealed-mailbox sealed-mailbox 8083
start_one dating-report-ingest report-ingest 8084
start_one dating-safety-console-api safety-console-api 8085

echo "local-services-up: PASS (pids in ${PID_DIR})"
echo "Stop later with: kill \$(cat ${PID_DIR}/*.pid)"
