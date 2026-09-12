#!/usr/bin/env bash
# Cloud Agent start script for Habicht.
# Runs on every boot: brings up the PostgreSQL daemon and waits for readiness.
# Idempotent: tolerates an already-running cluster.
set -euo pipefail

PG_VER="$(ls /etc/postgresql 2>/dev/null | sort -V | tail -1 || true)"
PG_VER="${PG_VER:-16}"
PG_CLUSTER="main"

echo "==> Starting PostgreSQL cluster ${PG_VER}/${PG_CLUSTER}"
sudo pg_ctlcluster "${PG_VER}" "${PG_CLUSTER}" start 2>/dev/null || true

echo "==> Waiting for PostgreSQL to accept connections"
for _ in $(seq 1 30); do
  if pg_isready -h localhost -q 2>/dev/null; then
    echo "==> PostgreSQL is ready."
    exit 0
  fi
  sleep 1
done

echo "!! PostgreSQL did not become ready in time" >&2
exit 1
