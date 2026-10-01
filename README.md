# NEXIO 🚀

> **Next-generation all-in-one workspace, knowledge operating system, and AI automation engine.**  
> Nexio unifies wikis, knowledge management, presentation canvases, and visual AI workflows into a single platform — built to outperform tools like Notion, Miro, and n8n.

---

## ✨ Features

- **🎨 Edgeless Canvas for Every Kind of Block**  
  A true infinite canvas where any block can live together on the same surface: rich text, sticky notes, shapes, multi-view databases, embedded web pages, linked pages, and presentation slides. Documents and whiteboards are fully merged so you can write, sketch, plan, and present in a single space.

- **⚡ Visual AI Automation Workflow Studio (n8n-style)**  
  Create powerful multi-step AI automations directly inside your workspace:
  - **Node-Based Canvas**: Drag-and-drop triggers, AI reasoning models, logic branches, and output actions with dynamic bezier connector cables.
  - **Rich Node Catalog**:
    - **Triggers**: Webhook, Schedule/Cron, Document Created, Manual run.
    - **AI Models**: GPT-4o, Claude 3.5 Sonnet, Nexio Copilot, Fal AI image generation.
    - **Logic & Flow**: Condition branches (`if/else`), custom JavaScript/TypeScript code execution.
    - **Actions**: Auto-create canvas documents, dispatch emails, send Slack alerts, or trigger webhooks.
  - **Live Execution Engine**: Test and inspect runs with real-time status pulses, node-by-node execution tracing, and a sliding debug console.
  - **Templates Included**: Pre-built starter templates for AI content summarization, meeting note triage, and ticket management.

- **🤖 Multimodal AI Partner for Your Work**  
  Draft reports, turn outlines into slide decks, summarize long documents into mind maps, or organize your backlog into clear task boards. Nexio’s AI features plug directly into the canvas to brainstorm, refactor structure, and generate content where you work.

- **🔐 Google & GitHub OAuth Integration**  
  Seamless single sign-on (SSO) with Google and GitHub accounts. Sign in with one click and get routed straight to your workspace dashboard.

- **💾 Local-First with Real-Time Collaboration**  
  Your data lives on your own disk first, with optional cloud sync and real-time collaboration across devices. Responsive and reliable offline, while seamlessly supporting multi-user sessions in the browser and desktop apps.

- **🛠️ Self-Host & Shape Your Own Nexio**  
  Fork, self-host, and customize Nexio to match your workflows. Built with an open, extensible plugin architecture so teams can build custom blocks, node types, and integrations.

---

## 🏛️ Architecture Overview

Nexio is organized as a **Yarn v4 + Turborepo monorepo**. It pairs a web and Electron desktop client with a high-performance TypeScript backend server, a shared block engine, and native Rust accelerators.

### High-Level Runtime Diagram

```text
                 ┌──────────────────────────────┐
                 │      Nexio Client Apps       │
                 │  - Web: @nexio/web           │
                 │  - Desktop: Electron app     │
                 │  - Workflow Studio Engine    │
                 └───────────────┬──────────────┘
                                 │ HTTP / GraphQL / WebSockets
                                 v
                 ┌──────────────────────────────┐
                 │        Backend Server        │
                 │    packages/backend/server   │
                 └───────┬───────────┬──────────┘
                         │           │
                         v           v
                    PostgreSQL      Redis
                         │
                         v
               (optional) Search/Indexer
```

### Runtime Ports & URLs (Defaults)

- **Web App**: `http://localhost:8080`
  - Proxies to backend for `/_` endpoints (`/api`, `/graphql`, `/socket.io`)
- **Backend Server**: `http://localhost:3010`
  - **GraphQL Playground**: `http://localhost:3010/graphql`
  - **Swagger API Docs (Dev)**: `http://localhost:3010/api/docs`
- **Dev Services**:
  - PostgreSQL: `localhost:5432`
  - Redis: `localhost:6379`
  - Mailpit UI: `http://localhost:8025` (SMTP: `localhost:1025`)
  - Search/Indexer: `localhost:9308`

---

## 📂 Repository Structure

```text
nexio/
├── packages/                          # 📦 Product code (workspaces)
│   ├── frontend/
│   │   ├── apps/                      # 📱 Client applications
│   │   │   ├── web/                   # 🌐 Web app (@nexio/web)
│   │   │   ├── electron/              # 🖥️ Desktop app (Electron)
│   │   │   └── electron-renderer/     # 🖥️ Electron UI renderer
│   │   ├── core/                      # 🧩 Core UI, routes & workflow studio
│   │   │   └── src/desktop/pages/workspace/workflow/  # ⚡ Visual AI workflow engine
│   │   ├── routes/                    # 🧭 Route definitions
│   │   ├── i18n/                      # 🌍 Localization resources
│   │   ├── templates/                 # 🧰 Document & workspace templates
│   │   └── native/                    # 🦀 Rust/NAPI native bindings (frontend)
│   ├── backend/
│   │   ├── server/                    # 🌐 Backend server & OAuth handlers
│   │   └── server-native/             # 🦀 Rust/NAPI native bindings (server)
│   └── common/                        # 🔁 Shared libraries & utilities
├── canvas/                            # 🧱 Block/document engine & canvas framework
├── tools/                             # 🛠️ Monorepo CLI & build tools
│   └── cli/                           # 🧰 `yarn nexio ...` runner
├── docs/                              # 📚 Guides and architecture documentation
├── tests/                             # 🧪 Unit, integration, and E2E test suites
└── .docker/                           # 🐳 Docker compose configurations
```

---

## 📋 Requirements

- **OS**: Linux, macOS, or Windows (WSL2 or native PowerShell)
- **Node.js**: `v20.x` (`nvm` recommended)
- **Yarn**: `v4.x` (via Corepack)
- **PostgreSQL**: `v14+` running on `localhost:5432`
- **Redis**: running on `localhost:6379`
- **Git** and **Docker** (optional, for containerized services)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/ezeslucky/nexio.git
cd nexio

# Enable Yarn 4 via Corepack
corepack enable

# Install monorepo dependencies
yarn install
```

### 2. Configure PostgreSQL

Create the `nexio` user and database:

```bash
sudo -u postgres psql
```

Inside the PostgreSQL prompt:

```sql
CREATE ROLE nexio WITH LOGIN PASSWORD 'nexio';
ALTER ROLE nexio WITH LOGIN PASSWORD 'nexio';
CREATE DATABASE nexio OWNER nexio;
GRANT ALL PRIVILEGES ON DATABASE nexio TO nexio;
\q
```

Ensure `packages/backend/server/.env` includes your database and OAuth credentials (optional):

```env
DATABASE_URL="postgres://nexio:nexio@localhost:5432/nexio"
REDIS_SERVER_HOST="localhost"
REDIS_SERVER_PORT=6379

# (Optional) Google & GitHub OAuth
OAUTH_GOOGLE_CLIENT_ID="your-google-client-id"
OAUTH_GOOGLE_CLIENT_SECRET="your-google-client-secret"
OAUTH_GITHUB_CLIENT_ID="your-github-client-id"
OAUTH_GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 3. Run Database Migrations

```bash
yarn run nexio @nexio/server prisma migrate deploy
```

### 4. Start the Application

You can start the backend and frontend in two separate terminals:

**Terminal 1 — Backend API Server (`:3010`)**
```bash
yarn dev:server
# or: yarn nexio dev -p @nexio/server
```

**Terminal 2 — Web Client (`:8080`)**
```bash
yarn dev:web
# or: yarn nexio dev -p @nexio/web
```

Once started, navigate to:
- **Web App**: [http://localhost:8080](http://localhost:8080)
- **Workflow Studio**: [http://localhost:8080/workflow](http://localhost:8080/workflow)
- **API Docs (Swagger)**: [http://localhost:3010/api/docs](http://localhost:3010/api/docs)

---

## ⚡ Using the AI Workflow Studio

1. Open your workspace and click **Workflow** in the left sidebar (or navigate to `/workflow`).
2. Click **Create Workflow** or pick from the template library (*AI Content Summarizer*, *Meeting Notes Triage*, etc.).
3. Drag new nodes onto the dot-grid canvas from the catalog:
   - Connect output ports to input ports to form your pipeline.
   - Click any node to customize prompts, models, thresholds, or API keys in the **Node Inspector**.
4. Click **Run Workflow** to watch the live execution engine step through each node with real-time logs in the bottom console drawer.

---

## 🤝 Acknowledgement & Inspiration

Nexio stands on the shoulders of pioneers in knowledge-work, visual collaboration, and automation:
- **Quip & Notion** — the universal document block model.
- **n8n & Zapier** — visual node-based workflow orchestration and automation.
- **Miro & Whimsical** — edgeless whiteboard collaboration.
- **Airtable & Trello** — programmable datasheets and Kanban workflows.
- **Capacities & RemNote** — networked knowledge graph and object-based modeling.

---

## 📄 License

Nexio is open-source software licensed under the [MIT License](LICENSE).
