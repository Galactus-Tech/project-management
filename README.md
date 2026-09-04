<div align="center">
  <h1><img src="https://project-management-gs.vercel.app/favicon.ico" width="20" height="20" alt="project-management Favicon">
   project-management</h1>
  <p>
    An open-source, responsive project and task management platform built with React 19, TypeScript, and Tailwind CSS.
  </p>
  <p>
    <a href="https://github.com/GreatStackDev/project-management/blob/main/LICENSE.md"><img src="https://img.shields.io/github/license/GreatStackDev/project-management?style=for-the-badge" alt="License"></a>
    <a href="https://github.com/GreatStackDev/project-management/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome"></a>
    <a href="https://github.com/GreatStackDev/project-management/issues"><img src="https://img.shields.io/github/issues/GreatStackDev/project-management?style=for-the-badge" alt="GitHub issues"></a>
  </p>
</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📜 Available Scripts](#-available-scripts)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## ✨ Features <a name="-features"></a>

- **Multiple Workspaces:** Switch seamlessly between workspaces, each with its own isolated projects, tasks, and member rosters.
- **Project Deep-Dive:** Comprehensive project oversight with dedicated tabs for Overview, Tasks (Table & Kanban), Velocity Analytics, Calendar, and Settings.
- **Task Management:** Interactive task workflows featuring status pipelines, priority levels, assignee management, and batch operations.
- **Subtasks & Discussions:** Track granular task progress with interactive subtask checklists, comment threads, and drag-and-drop file attachments.
- **Calendar View:** Monthly scheduling grid with weekday alignment and task deadline tracking.
- **Global Command Search:** Instant search palette (Cmd/Ctrl + K) to query projects and tasks across the entire workspace.
- **Dark & Light Modes:** Built-in theme switcher with zinc-neutral color schemes.
- **Team & Role Administration:** Workspace member directory with role-based access control (`ADMIN`, `MEMBER`, `VIEWER`) and invitation management.

---

## 🛠️ Tech Stack <a name="-tech-stack"></a>

- **Language:** TypeScript 5+
- **Framework & Routing:** React 19, React Router v7
- **Bundler & Dev Server:** Vite 7
- **Styling:** Tailwind CSS v4
- **UI Components:** `shadcn/ui` (Radix UI primitives)
- **Icons:** `lucide-react`
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Date Management:** `date-fns` v4
- **Notifications:** `react-hot-toast`
- **Charts:** `recharts`

---

## 🚀 Getting Started <a name="-getting-started"></a>

### Prerequisites
- Node.js 18+
- npm (recommended) or bun/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the local development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts <a name="-available-scripts"></a>

- `npm run dev`: Starts the local development server at `http://0.0.0.0:3000`.
- `npm run build`: Compiles TypeScript and builds the production bundle in `dist/`.
- `npm run lint`: Runs ESLint across all codebase files.
- `npm run preview`: Locally previews the production build.

---

## 📚 Documentation <a name="-documentation"></a>

- **[AGENTS.md](./AGENTS.md):** Architectural patterns, state conventions, and coding guidelines for contributors and AI coding assistants.
- **[FRONTEND_BACKEND_HANDOFF.md](./FRONTEND_BACKEND_HANDOFF.md):** Comprehensive technical analysis, API endpoint specifications, and PostgreSQL database schemas.
- **[DESIGN.md](./DESIGN.md):** Design system, typography, and UX layout guidelines.

---

## 🤝 Contributing <a name="-contributing"></a>

We welcome contributions! Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for details on submitting issues and pull requests.

---

## 📜 License <a name="-license"></a>

This project is licensed under the MIT License. See the [LICENSE.md](./LICENSE.md) file for details.
