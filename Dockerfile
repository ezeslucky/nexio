# ---------- deps layer ----------
FROM node:22-bookworm-slim AS deps

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive
ENV CI=true
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
ENV YARN_ENABLE_IMMUTABLE_INSTALLS=false
ENV GITHUB_SHA="83a648d4"

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        git \
        ca-certificates \
        python3 \
        make \
        g++ \
    && rm -rf /var/lib/apt/lists/*

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
ENV PATH="/root/.cargo/bin:${PATH}"

RUN corepack enable

# Copy monorepo
COPY . .

# Install dependencies
RUN node .yarn/releases/yarn-4.9.1.cjs install \
    --network-timeout 600000

# ---------- builder layer ----------
FROM deps AS builder

ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build backend
RUN node .yarn/releases/yarn-4.9.1.cjs nexio build \
    -p server --deps \
    && test -f packages/backend/server/dist/main.js

# Build web
RUN node .yarn/releases/yarn-4.9.1.cjs nexio build \
    -p web

# Build admin
RUN node .yarn/releases/yarn-4.9.1.cjs nexio build \
    -p admin

# Assemble static assets
RUN rm -rf static \
    && mkdir -p static/admin \
    && cp -a packages/frontend/apps/web/dist/. static/ \
    && cp -a packages/frontend/admin/dist/. static/admin/

# ---------- runner layer ----------
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV DEBIAN_FRONTEND=noninteractive

# ---------- PostgreSQL + Redis ----------
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        gnupg \
        lsb-release \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL \
        https://www.postgresql.org/media/keys/ACCC4CF8.asc \
        -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
        > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-15 \
        redis-server \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

ENV NODE_ENV=production
ENV NEXIO_SERVER_PORT=3010

ENV POSTGRES_USER=nexio
ENV POSTGRES_PASSWORD=nexio
ENV POSTGRES_DB=nexio

ENV DATABASE_URL="postgres://nexio:nexio@localhost:5432/nexio"

ENV REDIS_SERVER_HOST=localhost

ENV MAILER_HOST=127.0.0.1
ENV MAILER_PORT=1025

# Copy built application
COPY --from=builder /app /app

# Setup script
COPY setup.sh /setup.sh

RUN chmod +x /setup.sh \
    && mkdir -p /var/lib/postgresql/data \
    && chown -R postgres:postgres /var/lib/postgresql/data

EXPOSE 3010 5432 6379

VOLUME ["/var/lib/postgresql/data"]

ENTRYPOINT ["/setup.sh"]