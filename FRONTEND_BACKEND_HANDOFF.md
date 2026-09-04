# Technical Analysis & Frontend-Backend Handoff Specification

This comprehensive technical analysis and architectural handoff specification documents the existing React + TypeScript project management application frontend. It provides backend engineers, database architects, and API developers with an exact contract of the frontend's architecture, data models, routes, state flows, validation rules, and required API endpoints to enable seamless backend and database implementation while preserving 100% of the existing user interface and UX paradigms.

---

## 1. Project Overview

### 1.1 Purpose & Target Users
The application is a modern, responsive project and task management platform (work management system) designed for agile teams, project managers, tech leads, and individual contributors. It streamlines workspace collaboration, project lifecycle tracking, task execution across multiple views (Table, Kanban, Calendar), velocity analytics, team resource allocation, and real-time activity auditing.

### 1.2 Technology Stack
- **Frontend Core:** React 18+ (Functional Components & Hooks), TypeScript (Strict typing)
- **Routing:** `react-router-dom` v6 (Nested layouts, query parameter tab navigation)
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`), Redux Thunks / Slices
- **Styling & Design System:** Tailwind CSS, `shadcn/ui` primitives (Radix UI wrappers: Dialog, DropdownMenu, Tooltip, Select, Tabs, Popover, Badge, Progress, Card, Avatar)
- **Icons:** `lucide-react`
- **Date Engine:** `date-fns` (Formatting, diffing, calendar calculations)
- **Notifications:** `react-hot-toast`
- **Build Tool:** Vite

### 1.3 Architecture
The application follows a modular, feature-oriented React architecture:
- **Global Layout (`/src/pages/Layout.tsx`):** Persistent shell containing the responsive `Sidebar` (collapsible, mobile overlay with backdrop), top `Navbar` (with global search command palette and theme toggling), and dynamic `<Outlet />` viewport.
- **Global Redux Store (`/src/app/store.ts`):** Centralized state for `workspace` (workspaces list, active workspace, current user, project/task mutations) and `theme` (light/dark mode persisted in `localStorage`).
- **Page Level Components (`/src/pages/*`):** High-level view controllers handling route parameters and search query params.
- **Extracted Feature Components (`/src/components/*`):** Isolated UI components handling specific functional sub-domains (analytics, tasks table/kanban, calendar grid, project settings, member modals, subtasks, attachments, comments).

### 1.4 Implementation Status
- **Frontend UI & Interactions:** Fully built with high-density components, responsive layouts, modals, filters, tooltips, and theme switching.
- **State Persistence:** Currently initialized in memory via Redux from static mock data (`dummyWorkspaces`, `dummyUsers` in `/src/assets/assets.ts`).
- **Backend Connection:** Ready for API client integration to replace mock reducers with REST/GraphQL endpoints.

---

## 2. Complete Route Map

All routes are nested inside the root `/` path rendered by `Layout.tsx`.

| Route Path | Page Component | Query Parameters | Purpose | Role Access | Key Actions & Elements |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `Dashboard.tsx` | None | Main workspace dashboard displaying high-level portfolio KPIs, task progress analytics, recent activity feed, and quick-action summaries. | All Workspace Members | Workspace switcher, Create Project modal trigger, Create Task modal trigger, Task scope toggle (Workspace vs Mine), Task shortcut links. |
| `/projects` | `Projects.tsx` | None | Comprehensive directory/catalog of all projects in the active workspace. | All Workspace Members | Search bar, status filter dropdown, Create Project dialog trigger, project cards with progress bars, team lead badges, and navigation links. |
| `/projectsDetail` | `ProjectDetails.tsx` | `id` (Project ID, required)<br>`tab` (`overview` \| `tasks` \| `analytics` \| `calendar` \| `settings`, default: `overview`) | Multi-tab deep dive into a specific project. | All Workspace Members (Settings tab restricted to Admin/Owner/Lead) | Tab navigation, Create Task modal, Add Project Member modal, Project Settings form, Archive/Delete project, Task view switching (Table vs Kanban), Calendar scheduling. |
| `/taskDetails` | `TaskDetails.tsx` | `projectId` (Project ID, required)<br>`taskId` (Task ID, required) | Detailed task inspection and editing view. | All Workspace Members | Status selector, Priority selector, Assignee dropdown, Due date picker, Description editor, Subtask management (CRUD/Toggle), Attachment management (Upload/Download/Delete), Comment thread. |
| `/team` | `Team.tsx` | None | Workspace membership and team directory. | All Workspace Members (Invite/Role change/Remove restricted to Admin/Owner) | Search members, Invite Member dialog, Role change dropdown (`ADMIN`, `MEMBER`, `VIEWER`), Remove Member confirmation dialog, Member stats. |

---

## 3. Role System & Permission Matrix

### 3.1 Defined Roles
1. **Workspace Roles (Organization Level):**
   - `ADMIN` / `OWNER`: Full administrative control over workspace settings, membership invitations, role modifications, member removal, and all projects/tasks.
   - `MEMBER`: Standard collaborator. Can create projects, create/edit tasks, add subtasks, upload attachments, comment, and manage tasks assigned to them or their projects.
   - `VIEWER`: Read-only access. Can view dashboard, projects, tasks, analytics, and team members, but cannot modify status, delete items, or invite members.

2. **Project-Specific Roles (Contextual):**
   - **Project Owner / Team Lead (`project.team_lead` / `project.owner`):** Can manage project settings, archive/delete project, edit project metadata, and assign project members.
   - **Task Assignee (`task.assigneeId`):** Primary responsible user for task execution and status transitions.

### 3.2 Permission Matrix

| Functional Action / UI Element | Workspace `ADMIN` | Project `LEAD` / `OWNER` | Workspace `MEMBER` | Workspace `VIEWER` |
| :--- | :---: | :---: | :---: | :---: |
| **Switch Workspace** | ✅ | ✅ | ✅ | ✅ |
| **Create New Project** | ✅ | ✅ | ✅ | ❌ |
| **Edit Project Settings (Name, Dates, Lead)** | ✅ | ✅ | ❌ | ❌ |
| **Archive / Delete Project** | ✅ | ✅ | ❌ | ❌ |
| **Add Member to Project** | ✅ | ✅ | ✅ | ❌ |
| **Create Task** | ✅ | ✅ | ✅ | ❌ |
| **Edit Task Details (Status, Priority, Due Date)** | ✅ | ✅ | ✅ | ❌ |
| **Delete Task / Batch Delete Tasks** | ✅ | ✅ | ✅ (Own / Assigned) | ❌ |
| **Add / Complete / Delete Subtasks** | ✅ | ✅ | ✅ | ❌ |
| **Upload / Delete Attachments** | ✅ | ✅ | ✅ | ❌ (View/Download only) |
| **Post Comments** | ✅ | ✅ | ✅ | ❌ |
| **Delete Comments** | ✅ | ✅ | ✅ (Own comments) | ❌ |
| **Invite New Workspace Member** | ✅ | ❌ | ❌ | ❌ |
| **Change Member Role (`ADMIN`/`MEMBER`/`VIEWER`)** | ✅ | ❌ | ❌ | ❌ |
| **Remove Member from Workspace** | ✅ | ❌ | ❌ | ❌ |
| **View Analytics & Dashboards** | ✅ | ✅ | ✅ | ✅ |

---

## 4. Workspace Module

### 4.1 Data Fields & TypeScript Contract
```typescript
interface Workspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
    owner?: User;
    image_url?: string;
    membersCount?: number;
    members: WorkspaceMember[];
    projects: Project[];
    createdAt?: string;
    updatedAt?: string;
}

interface WorkspaceMember {
    id: string;
    userId: string;
    workspaceId: string;
    role: "ADMIN" | "MEMBER" | "VIEWER";
    joinedAt?: string;
    user: User;
}
```

### 4.2 Core Functionalities & UI Interactions
- **Workspace Switching (`WorkspaceDropdown.tsx`):** Located at the top of the sidebar. Displays current workspace avatar, name, and total workspace count. Clicking opens a dropdown menu listing all accessible workspaces. Selecting a workspace dispatches `setCurrentWorkspace(workspaceId)` and redirects to `/`.
- **Member Directory & Administration (`Team.tsx`):** Displays a searchable grid of workspace members with avatar, full name, email, role badge, joined date, and action triggers.
- **Invitation Flow (`InviteMemberDialog.tsx`):** Form modal requesting:
  - `email` (string, required, valid email format)
  - `role` (`ADMIN` | `MEMBER` | `VIEWER`, required, default `MEMBER`)
- **Role Elevation / Downgrade:** Role dropdown in member row allows instant role updates with toast feedback.
- **Member Removal:** Confirmation dialog to revoke member access from workspace.

---

## 5. Project Module

### 5.1 Data Fields & TypeScript Contract
```typescript
interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus; // "PLANNING" | "ACTIVE" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED"
    priority: ProjectPriority; // "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    progress?: number; // Integer percentage 0 - 100
    start_date?: string; // ISO 8601 Date String
    end_date?: string; // ISO 8601 Date String (Target Due Date)
    team_lead?: string; // User ID of team lead
    workspaceId: string;
    ownerId?: string;
    owner?: User;
    members?: ProjectMember[];
    tasks?: Task[];
    createdAt?: string;
    updatedAt?: string;
}

interface ProjectMember {
    id: string;
    userId: string;
    projectId: string;
    role?: string;
    joinedAt?: string;
    user?: User;
}
```

### 5.2 Project Tabs & Functionality (`ProjectDetails.tsx`)
1. **Overview Tab (`ProjectDetailOverview.tsx`):**
   - Top KPI cards: Timeline & Deadline (start date, target due date, overdue/near-deadline calculation), Overall Progress (percentage, completed vs total count, status breakdown), Team & Leadership (lead card, member avatars count).
   - About Card: Full description, status badge, priority badge.
   - Upcoming Deadlines list: High-priority impending tasks sorted chronologically.
   - Team Roster list: Members assigned to the project with task load count.
2. **Tasks Tab (`ProjectTasks.tsx`):**
   - View switcher: Table View vs Kanban Board View.
   - Multi-criteria filter toolbar: Search query, Status filter, Type filter, Priority filter, Assignee filter.
   - Batch selection & bulk actions: Batch status change, batch priority change, batch delete.
   - Create Task dialog trigger.
3. **Analytics Tab (`ProjectAnalytics.tsx`):**
   - Progress gauge, task completion velocity, status distribution bar charts, priority breakdown, overdue metrics, and individual member allocation workloads.
4. **Calendar Tab (`ProjectCalendar.tsx`):**
   - Monthly grid view plotting project tasks on their respective due dates with priority-coded badges and task detail click-throughs.
5. **Settings Tab (`ProjectSettings.tsx`):**
   - Edit metadata (name, description, status, priority, start date, end date, team lead).
   - Manage assigned project members (add/remove).
   - Danger zone: Archive Project, Delete Project.

---

## 6. Task Module

### 6.1 Data Fields & TypeScript Contract
```typescript
type TaskType = "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface Task {
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    start_date?: string; // ISO 8601
    due_date?: string; // ISO 8601
    projectId: string;
    assigneeId?: string;
    assignee?: User;
    subtasks?: Subtask[];
    comments?: Comment[];
    attachments?: Attachment[];
    createdAt?: string;
    updatedAt?: string;
}
```

### 6.2 Task Creation Form (`CreateTaskDialog.tsx`)
- `title`: String (required, min 1 char)
- `description`: String (optional, multiline text)
- `type`: Enum (`TASK` | `BUG` | `FEATURE` | `IMPROVEMENT` | `OTHER`, default `TASK`)
- `status`: Enum (`TODO` | `IN_PROGRESS` | `DONE`, default `TODO`)
- `priority`: Enum (`LOW` | `MEDIUM` | `HIGH`, default `MEDIUM`)
- `assigneeId`: String User ID (optional, selectable from workspace members)
- `due_date`: String ISO Date / YYYY-MM-DD (optional)

### 6.3 Task Details & Interactive Sub-Modules (`TaskDetails.tsx`)
- Quick Status Switcher (One-click toggle between `TODO`, `IN_PROGRESS`, `DONE`).
- Priority Dropdown (Color-coded indicators).
- Assignee Dropdown (Member search with avatar).
- Due Date Picker (Date format: MMM d, yyyy with overdue warnings).
- Description Editor (Interactive editable text block).
- Embedded Subtask Manager (`SubtaskList.tsx`).
- Embedded Attachment Manager (`AttachmentList.tsx`).
- Embedded Discussion Thread (`CommentList.tsx`).

---

## 7. Subtask Management

### 7.1 Data Structure
```typescript
interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    createdAt?: string;
}
```

### 7.2 Component Logic (`/src/components/task/SubtaskList.tsx`)
- **Visual Progress Bar:** Calculates `(completedSubtasks / totalSubtasks) * 100%`.
- **Toggle Completion:** Checkbox click updates `completed: !completed` in the parent task object and dispatches `updateTask`.
- **Add Subtask:** Inline input form adding `{ id, title, completed: false, createdAt: new Date().toISOString() }`.
- **Delete Subtask:** Trash icon button removing subtask by ID.

---

## 8. Comment / Discussion System

### 8.1 Data Structure
```typescript
interface Comment {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    createdAt: string;
    user?: User;
}
```

### 8.2 Component Logic (`/src/components/task/CommentList.tsx`)
- **Feed Rendering:** Chronological stream with author avatar, author name, formatted timestamp (`MMM d, h:mm a`), and multiline text content.
- **Post Comment Form:** Controlled textarea with submission trigger (`Post Comment` button or shortcut). Sets author to current user (`user_1` in mock state).
- **Delete Comment:** Hover action allowing users to delete their own comments.

---

## 9. Attachment & File Upload System

### 9.1 Data Structure
```typescript
interface Attachment {
    id: string;
    name: string;
    size: number; // File size in bytes
    type: string; // MIME type (e.g., 'image/png', 'application/pdf')
    url?: string; // Preview/Download URL
    uploadedAt: string; // ISO Date String
    uploadedBy?: {
        id: string;
        name: string;
        email: string;
    };
}
```

### 9.2 Component Logic (`/src/components/task/AttachmentList.tsx`)
- **Upload Zone:** Dual-mode upload supporting Drag-and-Drop (`onDragOver`, `onDrop`) and native file browser selection via `<input type="file" multiple />`.
- **File Type Icons:** Dynamic icon classification based on extension/MIME (`Image` for images, `FileText` for PDFs, `FileArchive` for zip/rar, `FileCode` for code files, `File` for general).
- **File Size Formatting:** Automatic conversion to `B`, `KB`, or `MB`.
- **Download Action:** Direct anchor trigger to attachment `url` or generated object blob.
- **Backend Requirement:** Backend must provide multipart form upload endpoints (`/api/tasks/:taskId/attachments`) integrated with Cloud Storage / S3 to return permanent CDN URLs and metadata.

---

## 10. Calendar View & Date Alignment Analysis

### 10.1 Date Library & Calculation Rules
- Primary library: `date-fns`.
- Date fields are stored as ISO 8601 strings (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`).
- Date formatting standard across UI: `format(date, "MMM d, yyyy")` or `format(date, "MMM d")`.

### 10.2 Calendar Alignment Bug Diagnosis & Solution
- **Observed Defect in Legacy Implementations:** The calendar grid would render only the raw days of the month (1..31) directly into a 7-column grid without leading offset padding cells. This caused the 1st of the month to always fall on Monday regardless of its real-world weekday.
- **Frontend Standard Fix in `ProjectCalendar.tsx`:**
  - Calculate `monthStart = startOfMonth(currentDate)` and `monthEnd = endOfMonth(monthStart)`.
  - Calculate grid bounds using `startDate = startOfWeek(monthStart)` and `endDate = endOfWeek(monthEnd)`.
  - Generate full days sequence using `eachDayOfInterval({ start: startDate, end: endDate })`.
  - Days where `!isSameMonth(day, monthStart)` are rendered with disabled/muted styling, ensuring Monday-Sunday headers match exact calendar days.

---

## 11. Analytics & Metrics Engine

### 11.1 Workspace Dashboard Metrics (`StatsGrid.tsx`, `TaskProgressAnalytics.tsx`)
- **Total Projects:** `currentWorkspace.projects.length`
- **Active Projects:** Projects with `status !== 'CANCELLED' && status !== 'COMPLETED'`
- **Completed Tasks:** Total tasks across all projects with `status === 'DONE'`
- **My Tasks Count:** Tasks where `assigneeId === currentUser.id`
- **Overdue Tasks Count:** Tasks where `due_date < now && status !== 'DONE'`
- **Velocity / Completion Rate:** `(doneTasks / totalTasks) * 100%`
- **Priority Breakdown:** Counts and percentages for `HIGH`, `MEDIUM`, and `LOW` priority tasks.

### 11.2 Project-Specific Analytics (`ProjectAnalytics.tsx`)
- Task Status Distribution (To Do vs In Progress vs Done).
- Task Type Distribution (Task vs Bug vs Feature vs Improvement).
- Team Workload Distribution (Tasks allocated per member, completion percentage per member).

---

## 12. Team & User Management

### 12.1 User Data Structure
```typescript
interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
}
```

### 12.2 Mock User Directory (`/src/assets/assets.ts`)
The mock dataset includes 8 predefined users:
1. `user_1` (Alex Smith - `alex@example.com`, Workspace Admin)
2. `user_2` (Sarah Connor - `sarah@example.com`, Project Lead)
3. `user_3` (Michael Scott - `michael@example.com`, Member)
4. `user_4` (Dwight Schrute - `dwight@example.com`, Member)
5. `user_5` (Jim Halpert - `jim@example.com`, Member)
6. `user_6` (Pam Beesly - `pam@example.com`, Member)
7. `user_7` (Ryan Howard - `ryan@example.com`, Member)
8. `user_8` (Kelly Kapoor - `kelly@example.com`, Member)

---

## 13. Search & Filter System

### 13.1 Global Search Palette (`Navbar.tsx`)
- **Trigger:** Click on input or global keyboard shortcut (`Cmd+K` / `Ctrl+K`).
- **Scope:** Real-time dual-group search querying:
  - Projects: Matches `name` or `description`.
  - Tasks: Matches `title` or `description`.
- **Keyboard Navigation:** `Escape` closes results; clicking a result routes directly to the project or task.

### 13.2 Task List Filtering (`ProjectTasks.tsx`)
- **Search Term:** Substring match on task `title` or `description`.
- **Status Filter:** Multiselect or single select (`ALL`, `TODO`, `IN_PROGRESS`, `DONE`).
- **Type Filter:** (`ALL`, `TASK`, `BUG`, `FEATURE`, `IMPROVEMENT`, `OTHER`).
- **Priority Filter:** (`ALL`, `HIGH`, `MEDIUM`, `LOW`).
- **Assignee Filter:** Select by specific user ID.

---

## 14. State Management & Redux Store

### 14.1 Store Slices (`/src/app/store.ts`)
```typescript
export const store = configureStore({
    reducer: {
        workspace: workspaceReducer,
        theme: themeReducer,
    },
});
```

### 14.2 Workspace Slice Actions (`/src/features/workspaceSlice.ts`)
- `setCurrentWorkspace(workspaceId: string)`: Activates selected workspace.
- `addProject(project: Project)`: Inserts newly created project into active workspace.
- `updateProject(project: Project)`: Updates project details.
- `deleteProject(projectId: string)`: Removes project from workspace.
- `addTask(task: Task)`: Appends task to target project.
- `updateTask(task: Task)`: Modifies task properties (status, priority, assignee, subtasks, comments, attachments).
- `deleteTask({ projectId, taskId })`: Deletes task.
- `addWorkspaceMember({ workspaceId, member })`: Appends invited member.
- `updateWorkspaceMemberRole({ workspaceId, userId, role })`: Updates role.
- `removeWorkspaceMember({ workspaceId, userId })`: Removes member.

---

## 15. Complete TypeScript Interfaces Reference

```typescript
// /src/types/index.ts

export type ProjectStatus = "PLANNING" | "ACTIVE" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskType = "TASK" | "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type WorkspaceRole = "ADMIN" | "MEMBER" | "VIEWER";

export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: string;
}

export interface WorkspaceMember {
    id: string;
    userId: string;
    workspaceId: string;
    role: WorkspaceRole;
    joinedAt?: string;
    user: User;
}

export interface ProjectMember {
    id: string;
    userId: string;
    projectId: string;
    role?: string;
    joinedAt?: string;
    user?: User;
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    createdAt?: string;
}

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    createdAt: string;
    user?: User;
}

export interface Attachment {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    uploadedAt: string;
    uploadedBy?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    type: TaskType;
    status: TaskStatus;
    priority: TaskPriority;
    start_date?: string;
    due_date?: string;
    projectId: string;
    assigneeId?: string;
    assignee?: User;
    subtasks?: Subtask[];
    comments?: Comment[];
    attachments?: Attachment[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    progress?: number;
    start_date?: string;
    end_date?: string;
    team_lead?: string;
    workspaceId: string;
    ownerId?: string;
    owner?: User;
    members?: ProjectMember[];
    tasks?: Task[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
    owner?: User;
    image_url?: string;
    membersCount?: number;
    members: WorkspaceMember[];
    projects: Project[];
    createdAt?: string;
    updatedAt?: string;
}
```

---

## 16. Mock Data Analysis & Database Mapping

### 16.1 Existing Mock Workspaces in `/src/assets/assets.ts`
1. **Workspace 1: `wspace_1` ("Acme Corporation")**
   - Contains 3 projects:
     - `proj_1` ("Website Redesign", In Progress, High Priority, 4 tasks: `task_1`, `task_2`, `task_3`, `task_4`)
     - `proj_2` ("Mobile App MVP", Active, Urgent Priority, 3 tasks: `task_5`, `task_6`, `task_7`)
     - `proj_3` ("Internal Analytics Dashboard", Planning, Medium Priority, 2 tasks: `task_8`, `task_9`)
   - Members: Alex Smith (Admin), Sarah Connor (Member), Michael Scott (Member), Dwight Schrute (Member).
2. **Workspace 2: `wspace_2` ("Stark Industries")**
   - Contains 2 projects: "Arc Reactor Optimization" and "Mark 85 Telemetry".

### 16.2 Entity Relationship Diagram (Conceptual)
- `users` (1) ───< `workspace_members` >─── (N) `workspaces`
- `workspaces` (1) ───< `projects` (N)
- `projects` (1) ───< `project_members` >─── (N) `users`
- `projects` (1) ───< `tasks` (N)
- `tasks` (1) ───< `subtasks` (N)
- `tasks` (1) ───< `comments` (N)
- `tasks` (1) ───< `attachments` (N)

---

## 17. RESTful API Specification & Endpoints

All endpoints expect `Authorization: Bearer <JWT_TOKEN>` and `X-Workspace-Id: <WORKSPACE_ID>` headers where applicable.

### 17.1 Workspaces API
- `GET /api/workspaces`
  - Returns: `Workspace[]` (User's accessible workspaces)
- `GET /api/workspaces/:workspaceId`
  - Returns: `Workspace` (Full workspace with populated projects & members)
- `POST /api/workspaces`
  - Body: `{ name: string, description?: string }`
  - Returns: `Workspace`
- `PUT /api/workspaces/:workspaceId`
  - Body: `{ name?: string, description?: string, image_url?: string }`
  - Returns: `Workspace`
- `POST /api/workspaces/:workspaceId/members/invite`
  - Body: `{ email: string, role: "ADMIN" | "MEMBER" | "VIEWER" }`
  - Returns: `WorkspaceMember`
- `PATCH /api/workspaces/:workspaceId/members/:userId`
  - Body: `{ role: "ADMIN" | "MEMBER" | "VIEWER" }`
  - Returns: `WorkspaceMember`
- `DELETE /api/workspaces/:workspaceId/members/:userId`
  - Returns: `{ success: true, message: "Member removed" }`

### 17.2 Projects API
- `GET /api/workspaces/:workspaceId/projects`
  - Query: `status?`, `search?`
  - Returns: `Project[]`
- `GET /api/projects/:projectId`
  - Returns: `Project` (Populated with members, tasks, subtasks)
- `POST /api/workspaces/:workspaceId/projects`
  - Body: `{ name: string, description?: string, status: ProjectStatus, priority: ProjectPriority, start_date?: string, end_date?: string, team_lead?: string }`
  - Returns: `Project`
- `PUT /api/projects/:projectId`
  - Body: Partial `<Project>`
  - Returns: `Project`
- `DELETE /api/projects/:projectId`
  - Returns: `{ success: true, message: "Project deleted" }`
- `POST /api/projects/:projectId/members`
  - Body: `{ userId: string }`
  - Returns: `ProjectMember`
- `DELETE /api/projects/:projectId/members/:userId`
  - Returns: `{ success: true, message: "Project member removed" }`

### 17.3 Tasks API
- `GET /api/projects/:projectId/tasks`
  - Query: `status?`, `priority?`, `type?`, `assigneeId?`, `search?`
  - Returns: `Task[]`
- `GET /api/tasks/:taskId`
  - Returns: `Task` (With subtasks, comments, attachments)
- `POST /api/projects/:projectId/tasks`
  - Body: `{ title: string, description?: string, type: TaskType, status: TaskStatus, priority: TaskPriority, start_date?: string, due_date?: string, assigneeId?: string }`
  - Returns: `Task`
- `PUT /api/tasks/:taskId`
  - Body: Partial `<Task>`
  - Returns: `Task`
- `DELETE /api/tasks/:taskId`
  - Returns: `{ success: true, message: "Task deleted" }`
- `POST /api/tasks/bulk-update`
  - Body: `{ taskIds: string[], status?: TaskStatus, priority?: TaskPriority }`
  - Returns: `{ success: true, updatedCount: number }`
- `POST /api/tasks/bulk-delete`
  - Body: `{ taskIds: string[] }`
  - Returns: `{ success: true, deletedCount: number }`

### 17.4 Subtasks, Comments & Attachments API
- `POST /api/tasks/:taskId/subtasks`
  - Body: `{ title: string }`
  - Returns: `Subtask`
- `PATCH /api/tasks/:taskId/subtasks/:subtaskId`
  - Body: `{ title?: string, completed?: boolean }`
  - Returns: `Subtask`
- `DELETE /api/tasks/:taskId/subtasks/:subtaskId`
  - Returns: `{ success: true }`
- `POST /api/tasks/:taskId/comments`
  - Body: `{ content: string }`
  - Returns: `Comment`
- `DELETE /api/tasks/:taskId/comments/:commentId`
  - Returns: `{ success: true }`
- `POST /api/tasks/:taskId/attachments`
  - Body: Multipart Form Data (`files: File[]`)
  - Returns: `Attachment[]`
- `DELETE /api/tasks/:taskId/attachments/:attachmentId`
  - Returns: `{ success: true }`

---

## 18. Form & Validation Analysis

| Form Dialog / View | Field | Type & Requirements | Frontend UI Feedback |
| :--- | :--- | :--- | :--- |
| **Create Project Dialog** | `name` | String (Required, trimmed, min 2 chars) | Red outline / toast on empty submit |
| | `description` | String (Optional) | Textarea |
| | `status` | Enum (`PLANNING`, `ACTIVE`, etc.) | Select dropdown |
| | `priority` | Enum (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) | Select dropdown |
| | `start_date` | Date string (Optional) | HTML5 Date Picker |
| | `end_date` | Date string (Optional, must be >= start_date) | HTML5 Date Picker |
| | `team_lead` | User ID string (Optional) | Select dropdown of members |
| **Create Task Dialog** | `title` | String (Required, trimmed, min 1 char) | Button disabled if empty |
| | `description` | String (Optional) | Textarea |
| | `type` | Enum (`TASK`, `BUG`, `FEATURE`, etc.) | Select dropdown |
| | `status` | Enum (`TODO`, `IN_PROGRESS`, `DONE`) | Select dropdown |
| | `priority` | Enum (`LOW`, `MEDIUM`, `HIGH`) | Select dropdown |
| | `due_date` | Date string (Optional) | HTML5 Date Picker |
| | `assigneeId` | User ID string (Optional) | Select dropdown |
| **Invite Member Dialog** | `email` | String (Required, Regex email validation) | Toast error if invalid |
| | `role` | Enum (`ADMIN`, `MEMBER`, `VIEWER`) | Select dropdown |
| **Subtask Form** | `title` | String (Required, trimmed) | Add button disabled if empty |
| **Comment Form** | `content` | String (Required, trimmed) | Post button disabled if empty |

---

## 19. Authentication, Authorization & Session Management

### 19.1 Current State vs Production Backend Architecture
- **Frontend Current State:** Assumes an authenticated session with active user `user_1` ("Alex Smith").
- **Backend Requirements:**
  - **Auth Methods:** Email/Password, Magic Link, or OAuth (Google, GitHub).
  - **Token Handling:** Secure HTTP-only cookies or Bearer JWT token in headers.
  - **Tenant Resolution:** The backend must resolve tenant/workspace permissions using `workspaceId` extracted from request route params or `X-Workspace-Id` header and ensure the user possesses a valid `WorkspaceMember` record.
  - **RBAC Middleware:** Backend routes for invitations, project deletions, and member role changes must enforce `ADMIN` role checks at the workspace level.

---

## 20. Notifications & Real-Time Activity Feed

### 20.1 Client Notifications (`react-hot-toast`)
- Success toasts on all mutating actions (e.g., "Project created", "Task status updated", "Comment added", "Member invited").
- Error toasts on failed operations or validation violations.

### 20.2 Audit Log / Recent Activity (`RecentActivity.tsx`)
- Displays real-time event log:
  - Task type icon (Bug, Feature, Task, Improvement)
  - Task title & status badge
  - Assignee avatar
  - Relative updated timestamp (`format(updatedAt, "MMM d, h:mm a")`)
- **Backend Requirement:** An audit log table/event bus tracking task creation, status transitions, comments, and member additions.

---

## 21. Database Schema & Relational Design

Recommended PostgreSQL DDL Schema for Relational Databases:

```sql
-- 1. Users Table
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Workspaces Table
CREATE TABLE workspaces (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Workspace Members Table
CREATE TYPE workspace_role AS ENUM ('ADMIN', 'MEMBER', 'VIEWER');

CREATE TABLE workspace_members (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role workspace_role DEFAULT 'MEMBER' NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, user_id)
);

-- 4. Projects Table
CREATE TYPE project_status AS ENUM ('PLANNING', 'ACTIVE', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE project_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TABLE projects (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    team_lead VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'PLANNING' NOT NULL,
    priority project_priority DEFAULT 'MEDIUM' NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Project Members Table
CREATE TABLE project_members (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(64) DEFAULT 'MEMBER',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (project_id, user_id)
);

-- 6. Tasks Table
CREATE TYPE task_type AS ENUM ('TASK', 'BUG', 'FEATURE', 'IMPROVEMENT', 'OTHER');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE tasks (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type task_type DEFAULT 'TASK' NOT NULL,
    status task_status DEFAULT 'TODO' NOT NULL,
    priority task_priority DEFAULT 'MEDIUM' NOT NULL,
    start_date DATE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Subtasks Table
CREATE TABLE subtasks (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Comments Table
CREATE TABLE comments (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Attachments Table
CREATE TABLE attachments (
    id VARCHAR(64) PRIMARY KEY,
    task_id VARCHAR(64) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    size INTEGER NOT NULL,
    type VARCHAR(128) NOT NULL,
    url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for High Performance Queries
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_comments_task ON comments(task_id);
CREATE INDEX idx_attachments_task ON attachments(task_id);
```

---

## 22. Gap Analysis & Backend Implementation Roadmap

### 22.1 Identified Gaps & Alignment Considerations
1. **Dynamic Task Progress Calculation:** In the mock state, `project.progress` is partly stored statically and partly calculated from `completedTasks / totalTasks`. The backend should automatically compute and return `progress` on project queries or maintain an updated integer via database triggers.
2. **File Storage:** Frontend generates local blob URLs for temporary preview. The backend must provide a persistent file upload route (`/api/upload`) returning permanent S3/GCS bucket URLs.
3. **Workspace Deletion & Cascade:** Frontend deletes projects locally; database must enforce `ON DELETE CASCADE` across tasks, subtasks, comments, and attachments to prevent orphaned records.

### 22.2 Phased Implementation Priority

```
Phase 1: Foundation & Auth
  ├── Provision PostgreSQL / Cloud SQL Database
  ├── Run DDL Schema Migration (Users, Workspaces, Projects, Tasks)
  └── Implement JWT / Session Authentication & Workspace Context Middleware

Phase 2: Core Workspace & Project APIs
  ├── Workspace CRUD & Membership Invitation Endpoints
  ├── Project CRUD & Project Membership Endpoints
  └── Seed Initial Organization & Sample Project Data

Phase 3: Task Execution Engine
  ├── Task CRUD with Multi-field Filtering & Pagination
  ├── Bulk Task Actions (Status/Priority updates, Bulk Delete)
  └── Subtasks, Comments & File Attachment Upload APIs (S3/Cloud Storage)

Phase 4: Frontend API Client Binding
  ├── Replace Redux mock reducers with RTK Query or Axios Thunks
  ├── Connect Search, Filter, and Analytics endpoints to live data
  └── Implement real-time WebSockets / SSE for Collaborative Activity Feed
```

---
*End of Technical Specification and Frontend-Backend Contract.*
