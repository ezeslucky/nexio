#!/bin/bash
set -e

PG_DATA="/var/lib/postgresql/data"
PG_BIN="/usr/lib/postgresql/15/bin"

POSTGRES_USER="${POSTGRES_USER:-nexio}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-nexio}"
POSTGRES_DB="${POSTGRES_DB:-nexio}"

echo "==> [1/5] Preparing PostgreSQL data directory"
if [ ! -s "$PG_DATA/PG_VERSION" ]; then
  mkdir -p "$PG_DATA"
  chown -R postgres:postgres "$PG_DATA"
  su postgres -c "$PG_BIN/initdb -D $PG_DATA --auth=trust" >/tmp/initdb.log 2>&1
fi
chown -R postgres:postgres "$PG_DATA"

echo "==> [2/5] Starting PostgreSQL"
su postgres -c "$PG_BIN/pg_ctl -D $PG_DATA -l /tmp/postgres.log -w start"

# Create role/db on first boot
su postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='$POSTGRES_USER'\"" | grep -q 1 || \
  su postgres -c "psql -c \"CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';\""

su postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'\"" | grep -q 1 || \
  su postgres -c "psql -c \"CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER;\""

echo "==> [3/5] Starting Redis"
redis-server --daemonize yes --bind 127.0.0.1 --port 6379

echo "==> [4/5] Running database migrations"
export DATABASE_URL="${DATABASE_URL:-postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB}"
export REDIS_SERVER_HOST="${REDIS_SERVER_HOST:-localhost}"
cd /app
yarn workspace @nexio/server prisma migrate deploy

echo "==> [5/5] Starting Nexio server (serves API + built frontend on :${NEXIO_SERVER_PORT:-3010})"
exec node packages/backend/server/dist/main.js