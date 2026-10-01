# Nexio Codebase Tutorial 🧭

## Introduction

This tutorial walks you through the codebase of Nexio. It is intended for new contributors and developers extending Nexio.

## Building the Project

Make sure you know how to build the project. See [BUILDING](../BUILDING.md) and [README.md](../../README.md) for more information.

## Codebase Overview

The codebase is organized as a monorepo:

- `packages/` contains all code running in production:
  - `backend/` contains backend code, GraphQL API, authentication, and persistence services.
  - `frontend/` contains frontend code, including the web app, Electron desktop app, UI components, and the **AI Workflow Studio** (`packages/frontend/core/src/desktop/pages/workspace/workflow/`).
  - `common/` contains isomorphic utilities and shared protocols.
- `canvas/` contains the infinite canvas block and document framework.
- `tools/` contains developer tools, build runners (`tools/cli` / `yarn nexio`), and code generators.
- `tests/` contains test suites across different libraries, including E2E and unit testing.

## Development & Debugging

```shell
# Run backend server
yarn dev:server

# Run web frontend
yarn dev:web
```
