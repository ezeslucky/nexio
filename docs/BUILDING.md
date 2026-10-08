# Building Nexio Web 🚀

> **Note**
> This guide covers building and developing the **web app** and **visual workflow studio**.
> For the desktop client app, see [building-desktop-client-app.md](./building-desktop-client-app.md).
> For running the backend server locally, see [developing-server.md](./developing-server.md).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Setup Environment](#setup-environment)
- [Start Development Server](#start-development-server)
- [Testing](#testing)
- [Linting and Type Checking](#linting-and-type-checking)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Troubleshooting](#troubleshooting)
- [Related Documents](#related-documents)

## Prerequisites

Nexio client has both **Node.js** & **Rust** toolchains.

### Node.js

Develop with Node.js pinned in [`.nvmrc`](../.nvmrc) (Node.js **20.x** or **22.x**; `package.json` requires `>=22.12.0 <23.0.0` or Node 20 LTS with Corepack).

```sh
# with fnm (https://github.com/Schniz/fnm)
fnm use --install-if-missing

# or with nvm (https://github.com/nvm-sh/nvm)
nvm install && nvm use
```

Alternatively, install Node.js from <https://nodejs.org/en/download>.

### Yarn

We use modern Yarn (currently **4.x**, pinned by the `packageManager` field in `package.json`). Enable it via [Corepack](https://yarnpkg.com/corepack), which ships with Node.js:

```sh
corepack enable
```

After this, `yarn` inside the repository automatically resolves to the pinned version — verify with `yarn -v` (it should print `4.x`).

### Rust

Install the Rust toolchain via [rustup](https://rustup.rs/). The required version is pinned in [`rust-toolchain.toml`](../rust-toolchain.toml), and rustup installs it automatically the first time you build inside the repository.

## Setup Environment

### Clone the repository

#### Linux & macOS

```sh
git clone https://github.com/ezeslucky/nexio.git
cd nexio
```

#### Windows

In our codebase, we use symbolic links. Due to the security design of Windows, the creation of symbolic links requires administrator privileges or Windows Developer Mode:

```sh
# Enable symbolic links
git config --global core.symlinks true
# Clone the repository
git clone https://github.com/ezeslucky/nexio.git
cd nexio
```

### Install dependencies

```sh
yarn install
```

This also initializes the workspace (`yarn nexio init`) and installs the git hooks through the `postinstall` script.

### Build Native Dependencies

Run the following script. It will build the native module at [`packages/frontend/native`](../packages/frontend/native) and build Node.js bindings using [NAPI.rs](https://napi.rs/).

```sh
yarn nexio @nexio/native build
```

### Build Server Dependencies

Only needed if you plan to run the local server or the cloud E2E suites:

```sh
yarn nexio @nexio/server-native build
```

## Start Development Server

You can run the web app and backend server using our convenient npm scripts:

```sh
# Terminal 1 — Start the backend API server (:3010)
yarn dev:server

# Terminal 2 — Start the web app (:8080)
yarn dev:web
```

Or target individual packages directly using `yarn nexio dev`:

```sh
yarn nexio dev -p @nexio/web
```

Running `@nexio/web` is enough for editor and visual AI workflow work — workspaces are stored locally in the browser. To work on **cloud** features (accounts, sync, collaboration, AI), run the local backend server as well.

## Testing

Adding test cases is strongly encouraged when you contribute new features and bug fixes. We use [Vitest](https://vitest.dev/) for unit tests and [Playwright](https://playwright.dev/) for E2E tests.

### Unit Tests

```sh
yarn test
```

### E2E Tests

Install browser binaries before the first run:

```sh
npx playwright install
```

The E2E suites live in [`tests`](../tests):

| Suite                  | Run with                                               | Notes                                               |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| `affine-local`         | `yarn workspace @nexio-test/affine-local e2e`         | Web app, no server needed                           |
| `affine-cloud`         | `yarn workspace @nexio-test/affine-cloud e2e`         | Requires the local server                           |
| `affine-desktop`       | `yarn workspace @nexio-test/affine-desktop e2e`       | Desktop (Electron) app                              |

## Linting and Type Checking

Running these checks locally saves review round trips:

```sh
# Lint & format check
yarn lint

# Auto-fix lint & format issues
yarn lint:fix

# TypeScript type check
yarn typecheck
```

## Submitting a Pull Request

1. Fork the repository and create your feature branch from **`main`**:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes and verify with `yarn lint`, `yarn typecheck`, and `yarn test`.
3. Open a PR against the `main` branch of [`https://github.com/ezeslucky/nexio`](https://github.com/ezeslucky/nexio).
4. Give the PR a title following [Conventional Commits](https://www.conventionalcommits.org/):
   ```text
   type(scope): short description

   # examples
   feat(workflow): add Slack alert trigger node
   fix(auth): persist OAuth redirect token in session
   docs: update building guide
   ```

## Troubleshooting

- **`yarn install` complains about Node/Yarn version** — check that `node -v` matches `.nvmrc` and that Corepack is enabled.
- **`EPERM: operation not permitted, symlink` on Windows** — enable Windows Developer Mode and run `git config --global core.symlinks true`.
- **Playwright can't find browsers** — run `npx playwright install`.

## Related Documents

- [developing-server.md](./developing-server.md) — run the Nexio server locally
- [building-desktop-client-app.md](./building-desktop-client-app.md) — build the desktop client
- [CONTRIBUTING.md](../CONTRIBUTING.md) — contribution guidelines
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
