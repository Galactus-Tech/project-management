# AI Coding Agent Guidelines & Repository Guide (`AGENTS.md`)

This file provides context, architectural guidelines, development workflows, and coding conventions for AI agents and human contributors working on the **Project Management** codebase.

---

## 1. Project Overview & Architecture

### 1.1 Purpose & Domain
**Project Management** is a high-density, responsive, client-side project and task management web application. It offers multi-workspace management, project lifecycle oversight, task organization across multiple views (Table, Kanban, Calendar), velocity analytics, team rosters, subtasks, discussions, and file attachments.

### 1.2 Technology Stack
- **Language:** TypeScript 5+ (Strict typing, JSX in `.tsx`, configuration in `.ts`/`.js`)
- **UI Library & Framework:** React 19 (Functional components, custom hooks, React Router v7)
- **Build Tool & Bundler:** Vite 7 with `@vitejs/plugin-react`
- **Styling Engine:** Tailwind CSS v4 (`@tailwindcss/vite`, `@import "tailwindcss";` in `src/index.css`)
- **UI Primitives:** `shadcn/ui` (New York style, Radix UI headless components) located in `src/components/ui`
- **Icons:** `lucide-react` (All icons must be imported from `lucide-react`)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Date Management:** `date-fns` v4
- **Notifications / Toasts:** `react-hot-toast`
- **Data Visualization / Charts:** `recharts`
- **Package Manager:** `npm` (Lockfile: `bun.lock` also present in root)

---

## 2. Repository & Directory Structure

```
.
├── FRONTEND_BACKEND_HANDOFF.md # Complete technical backend & database specification
├── CONTRIBUTING.md             # Open-source contribution guide
├── CODE_OF_CONDUCT.md          # Community conduct standards
├── DESIGN.md                   # UI/UX design specifications
├── LICENSE.md                  # MIT License
├── README.md                   # Project intro & setup guide
├── components.json             # shadcn/ui configuration
├── eslint.config.js            # ESLint 9 flat configuration
├── index.html                  # Main HTML entry point & SEO metadata
├── metadata.json               # Application metadata & permissions
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundler, alias (@/*), and dev server config
├── public/                     # Static assets (favicons, SVGs, static illustrations)
└── src/
    ├── main.tsx                # Application bootstrap entry point
    ├── App.tsx                 # Route declarations & RouterProvider setup
    ├── index.css               # Global stylesheet with Tailwind CSS v4 import
    ├── app/
    │   └── store.ts            # Redux store configuration & typed hooks (useAppDispatch, useAppSelector)
    ├── assets/
    │   └── assets.ts           # Mock datasets (dummyWorkspaces, dummyUsers) & static image references
    ├── components/             # Reusable & feature-specific components
    │   ├── ui/                 # shadcn/ui base components (button, card, dialog, dropdown-menu, etc.)
    │   ├── dashboard/          # Dashboard analytics & summary widgets
    │   ├── task/               # Task detail subcomponents (SubtaskList, AttachmentList, CommentList)
    │   ├── Navbar.tsx          # Top navigation bar with global search (Cmd+K) & theme toggle
    │   ├── Sidebar.tsx         # Responsive collapsible sidebar navigation
    │   ├── ProjectsSidebar.tsx # Collapsible project tree in sidebar
    │   ├── MyTasksSidebar.tsx  # User assigned tasks sidebar accordion
    │   ├── WorkspaceDropdown.tsx # Active workspace selector dropdown
    │   ├── StatsGrid.tsx       # KPI metrics grid
    │   ├── TasksSummary.tsx    # Actionable task buckets (Assigned, Overdue, In Progress)
    │   ├── RecentActivity.tsx  # Audit / activity feed
    │   ├── ProjectCalendar.tsx # Monthly calendar grid view
    │   ├── ProjectTasks.tsx    # Table & Kanban task views with filter toolbar
    │   ├── ProjectAnalytics.tsx# Project metrics & team workload allocation
    │   ├── ProjectSettings.tsx # Project metadata & deletion/archive controls
    │   ├── ProjectDetailOverview.tsx # Project summary overview tab
    │   ├── CreateProjectDialog.tsx   # Modal to create a project
    │   ├── CreateTaskDialog.tsx      # Modal to create a task
    │   ├── InviteMemberDialog.tsx    # Modal to invite a workspace member
    │   └── AddProjectMember.tsx      # Modal to assign workspace member to a project
    ├── features/
    │   ├── workspaceSlice.ts   # Redux slice for workspaces, projects, tasks, members CRUD
    │   └── themeSlice.ts       # Redux slice for dark/light theme management
    ├── lib/
    │   └── utils.ts            # Class merging utility (clsx + tailwind-merge = cn)
    ├── pages/
    │   ├── Layout.tsx          # App shell (Sidebar + Navbar + Outlet)
    │   ├── Dashboard.tsx       # Workspace overview dashboard (Route: /)
    │   ├── Projects.tsx        # Projects directory (Route: /projects)
    │   ├── ProjectDetails.tsx  # Project deep-dive with tabs (Route: /projectsDetail?id=...&tab=...)
    │   ├── TaskDetails.tsx     # Task inspection view (Route: /taskDetails?projectId=...&taskId=...)
    │   └── Team.tsx            # Team roster & member administration (Route: /team)
    └── types/
        └── index.ts            # TypeScript interfaces & domain entity types
```

---

## 3. Development Commands

The following scripts are defined in `package.json`:

| Command | Action | Notes |
| :--- | :--- | :--- |
| `npm run dev` | Starts Vite local development server | Binds to `0.0.0.0:3000` for container & cloud environments |
| `npm run build` | Compiles the production build | Runs `vite build`, outputting static bundle to `dist/` |
| `npm run lint` | Runs ESLint 9 flat config across all files | Checks syntax, unused variables, and React hooks rules |
| `npm run preview` | Serves the production build locally | Runs `vite preview` |

*Note: There are currently no pre-configured test commands (e.g., `npm test`). See Section 4.*

---

## 4. Testing Strategy & Quality Assurance

- **Current Implementation Status:** **No automated test runner is currently configured** (marked as *Uncertain / Not yet implemented* in the existing repo).
- **Validation Pipeline:**
  1. **Static Type Safety:** TypeScript compiler (`tsc` via Vite build).
  2. **Code Linting:** ESLint (`npm run lint`).
  3. **Build Compilation:** `npm run build` to verify clean module resolution and asset generation.
- **Recommended Future Testing Stack:**
  - **Unit & Component Testing:** Vitest + React Testing Library (`@testing-library/react`)
  - **End-to-End Testing:** Playwright or Cypress for multi-tab workspace, project, and task flows.

---

## 5. Coding & Formatting Standards

### 5.1 Language & TypeScript Rules
- Always use **TypeScript** with explicit typings. Avoid using `any` unless strictly necessary for third-party interop.
- Maintain type definitions in `src/types/index.ts` for all shared entities (`Workspace`, `Project`, `Task`, `Subtask`, `Comment`, `Attachment`, `User`, `WorkspaceMember`, `ProjectMember`).
- Use standard TypeScript `enum` declarations or string union types (`type ProjectStatus = ...`).
- Put all `import` statements at the top level of the module.
- Use named imports (e.g., `import { format } from "date-fns"`).

### 5.2 Styling & UI Guidelines
- **Tailwind CSS Only:** Use Tailwind utility classes directly in `className`.
- **No Custom/External CSS Files:** Do not create supplementary `.css` or `.module.css` files. All styles must flow through Tailwind CSS.
- **Component Primitives:** Use `shadcn/ui` components from `@/components/ui/*` (Button, Card, Dialog, DropdownMenu, Badge, Progress, Input, Textarea, Tooltip, Select, Avatar).
- **Icons:** All icons must be imported from `lucide-react`. Never craft custom raw SVG icons when Lucide icons exist.
- **Color Consistency:** Maintain the Zinc-based palette (`zinc-50` through `zinc-950`) supporting both light mode and dark mode classes (`dark:...`).
- **Accessibility:**
  - Provide `aria-label`, `role`, and `aria-expanded` attributes on interactive elements.
  - Ensure minimum touch target size of 44px on mobile/tablet viewports.
  - Maintain sufficient contrast ratios for text and badges.

### 5.3 State Management & Hooks Rules
- **Global State vs Local State:**
  - Use Redux Toolkit (`workspaceSlice.ts`) for cross-cutting workspace data, active project updates, and task mutations.
  - Use local component state (`useState`) for transient UI states (modals open/close, search queries, active filter selections, form inputs).
- **Custom Typed Hooks:** Always use `useAppDispatch()` and `useAppSelector()` from `@/app/store` instead of plain Redux hooks.
- **React 19 & Hook Rules:**
  - Avoid infinite re-renders by not mutating state in component bodies.
  - Avoid putting unstable arrays or non-memoized objects directly into `useEffect` dependency arrays.
  - Always clean up event listeners (`keydown`, `mousedown`) in `useEffect` return functions.

### 5.4 Calendar & Date Formatting
- Date strings must be ISO-compliant (`YYYY-MM-DD` or ISO 8601).
- In calendar grids (`ProjectCalendar.tsx`), always calculate month boundaries with `startOfWeek(startOfMonth(date))` and `endOfWeek(endOfMonth(date))` using `date-fns` to guarantee accurate Monday–Sunday weekday alignment.

---

## 6. Contribution & Git Conventions

### 6.1 Branch Naming
- `feature/<feature-name>` for new features (e.g., `feature/kanban-drag-drop`)
- `fix/<bug-name>` for bug fixes (e.g., `fix/calendar-alignment`)
- `refactor/<scope>` for code restructuring without behavioral changes
- `docs/<subject>` for documentation updates

### 6.2 Commit Message Standard
Follow Conventional Commits:
- `feat: add task batch deletion capability`
- `fix: correct weekday offset in calendar view`
- `refactor: extract subtask list into dedicated component`
- `docs: update backend API contract in FRONTEND_BACKEND_HANDOFF.md`

### 6.3 Pull Request Workflow
1. Create a focused branch with isolated changes.
2. Run `npm run lint` and `npm run build` locally to ensure zero build errors or lint violations.
3. Submit a Pull Request targeting `main` with a clear description of visual and functional changes.

---

## 7. Instructions for AI Agents Working on this Repo

1. **Respect Existing UI & Architecture:** Do not arbitrarily rename entity fields, rewrite the Redux store structure, or remove existing views.
2. **Modular File Structure:** Keep components modular and concise. If adding new features to complex views (e.g., `ProjectDetails.tsx`), extract sub-components into `@/components/*`.
3. **Verify Changes:** Always run `lint_applet` and `compile_applet` after modifying code to verify that the app compiles and passes all checks.
4. **Refer to Technical Contracts:** Consult `FRONTEND_BACKEND_HANDOFF.md` for exact data contracts, API endpoints, role permissions, and database schemas when integrating with backend services.
