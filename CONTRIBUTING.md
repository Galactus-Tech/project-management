# Contributing to Project Management

Thank you for considering contributing to **Project Management**!
We welcome contributions from everyone, whether it's fixing a bug, adding a new feature, improving accessibility, or optimizing the codebase.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Coding & Styling Standards](#coding--styling-standards)
- [Quality Assurance & Testing](#quality-assurance--testing)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues & Feature Requests](#reporting-issues--feature-requests)
- [Contribution Opportunities](#contribution-opportunities)

---

## Code of Conduct

Please review and adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) in all community interactions, issue discussions, and pull requests.

---

## Development Setup

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **Package Manager:** `npm` (recommended), `bun`, `pnpm`, or `yarn`

### Local Setup Steps

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/<your-username>/project-management.git
   cd project-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

4. **Available Scripts:**
   - `npm run dev`: Starts the Vite dev server (`0.0.0.0:3000`).
   - `npm run build`: Compiles TypeScript and builds the production bundle in `dist/`.
   - `npm run lint`: Executes ESLint across all `.ts` and `.tsx` source files.
   - `npm run preview`: Locally serves the compiled production build.

---

## Branching Strategy

Create focused branches off the latest `main` branch using descriptive prefix conventions:

- `feature/<feature-name>`: New functionality or UI components (e.g., `feature/kanban-drag-drop`)
- `fix/<bug-name>`: Bug fixes and visual corrections (e.g., `fix/calendar-alignment`)
- `refactor/<scope>`: Code restructuring without functional changes (e.g., `refactor/task-details-subcomponents`)
- `docs/<subject>`: Documentation updates (e.g., `docs/update-api-contract`)
- `chore/<task>`: Maintenance or dependency tasks (e.g., `chore/bump-dependencies`)

---

## Coding & Styling Standards

### 1. TypeScript & React
- Write strict, type-safe **TypeScript** (`.tsx` for components, `.ts` for utilities/types/slices).
- Avoid `any` types wherever possible. Maintain shared interfaces in `src/types/index.ts`.
- Prefer functional components with React Hooks.
- Use named imports for all libraries (e.g., `import { format } from "date-fns"`).

### 2. State Management (Redux Toolkit)
- Use typed hooks (`useAppDispatch`, `useAppSelector` from `@/app/store`) rather than standard Redux hooks.
- Keep domain entities (workspaces, projects, tasks) in `src/features/workspaceSlice.ts`.
- Use local React state (`useState`) for transient UI interactions (modal open/close states, input drafts).

### 3. Styling & Design System
- Use **Tailwind CSS v4** utility classes directly in the `className` attribute. Do not create supplementary `.css` files.
- Use `shadcn/ui` components located in `src/components/ui` (built on Radix UI headless primitives).
- Import all visual icons exclusively from `lucide-react`.
- Maintain dual-theme support using Tailwind dark mode classes (`dark:...`).

### 4. Accessibility & Responsiveness
- Ensure interactive elements include appropriate `aria-label`, `role`, and `aria-expanded` attributes.
- Maintain minimum touch target heights/widths of 44px on mobile viewports.
- Ensure proper color contrast ratios for text and status badges.

---

## Quality Assurance & Testing

Before submitting your changes, verify that the project builds cleanly and passes linting checks:

1. **Lint Check:**
   ```bash
   npm run lint
   ```
   Ensure there are zero ESLint errors or unhandled warnings.

2. **Build Compilation:**
   ```bash
   npm run build
   ```
   Ensure Vite compiles without any TypeScript typing or bundling errors.

*Note: Automated unit/integration test suites (e.g., Vitest) are not yet configured. Contributors are encouraged to manually test all affected flows (switching workspaces, task CRUD, filter/search interactions) across desktop and mobile screen sizes.*

---

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<optional scope>): <description>

[optional body]
```

### Types:
- `feat`: A new user-facing feature or component
- `fix`: A bug fix or visual correction
- `refactor`: Code refactoring that neither fixes a bug nor adds a feature
- `docs`: Documentation changes only
- `style`: Formatting, spacing, or lint corrections
- `perf`: Performance improvements
- `chore`: Maintenance tasks, config changes, or dependency updates

### Examples:
- `feat(tasks): implement batch status updates in table view`
- `fix(calendar): correct weekday alignment offset in monthly grid`
- `docs(readme): update development server instructions`

---

## Pull Request Process

1. **Keep PRs Focused:** Submit isolated pull requests addressing a single feature or bug fix.
2. **Sync with Main:** Rebase or merge the latest `main` branch before submitting.
3. **Verify Locally:** Confirm that `npm run lint` and `npm run build` pass with zero errors.
4. **Provide a Clear Description:**
   - Summarize what was changed and why.
   - Include screenshots or screen recordings for visual UI changes.
   - Reference any related issues (e.g., `Closes #42`).
5. **Review Feedback:** Respond promptly to code review suggestions and push updates to your branch.

---

## Reporting Issues & Feature Requests

### Reporting Bugs
Before filing an issue, check existing open issues to avoid duplicates. When opening a bug report, include:
- A clear, descriptive title.
- Step-by-step reproduction instructions.
- Expected vs. actual behavior.
- Screenshots, console error logs, and browser/device details.

### Suggesting Features & Enhancements
For substantial features or architectural proposals:
- Open a feature request issue or discussion before starting implementation.
- Outline the user problem, proposed UI changes, and data model implications.

---

## Contribution Opportunities

Looking for a place to start? Here are key areas open for enhancement:

- **Backend Integration:** Connecting Redux actions to live REST/GraphQL APIs (refer to [FRONTEND_BACKEND_HANDOFF.md](./FRONTEND_BACKEND_HANDOFF.md)).
- **Automated Testing:** Setting up Vitest and React Testing Library for component and slice tests.
- **Drag-and-Drop:** Implementing drag-and-drop card movements on the Kanban board.
- **Data Exporting:** Adding CSV/JSON export capabilities for project tasks and reports.
- **Keyboard Shortcuts:** Expanding hotkeys for modal triggers and task navigation.
