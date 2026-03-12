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

This starts the API on `http://localhost:3011`.

**Terminal 2 – web app**

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
yarn nexio dev -p @nexio/web
```

This starts the web UI on `http://localhost:8080`.

Then open your browser at:

- `http://localhost:8080` → Nexio web interface

