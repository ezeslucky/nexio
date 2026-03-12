
## How to contribute

We welcome issues, bug fixes, documentation improvements, and new features.  
The basic flow is:

1. **Fork** the repository on GitHub.
2. **Create a branch** for your change:
   ```bash
   git checkout -b feature/my-change
   ```
3. **Set up the dev environment** (see OS‑specific requirements below).
4. Make your changes and **run tests / type checks**:
   ```bash
   yarn lint
   yarn test
   ```
5. Commit with a descriptive message and **open a pull request** against the main repo.

Please keep PRs focused and small where possible, and describe:
- what changed,
- why it changed,
- how you tested it.

## Environment requirements by OS

### macOS

- **OS**: macOS 13+ (Apple Silicon or Intel)
- **Tools**:
  - Homebrew (`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`)
  - Node.js v20 (via `nvm`)
  - Yarn v4 (via Corepack)
  - PostgreSQL 14+ (via Homebrew)
  - Git

```bash
brew install git postgresql

curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20

corepack enable
```

### Linux

- **OS**: Any modern 64‑bit distro (Ubuntu, Debian, Fedora, Arch, etc.)
- **Tools**:
  - Node.js v20 (via `nvm`)
  - Yarn v4 (via Corepack)
  - PostgreSQL 14+
  - Git

Example (Ubuntu/WSL):

```bash
sudo apt update
sudo apt install -y git postgresql postgresql-client build-essential

curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm install 20
nvm use 20

corepack enable
```

### Windows

On Windows we recommend **WSL2** (Ubuntu) for the smoothest experience.

1. Enable WSL and install Ubuntu from the Microsoft Store.
2. Inside the WSL terminal, follow the **Linux** instructions above.

If you prefer native Windows:
- Install Node 20 (from `nodejs.org`),
- Install Git for Windows,
- Install PostgreSQL for Windows,
- Enable Corepack in PowerShell:

```powershell
corepack enable
```

> Note: native Windows is less tested; WSL2 is strongly recommended.

## Project setup (all platforms)

Once your OS has the tools above:

```bash
git clone https://github.com/ezeslucky/nexio.git
cd nexio
yarn install
```

Set up PostgreSQL:

```bash
sudo -u postgres psql
```

Then in `psql`:

```sql
CREATE ROLE nexio WITH LOGIN PASSWORD 'nexio';
ALTER ROLE nexio WITH LOGIN PASSWORD 'nexio';
CREATE DATABASE nexio OWNER nexio;
GRANT ALL PRIVILEGES ON DATABASE nexio TO nexio;
\q
```

Ensure `packages/backend/server/.env` contains:

```env
DATABASE_URL="postgres://nexio:nexio@localhost:5432/nexio"
```

Run migrations:

```bash
yarn run nexio @nexio/server prisma migrate deploy
```

Start dev servers:

```bash
# Terminal 1 – backend
yarn nexio dev -p @nexio/server

# Terminal 2 – web
export NODE_OPTIONS="--max-old-space-size=8192"
yarn nexio dev -p @nexio/web
```

Open `http://localhost:8080` to use Nexio while you develop.

