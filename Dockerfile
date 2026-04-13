# ---------- deps layer ----------
FROM node:20-bullseye-slim AS deps
WORKDIR /app
RUN corepack enable

# copy monorepo (workspace deps require full tree)
COPY . .

# install deps
RUN yarn install --immutable


# ---------- builder layer ----------
FROM node:20-bullseye-slim AS builder
WORKDIR /app
RUN corepack enable

COPY --from=deps /app /app

# build backend + web (+ admin UI used by self-host setup)
RUN yarn nexio build -p @nexio/server --deps --wait-deps \
 && yarn nexio build -p @nexio/web --deps --wait-deps \
 && yarn nexio build -p @nexio/admin --deps --wait-deps

# assemble static assets where the server expects them: /app/static
RUN rm -rf static \
 && mkdir -p static/admin \
 && cp -a packages/frontend/apps/web/dist/. static/ \
 && cp -a packages/frontend/admin/dist/. static/admin/


# ---------- runner layer ----------
FROM node:20-bullseye-slim AS runner
WORKDIR /app
RUN corepack enable

ENV NODE_ENV=production
ENV NEXIO_SERVER_PORT=3010

# copy built app and deps
COPY --from=builder /app /app

EXPOSE 3010

# start backend (serves /static via self-host module)
CMD ["node", "packages/backend/server/dist/main.js"]