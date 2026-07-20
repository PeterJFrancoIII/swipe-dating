#!/usr/bin/env bash
# Docker-free local smoke: build and exercise control-plane services on localhost.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=/dev/null
source "$HOME/.cargo/env"

readonly RENDEZVOUS_PORT=8080
readonly PUSH_BROKER_PORT=8081
readonly TURN_CREDENTIALS_PORT=8082
readonly SEALED_MAILBOX_PORT=8083
readonly REPORT_INGEST_PORT=8084
readonly SAFETY_CONSOLE_PORT=8085

PIDS=()

cleanup() {
  local pid
  for pid in "${PIDS[@]:-}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
  done
}
trap cleanup EXIT INT TERM

wait_for_health() {
  local name="$1"
  local port="$2"
  local url="http://127.0.0.1:${port}/healthz"
  local attempt
  for attempt in $(seq 1 60); do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo "  ok  ${name} ${url}"
      return 0
    fi
    sleep 0.5
  done
  echo "  FAIL ${name} healthz not ready on port ${port}" >&2
  return 1
}

start_service() {
  local name="$1"
  local port="$2"
  local log_file
  log_file="$(mktemp -t "${name}.XXXXXX")"
  PORT="$port" cargo run -q -p "dating-${name}" --bin "$name" >"$log_file" 2>&1 &
  local pid=$!
  PIDS+=("$pid")
  echo "started ${name} pid=${pid} port=${port} log=${log_file}"
}

echo "=== local-smoke: building workspace ==="
cargo build -q --workspace

echo "=== local-smoke: starting services ==="
start_service rendezvous "$RENDEZVOUS_PORT"
start_service push-broker "$PUSH_BROKER_PORT"
start_service turn-credentials "$TURN_CREDENTIALS_PORT"
start_service sealed-mailbox "$SEALED_MAILBOX_PORT"
start_service report-ingest "$REPORT_INGEST_PORT"
start_service safety-console-api "$SAFETY_CONSOLE_PORT"

echo "=== local-smoke: waiting for /healthz ==="
wait_for_health rendezvous "$RENDEZVOUS_PORT"
wait_for_health push-broker "$PUSH_BROKER_PORT"
wait_for_health turn-credentials "$TURN_CREDENTIALS_PORT"
wait_for_health sealed-mailbox "$SEALED_MAILBOX_PORT"
wait_for_health report-ingest "$REPORT_INGEST_PORT"
wait_for_health safety-console-api "$SAFETY_CONSOLE_PORT"

echo "=== local-smoke: health matrix ==="
for port in \
  "$RENDEZVOUS_PORT" \
  "$PUSH_BROKER_PORT" \
  "$TURN_CREDENTIALS_PORT" \
  "$SEALED_MAILBOX_PORT" \
  "$REPORT_INGEST_PORT" \
  "$SAFETY_CONSOLE_PORT"; do
  curl -sf "http://127.0.0.1:${port}/healthz"
  echo "  port ${port}"
done

echo "=== local-smoke: rendezvous discovery (empty region) ==="
discovery_body="$(curl -sf "http://127.0.0.1:${RENDEZVOUS_PORT}/v1/discovery?region=us-west-coarse")"
echo "  discovery: ${discovery_body}"

echo "=== local-smoke: PASS ==="
echo "ports: rendezvous=${RENDEZVOUS_PORT} push-broker=${PUSH_BROKER_PORT} turn-credentials=${TURN_CREDENTIALS_PORT} sealed-mailbox=${SEALED_MAILBOX_PORT} report-ingest=${REPORT_INGEST_PORT} safety-console-api=${SAFETY_CONSOLE_PORT}"
