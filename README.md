# NEXIO 
Is a next-generation all-in-one workspace and knowledge operating system that unifies wikis, knowledge management, presentations, and digital assets into a single platform — built to outperform tools like Notion and Miro.

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
git clone <your-fork-or-repo-url> nexio
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

