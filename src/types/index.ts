export type WorkspaceRole = 'ADMIN' | 'MEMBER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type TaskType = 'TASK' | 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'OTHER';

export type ProjectStatus = 'ACTIVE' | 'PLANNING' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface WorkspaceMember {
    id: string;
    userId: string;
    workspaceId: string;
    message?: string;
    role: WorkspaceRole;
    user: User;
}

export interface ProjectMember {
    id: string;
    userId: string;
    projectId: string;
    user: User;
}

export interface Comment {
    id: string;
    content: string;
    userId: string;
    taskId: string;
    createdAt: string;
    user: User;
}

export interface Subtask {
    id: string;
    title: string;
    completed: boolean;
    createdAt?: string;
}

export interface Attachment {
    id: string;
    name: string;
    size: number;
    type: string;
    url?: string;
    uploadedAt: string;
    uploadedBy?: User;
}

export interface Task {
    id: string;
    projectId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    type: TaskType;
    priority: Priority;
    assigneeId: string;
    due_date: string;
    createdAt?: string;
    updatedAt?: string;
    project?: Project;
    assignee?: User;
    comments?: Comment[];
    subtasks?: Subtask[];
    attachments?: Attachment[];
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    priority: Priority;
    status: ProjectStatus;
    start_date?: string;
    end_date?: string;
    team_lead: string;
    workspaceId: string;
    progress: number;
    createdAt?: string;
    updatedAt?: string;
    members?: ProjectMember[];
    owner?: User;
    tasks?: Task[];
}

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description?: string;
    settings?: Record<string, any>;
    ownerId: string;
    createdAt?: string;
    image_url?: string;
    updatedAt?: string;
    members: WorkspaceMember[];
    projects: Project[];
    owner?: User;
}

export interface WorkspaceState {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    loading: boolean;
}

export interface ThemeState {
    theme: 'light' | 'dark';
}
