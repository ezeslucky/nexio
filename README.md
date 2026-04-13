# NEXIO 
Is a next-generation all-in-one workspace and knowledge operating system that unifies wikis, knowledge management, presentations, and digital assets into a single platform — built to outperform tools like Notion and Miro.

## Features

- **Edgeless canvas for every kind of block**  
  Nexio gives you a true canvas where any block can live together on the same surface: rich text, sticky notes, shapes, multi-view databases, embedded web pages, linked pages, and even presentation slides. Documents and whiteboards are fully merged so you can write, sketch, plan, and present in a single space.

- **Multimodal AI partner for your work**  
  Draft reports, turn outlines into slide decks, summarize long documents into mind maps, or organize your backlog into clear task boards. Nexio’s AI features are designed to plug into the canvas, helping you brainstorm, refactor structure, and generate content directly where you work.

- **Local‑first with real‑time collaboration**  
  Your data lives on your own disk first, with optional cloud sync and real‑time collaboration across devices. Nexio is built to feel responsive and reliable offline, while still supporting multi‑user sessions in the browser and desktop apps.

- **Self‑host and shape your own Nexio**  
  You can fork, self‑host, and customize Nexio to match your workflows. The architecture is designed for extensions and custom blocks, so teams can add their own integrations and building blocks on top of the core experience.

## Architecture Overview

Nexio is a **Yarn v4 + Turborepo monorepo**. At a high level, it’s a web/electron client talking to a TypeScript backend, with a shared “document/block” engine and a few native (Rust) accelerators.

### High-level runtime diagram

```text
                 ┌──────────────────────────────┐
                 │      Nexio Client Apps        │
                 │  - Web: @nexio/web            │
                 │  - Desktop: Electron app      │
                 └───────────────┬───────────────┘
                                 │ HTTP (API)
                                 v
                 ┌──────────────────────────────┐
                 │        Backend Server         │
                 │     packages/backend/server   │
                 └───────┬───────────┬───────────┘
                         │           │
                         v           v
                    PostgreSQL      Redis
                         │
                         v
               (optional) Search/Indexer
        (devcontainer uses Manticore; other setups may vary)
```

### Runtime ports & URLs (defaults)

- **Backend server**: `http://localhost:3010`
  - **GraphQL**: `http://localhost:3010/graphql`
  - **Swagger (dev only)**: `http://localhost:3010/api/docs`
- **Web dev server**: `http://localhost:8080`
  - Proxies to backend for `/_` endpoints like `/api`, `/graphql`, and `/socket.io`
- **Dev services (docker compose)**:
  - Postgres: `localhost:5432`
  - Redis: `localhost:6379`
  - Mailpit UI: `http://localhost:8025` (SMTP: `localhost:1025`)
  - Manticoresearch: `localhost:9308`

### Monorepo layout (what lives where)

- **Backend**: `packages/backend/server`
  - TypeScript server (API layer + business logic).
  - Persists data in PostgreSQL; uses Redis for caching/queues/session-like concerns depending on feature.
  - Main API surface is GraphQL (`/graphql`), with some REST endpoints where needed.
  - Some capabilities rely on native bindings built from Rust (see “Native” below).

- **Frontend**
  - **Web app**: `packages/frontend/apps/web` (workspace `@nexio/web`)
  - **Electron app**: `packages/frontend/apps/electron`
  - **Electron renderer**: `packages/frontend/apps/electron-renderer`
  - The UI and editor experience are built around the shared “block/document” engine (see BlockSuite).

- **Block/document engine**: `blocksuite/**`
  - Shared editor/document framework and building blocks used by the client apps.

- **Shared/common packages**: `packages/common/**`
  - Shared utilities and cross-cutting libraries used across backend and frontend.
  - Notable examples you’ll see referenced in dev docs include `@nexio/reader` and other shared modules.

- **Native (Rust) accelerators**: `packages/frontend/native` and `packages/backend/server-native`
  - Built via repo scripts (NAPI.rs bindings). These are required for some features and are typically built during setup.

- **Developer tooling**
  - **Monorepo runner/CLI**: `tools/cli` (invoked as `yarn nexio ...`)
  - Repo-wide tasks are orchestrated through this runner + Turborepo pipelines.

### Repository structure (tree-style)

```text
nexio/
├── packages/                          # 📦 Product code (most workspaces live here)
│   ├── frontend/
│   │   ├── apps/                      # 📱 Client applications
│   │   │   ├── web/                   # 🌐 Web app (workspace: @nexio/web)
│   │   │   └── electron/              # 🖥️ Desktop app (Electron)
│   │   ├── core/                      # 🧩 Shared frontend “core” modules
│   │   ├── routes/                    # 🧭 Route definitions
│   │   ├── i18n/                      # 🌍 Localization
│   │   ├── templates/                 # 🧰 Templates/scaffolding
│   │   └── native/                    # 🦀 Rust/NAPI native bindings (frontend)
│   ├── backend/
│   │   ├── server/                    # 🌐 Backend server (workspace: @nexio/server)
│   │   └── server-native/             # 🦀 Rust/NAPI native bindings (server)
│   └── common/                        # 🔁 Shared libraries used across repo
│       ├── reader/                    # 📖 Reader/conversion utilities
│       ├── graphql/                   # 🔌 Shared GraphQL helpers
│       └── ...                        # (many more shared packages)
├── blocksuite/                        # 🧱 Block/document engine and framework
├── tools/                             # 🛠️ Tooling (includes monorepo CLI)
│   └── cli/                           # 🧰 `yarn nexio ...` runner
├── docs/                              # 📚 Project docs (build/dev guides)
├── tests/                             # 🧪 Test workspaces (unit/E2E/integration)
├── .github/                           # 🧾 GitHub metadata (funding, etc.)
└── .docker/                           # 🐳 Dev/selfhost docker compose examples
```

### Request / data flow (developer mental model)

1. **Browser/Electron hits the web app on `:8080`** in dev.
2. The dev server **proxies API traffic** (`/graphql`, `/api`, `/socket.io`) to the backend on `:3010`.
3. The backend uses:
   - **PostgreSQL** for persistent storage (`DATABASE_URL`)
   - **Redis** for background jobs/caching/coordination (`REDIS_SERVER_HOST`, etc.)
   - **Optional indexer/search provider** (e.g. Manticore) when enabled via `NEXIO_INDEXER_*`

### Key configuration knobs (common env vars)

- **Backend**
  - `NEXIO_SERVER_PORT` (default `3010`)
  - `DATABASE_URL`
  - `REDIS_SERVER_HOST`
- **Frontend/Electron (dev)**
  - `DEV_SERVER_URL` (Electron points to `http://localhost:8080`)
  - `SELF_HOSTED=true` (changes dev-server HTML entry)

### Build & task orchestration

- **Package manager**: Yarn (`packageManager: yarn@4.x`)
- **Orchestration**: Turborepo (`turbo.json`) for `dev`, `build`, lint/typecheck pipelines
- **Repo runner**: `yarn nexio ...` is the common entrypoint used in docs and scripts

### Infrastructure dependencies (local/dev)

- **PostgreSQL**: primary datastore
- **Redis**: required for backend dev in the docker-compose based workflow
- **Indexer/Search (optional)**: used by indexing/search features; the devcontainer compose uses **Manticore**
- **Mailhog (dev-only)**: referenced in server dev docs for capturing outbound email locally

## Acknowledgement

“We shape our tools and thereafter our tools shape us.” Nexio is inspired by many pioneers in the knowledge‑work and collaboration space, including:

- **Quip & Notion** for the concept that everything can be a block.
- **Trello** for Kanban‑style task management.
- **Airtable & Miro** for programmable datasheets and visual collaboration.
- **Miro & Whimsical** for edgeless whiteboards and diagramming.
- **RemNote, Capacities, and others** for object‑based, tag‑centric knowledge graphs.

There is a large overlap in the atomic “building blocks” across these tools, but most are closed‑source and don’t expose a truly open, extensible plugin system. Nexio aims to bring together the best of these ideas in an open, hackable platform that can keep evolving with its community.

## Requirements

- **OS**: Linux (or WSL2 on Windows)
- **Node.js**: v20.x (managed with `nvm` recommended)
- **Yarn**: v4 (via Corepack)
- **PostgreSQL**: running locally on `localhost:5432`
- **Git** and **Docker** (optional, only if you want containerized deploys)

### Install basic tools

```bash
# Node + nvm (if you don't have them)
# see: https://github.com/nvm-sh/nvm

nvm install 20
nvm use 20

# Enable Yarn via Corepack
corepack enable
```

## Quick start (local development)

### 1. Clone and install

```bash
git clone https://github.com/ezeslucky/nexio.git 
cd nexio

# install dependencies for the monorepo
yarn install
```

### 2. Set up PostgreSQL

Create a `nexio` user and database (run in your shell):

```bash
sudo -u postgres psql
```

Then in the `psql` prompt:

```sql
CREATE ROLE nexio WITH LOGIN PASSWORD 'nexio';
ALTER ROLE nexio WITH LOGIN PASSWORD 'nexio';
CREATE DATABASE nexio OWNER nexio;
GRANT ALL PRIVILEGES ON DATABASE nexio TO nexio;
\q
```

Make sure `packages/backend/server/.env` has:

```env
DATABASE_URL="postgres://nexio:nexio@localhost:5432/nexio"
```

### 3. Run database migrations

From the repo root:

```bash
yarn run nexio @nexio/server prisma migrate deploy
```

### 4. Start Nexio (backend + web)

Open **two terminals** in the repo root:

**Terminal 1 – backend server**

```bash
yarn nexio dev -p @nexio/server
```

This starts the API on `http://localhost:3010`.

**Terminal 2 – web app**

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
yarn nexio dev -p @nexio/web
```

This starts the web UI on `http://localhost:8080`.

Then open your browser at:

- `http://localhost:8080` → Nexio web interface

