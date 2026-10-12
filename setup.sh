#!/bin/bash
set -e

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

PG_DATA="/var/lib/postgresql/data"
PG_BIN="/usr/lib/postgresql/15/bin"

POSTGRES_USER="${POSTGRES_USER:-nexio}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-nexio}"
POSTGRES_DB="${POSTGRES_DB:-nexio}"

echo "==> [1/5] Preparing PostgreSQL data directory"
if [ ! -s "$PG_DATA/PG_VERSION" ]; then
  mkdir -p "$PG_DATA"
  chown -R postgres:postgres "$PG_DATA"
  su postgres -c "$PG_BIN/initdb -D $PG_DATA -E UTF8 --locale=C.UTF-8 --auth=trust" >/tmp/initdb.log 2>&1
fi
chown -R postgres:postgres "$PG_DATA"

echo "==> [2/5] Starting PostgreSQL"
su postgres -c "$PG_BIN/pg_ctl -D $PG_DATA -l /tmp/postgres.log -w start"

# Check if cluster was initialized with legacy SQL_ASCII and fix if needed
INIT_ENCODING=$(su postgres -c "psql -tAc \"SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname='template1'\"" 2>/dev/null || echo "")
if [ "$INIT_ENCODING" = "SQL_ASCII" ]; then
  echo "==> Detected legacy SQL_ASCII encoding, reinitializing cluster to UTF8..."
  su postgres -c "$PG_BIN/pg_ctl -D $PG_DATA -m fast -w stop" || true
  rm -rf "$PG_DATA"/*
  su postgres -c "$PG_BIN/initdb -D $PG_DATA -E UTF8 --locale=C.UTF-8 --auth=trust" >/tmp/initdb.log 2>&1
  chown -R postgres:postgres "$PG_DATA"
  su postgres -c "$PG_BIN/pg_ctl -D $PG_DATA -l /tmp/postgres.log -w start"
fi

# Create role/db on first boot
su postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='$POSTGRES_USER'\"" | grep -q 1 || \
  su postgres -c "psql -c \"CREATE ROLE $POSTGRES_USER WITH LOGIN PASSWORD '$POSTGRES_PASSWORD';\""

su postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$POSTGRES_DB'\"" | grep -q 1 || \
  su postgres -c "psql -c \"CREATE DATABASE $POSTGRES_DB OWNER $POSTGRES_USER ENCODING 'UTF8';\""

# Ensure $POSTGRES_USER has superuser privilege so runtime operations bypass ownership restrictions
su postgres -c "psql -c \"ALTER ROLE $POSTGRES_USER WITH SUPERUSER CREATEDB CREATEROLE;\""

reassign_table_ownership() {
  su postgres -c "psql -d $POSTGRES_DB" <<EOF >/dev/null 2>&1 || true
REASSIGN OWNED BY postgres TO $POSTGRES_USER;
GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
ALTER SCHEMA public OWNER TO $POSTGRES_USER;
GRANT ALL ON SCHEMA public TO $POSTGRES_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $POSTGRES_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $POSTGRES_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $POSTGRES_USER;
DO \$\$
DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO $POSTGRES_USER';
  END LOOP;
  FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
    EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' OWNER TO $POSTGRES_USER';
  END LOOP;
END \$\$;
EOF
}

reassign_table_ownership

echo "==> [3/5] Starting Redis"
redis-server --daemonize yes --bind 127.0.0.1 --port 6379

echo "==> [4/5] Running database migrations"
export DATABASE_URL="${DATABASE_URL:-postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB}"
export REDIS_SERVER_HOST="${REDIS_SERVER_HOST:-localhost}"

# 1. Deploy Prisma schema migrations
echo "==> Deploying Prisma migrations"
cd /app/packages/backend/server

HAS_PRISMA_MIGRATIONS=$(su postgres -c "psql -d $POSTGRES_DB -tAc \"SELECT to_regclass('public._prisma_migrations') IS NOT NULL;\"" 2>/dev/null || echo "f")
HAS_USERS_TABLE=$(su postgres -c "psql -d $POSTGRES_DB -tAc \"SELECT to_regclass('public.users') IS NOT NULL;\"" 2>/dev/null || echo "f")

if [ "$HAS_PRISMA_MIGRATIONS" != "t" ]; then
  if [ "$HAS_USERS_TABLE" = "t" ]; then
    echo "==> Existing app tables detected without Prisma migrations table; baselining initial migration..."
    npx prisma migrate resolve --applied 20230425035217_init || true
  else
    TABLE_COUNT=$(su postgres -c "psql -d $POSTGRES_DB -tAc \"SELECT count(*) FROM pg_tables WHERE schemaname = 'public';\"" 2>/dev/null || echo "0")
    if [ "$TABLE_COUNT" -gt 0 ]; then
      echo "==> Detected $TABLE_COUNT unmanaged tables without app data. Resetting public schema for clean Prisma initialization..."
      su postgres -c "psql -d $POSTGRES_DB -c \"DROP SCHEMA public CASCADE; CREATE SCHEMA public; ALTER SCHEMA public OWNER TO $POSTGRES_USER; GRANT ALL ON SCHEMA public TO $POSTGRES_USER;\""
    fi
  fi
fi

if ! npx prisma migrate deploy; then
  echo "==> Notice: prisma migrate deploy exited non-zero; synchronizing database schema via prisma db push..."
  npx prisma db push --skip-generate --accept-data-loss || true
fi

# 2. Ensure runtime DDL tables exist and are owned by $POSTGRES_USER
if [ -f "/app/scripts/runtime_migrations.sql" ]; then
  echo "==> Applying native runtime table schema"
  su postgres -c "psql -d $POSTGRES_DB -f /app/scripts/runtime_migrations.sql" >/tmp/runtime_migrations.log 2>&1 || true
fi

reassign_table_ownership

# 3. Run application data migrations
echo "==> Running data migrations"
cd /app
SERVER_FLAVOR=script node packages/backend/server/dist/main.js run || true

echo "==> [5/5] Starting Nexio server (serves API + built frontend on :${NEXIO_SERVER_PORT:-3010})"
exec node packages/backend/server/dist/main.js