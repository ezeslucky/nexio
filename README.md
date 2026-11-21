# NEXIO 🚀

> **Next-generation all-in-one workspace, knowledge operating system, and AI automation engine.**  
> Nexio unifies wikis, knowledge management, presentation canvases, and visual AI workflows into a single platform — built to outperform tools like Notion, Miro, and n8n.
>
> 🌐 **Website**: [https://www.technexio.me](https://www.technexio.me)  
> 📦 **GitHub**: [https://github.com/ezeslucky/nexio](https://github.com/ezeslucky/nexio)

---

## ⚡ Instant Install (1-Line Terminal Installers)

Install and run Nexio on any platform in seconds:

### macOS & Linux
```bash
curl -fsSL https://www.technexio.me/ | sh
```

### Windows (PowerShell)
```powershell
irm https://www.technexio.me/install.ps1 | iex
```

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

- **🚀 Ultra-Fast Go Native Backend**  
  Equipped with a native Golang backend (`packages/backend/go-native`) providing high-concurrency document synchronization, Socket.IO v4 real-time transport, GraphQL APIs, and universal platform installers without requiring heavy external databases.

- **🛠️ Self-Host & Shape Your Own Nexio**  
  Fork, self-host, and customize Nexio to match your workflows. Built with an open, extensible plugin architecture so teams can build custom blocks, node types, and integrations.

---

## 🏛️ Architecture Overview

Nexio is organized as a **Yarn v4 + Turborepo monorepo** with high-performance TypeScript frontend packages, an ultra-fast Go backend daemon, native Rust modules, and an extensible block editor engine.

### High-Level Runtime Diagram

```text
                 ┌────────────────────────────────────────┐
                 │           Nexio Client Apps            │
                 │   - Web App: @nexio/web (:8080)        │
                 │   - Desktop App: Electron (:8080)      │
                 │   - Workflow Studio Engine             │
                 └──────────────────┬─────────────────────┘
                                    │ HTTP / GraphQL / Socket.IO
                                    v
                 ┌────────────────────────────────────────┐
                 │          Nexio Backend Layer           │
                 │  - Go Native Server (:3010)            │
                 │  - Node Server: @nexio/server (:3010)  │
                 └──────────────┬──────────────────┬──────┘
                                │                  │
                                v                  v
                           PostgreSQL/SQLite      Redis
```

### Runtime Ports & URLs (Defaults)

- **Web App**: `http://localhost:8080`
  - Proxies to backend for `/_` endpoints (`/api`, `/graphql`, `/socket.io`)
- **Backend Server**: `http://localhost:3010`
  - **Installer Endpoints**: `http://localhost:3010/install.sh` & `/install.ps1`
  - **Socket.IO Engine.IO v4**: `http://localhost:3010/socket.io/`
  - **GraphQL Playground**: `http://localhost:3010/graphql`
  - **Swagger API Docs (Dev)**: `http://localhost:3010/api/docs`

---

## 📂 Repository Structure

```text
nexio/
├── packages/                          # 📦 Monorepo packages
│   ├── frontend/
│   │   ├── apps/                      # 📱 Client applications
│   │   │   ├── web/                   # 🌐 Web app (@nexio/web)
│   │   │   ├── electron/              # 🖥️ Desktop app (Electron)
│   │   │   └── electron-renderer/     # 🖥️ Electron UI renderer
│   │   ├── core/                      # 🧩 Core UI, routes & workflow studio
│   │   │   └── src/desktop/pages/workspace/workflow/  # ⚡ Visual AI workflow engine
│   │   ├── i18n/                      # 🌍 Localization resources
│   │   ├── templates/                 # 🧰 Document & workspace templates
│   │   └── native/                    # 🦀 Rust/NAPI native bindings (nexio_native)
│   ├── backend/
│   │   ├── go-native/                 # 🚀 High-performance Go native server & installers
│   │   ├── server/                    # 🌐 Node.js backend server & OAuth handlers
│   │   └── native/                    # 🦀 Rust/NAPI server native (nexio_server_native)
│   └── common/                        # 🔁 Shared libraries & utilities (nexio_common)
├── editor/                            # 🧱 Block/document engine & canvas framework
├── tools/                             # 🛠️ Monorepo CLI & build tools (`yarn nexio ...`)
├── docs/                              # 📚 Guides and architecture documentation
└── tests/                             # 🧪 Unit, integration, and E2E test suites
```

---

## 📋 Requirements

### Core Requirements (Standard Development & Running)
- **OS**: Linux, macOS, or Windows
- **Node.js**: `v20.x` or higher
- **Yarn**: `v4.x` (via Corepack)
- **Go**: `v1.22+` (for compiling Go native backend, or use the pre-built binary in `packages/backend/go-native/bin/`)
- **Git**

> [!NOTE]
> **Rust is NOT required** for standard development, running the web app, or using the Go backend.

### Optional (Native Rust Crate Development Only)
- **Rust & Cargo**: `v1.85+` (Edition 2024) — Only needed if you are modifying and recompiling the low-level native Rust crates (`packages/frontend/native`, `packages/backend/native`, `packages/frontend/mobile-native`) via `cargo build` or `napi build`.

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

### 2. Start Backend & Web Dev Server

You can start the lightweight Go server and Web client in two terminals:

**Terminal 1 — High-Performance Go Server (`:3010`)**
```bash
# Run the Go native server
go run -C packages/backend/go-native ./cmd/server
```

**Terminal 2 — Web Client (`:8080`)**
```bash
yarn dev:web
# or: yarn nexio dev -p @nexio/web
```

Once started, open your browser:
- **Web App**: [http://localhost:8080](http://localhost:8080)
- **Workflow Studio**: [http://localhost:8080/workflow](http://localhost:8080/workflow)
- **Terminal Installer**: [https://www.technexio.me](https://www.technexio.me)

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
- **Quip & Notion** — universal document block model.
- **n8n & Zapier** — visual node-based workflow orchestration and automation.
- **Miro & Whimsical** — edgeless whiteboard collaboration.
- **Airtable & Trello** — programmable datasheets and Kanban workflows.
- **Capacities & RemNote** — networked knowledge graph and object-based modeling.

---

## 📄 License

Nexio is open-source software licensed under the [MIT License](LICENSE).
