# ---------- deps layer ----------
FROM node:20-bullseye-slim AS deps
WORKDIR /app
RUN corepack enable

# copy monorepo (workspace deps require full tree)
COPY . .

# install deps
RUN node .yarn/releases/yarn-4.9.1.cjs install --immutable --network-timeout 600000
# ---------- builder layer ----------
FROM node:20-bullseye-slim AS builder
WORKDIR /app
RUN corepack enable

COPY --from=deps /app /app

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV CI=true

# build backend + web + admin UI (self-host)
# build backend + web + admin UI (self-host)
RUN node .yarn/releases/yarn-4.9.1.cjs nexio build -p @nexio/server --deps \
 && node .yarn/releases/yarn-4.9.1.cjs nexio build -p @nexio/web \
 && node .yarn/releases/yarn-4.9.1.cjs nexio build -p @nexio/admin
# assemble static assets where the server expects them: /app/static
RUN rm -rf static \
 && mkdir -p static/admin \
 && cp -a packages/frontend/apps/web/dist/. static/ \
 && cp -a packages/frontend/admin/dist/. static/admin/

# ---------- runner layer (app + postgres + redis) ----------
FROM node:20-bullseye-slim AS runner
WORKDIR /app

# --- install PostgreSQL 15 (via PGDG repo) and Redis ---
RUN apt-get update && apt-get install -y --no-install-recommends \
      curl ca-certificates gnupg lsb-release && \
    install -d /usr/share/postgresql-common/pgdg && \
    curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
      https://www.postgresql.org/media/keys/ACCC4CF8.asc && \
    echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
      > /etc/apt/sources.list.d/pgdg.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends postgresql-15 redis-server && \
    rm -rf /var/lib/apt/lists/*

RUN corepack enable

ENV NODE_ENV=production
ENV NEXIO_SERVER_PORT=3010

# --- database defaults (override at `docker run -e ...` if needed) ---
ENV POSTGRES_USER=nexio
ENV POSTGRES_PASSWORD=nexio
ENV POSTGRES_DB=nexio
ENV DATABASE_URL="postgres://nexio:nexio@localhost:5432/nexio"
ENV REDIS_SERVER_HOST=localhost
ENV MAILER_HOST=127.0.0.1
ENV MAILER_PORT=1025

# copy built app and deps
COPY --from=builder /app /app

# setup script that boots postgres + redis + migrations + server
COPY setup.sh /setup.sh
RUN chmod +x /setup.sh && \
    mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql/data

EXPOSE 3010 5432 6379

VOLUME ["/var/lib/postgresql/data"]

ENTRYPOINT ["/setup.sh"]