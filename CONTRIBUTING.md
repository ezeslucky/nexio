# Contributing to Nexio 🚀

Thank you for your interest in contributing to **Nexio**! ❤️ We welcome contributions of all kinds — core features, bug fixes, visual workflow nodes, documentation, translations, and design improvements.

---

## 🧭 Quick Overview

Nexio is an open-source, local-first workspace and visual AI automation engine. Whether you are improving the infinite canvas, building new automation nodes for the Workflow Studio, or enhancing the GraphQL/REST backend, here is everything you need to get started.

---

## 🛠️ Contribution Flow

### 1. Find or Propose Something to Work On
- Browse open issues or discussions on the [Issue Tracker](https://github.com/ezeslucky/nexio/issues).
- Want to add a new workflow node, integration, or large feature? Please open an issue or [Discussion](https://github.com/ezeslucky/nexio/discussions) first to discuss architecture and design before diving into code.

### 2. Set Up Your Environment
- Follow the setup guide in [README.md](./README.md) or [docs/BUILDING.md](./docs/BUILDING.md).
- Quick command overview:
  ```bash
  # Install dependencies
  yarn install

  # Run backend API server (:3010)
  yarn dev:server

  # Run web application (:8080)
  yarn dev:web
  ```

### 3. Create a Feature Branch
- Create your branch off `main`:
  ```bash
  git checkout -b feat/my-new-feature
  ```
- Follow existing patterns and keep changes focused.

### 4. Code Quality & Verification
Before submitting a pull request, ensure code passes formatting, type checking, and tests:
```bash
# Lint & format code
yarn lint

# Run TypeScript checks
yarn typecheck

# Run test suites
yarn test
```

### 5. Open a Pull Request
- Push your branch to your fork and submit a PR to `main`.
- Use a [Conventional Commits](https://www.conventionalcommits.org/) title:
  - `feat(workflow): add Slack webhook integration node`
  - `fix(auth): persist OAuth redirect token in session`
  - `docs(readme): add troubleshooting section`
- Provide a clear summary and screenshots or screen recordings for UI changes.

---

## 🤝 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors. Please review our [Code of Conduct](./docs/CODE_OF_CONDUCT.md).

---

## 🔗 Useful Links & References

- **Repository**: [https://github.com/ezeslucky/nexio](https://github.com/ezeslucky/nexio)
- **Issues & Bug Reports**: [GitHub Issues](https://github.com/ezeslucky/nexio/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ezeslucky/nexio/discussions)
- **Security Inquiries**: [SECURITY.md](./SECURITY.md)
