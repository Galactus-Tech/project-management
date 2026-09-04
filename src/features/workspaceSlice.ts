import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dummyWorkspaces } from "../assets/assets";
import { Workspace, Project, Task, WorkspaceState } from "../types";

const initialState: WorkspaceState = {
    workspaces: dummyWorkspaces || [],
    currentWorkspace: dummyWorkspaces[1] || dummyWorkspaces[0] || null,
    loading: false,
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
            state.workspaces = action.payload;
        },
        setCurrentWorkspace: (state, action: PayloadAction<string>) => {
            localStorage.setItem("currentWorkspaceId", action.payload);
            const found = state.workspaces.find((w) => w.id === action.payload);
            if (found) {
                state.currentWorkspace = found;
            }
        },
        addWorkspace: (state, action: PayloadAction<Workspace>) => {
            state.workspaces.push(action.payload);

            // set current workspace to the new workspace
            if (state.currentWorkspace?.id !== action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        updateWorkspace: (state, action: PayloadAction<Workspace>) => {
            state.workspaces = state.workspaces.map((w) =>
                w.id === action.payload.id ? action.payload : w
            );

            // if current workspace is updated, set it to the updated workspace
            if (state.currentWorkspace?.id === action.payload.id) {
                state.currentWorkspace = action.payload;
            }
        },
        deleteWorkspace: (state, action: PayloadAction<string>) => {
            state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
            if (state.currentWorkspace?.id === action.payload) {
                state.currentWorkspace = state.workspaces[0] || null;
            }
        },
        addProject: (state, action: PayloadAction<Project>) => {
            if (state.currentWorkspace) {
                state.currentWorkspace.projects.push(action.payload);
            }
            // find workspace by id and add project to it
            state.workspaces = state.workspaces.map((w) =>
                state.currentWorkspace && w.id === state.currentWorkspace.id
                    ? { ...w, projects: w.projects.concat(action.payload) }
                    : w
            );
        },
        updateProject: (state, action: PayloadAction<Project>) => {
            if (state.currentWorkspace) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) =>
                    p.id === action.payload.id ? action.payload : p
                );
            }
            state.workspaces = state.workspaces.map((w) =>
                state.currentWorkspace && w.id === state.currentWorkspace.id
                    ? {
                        ...w,
                        projects: w.projects.map((p) =>
                            p.id === action.payload.id ? action.payload : p
                        ),
                    }
                    : w
            );
        },
        deleteProject: (state, action: PayloadAction<string>) => {
            if (state.currentWorkspace) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.filter(
                    (p) => p.id !== action.payload
                );
            }
            state.workspaces = state.workspaces.map((w) =>
                state.currentWorkspace && w.id === state.currentWorkspace.id
                    ? {
                        ...w,
                        projects: w.projects.filter((p) => p.id !== action.payload),
                    }
                    : w
            );
        },
        addTask: (state, action: PayloadAction<Task>) => {
            if (state.currentWorkspace) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            tasks: [...(p.tasks || []), action.payload],
                        };
                    }
                    return p;
                });
            }

            // find workspace and project by id and add task to it
            state.workspaces = state.workspaces.map((w) =>
                state.currentWorkspace && w.id === state.currentWorkspace.id
                    ? {
                        ...w,
                        projects: w.projects.map((p) =>
                            p.id === action.payload.projectId
                                ? { ...p, tasks: (p.tasks || []).concat(action.payload) }
                                : p
                        ),
                    }
                    : w
            );
        },
        updateTask: (state, action: PayloadAction<Task>) => {
            if (state.currentWorkspace) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                    if (p.id === action.payload.projectId) {
                        return {
                            ...p,
                            tasks: (p.tasks || []).map((t) =>
                                t.id === action.payload.id ? action.payload : t
                            ),
                        };
                    }
                    return p;
                });
            }

            // find workspace and project by id and update task in it
            state.workspaces = state.workspaces.map((w) =>
                state.currentWorkspace && w.id === state.currentWorkspace.id
                    ? {
                        ...w,
                        projects: w.projects.map((p) =>
                            p.id === action.payload.projectId
                                ? {
                                    ...p,
                                    tasks: (p.tasks || []).map((t) =>
                                        t.id === action.payload.id ? action.payload : t
                                    ),
                                }
                                : p
                        ),
                    }
                    : w
            );
        },
        deleteTask: (state, action: PayloadAction<string[]>) => {
            if (state.currentWorkspace) {
                state.currentWorkspace.projects = state.currentWorkspace.projects.map((p) => {
                    return {
                        ...p,
                        tasks: (p.tasks || []).filter((t) => !action.payload.includes(t.id)),
                    };
                });
            }

            // find workspace and project by id and delete task from it
            state.workspaces = state.workspaces.map((w) =>
                state.currentWorkspace && w.id === state.currentWorkspace.id
                    ? {
                        ...w,
                        projects: w.projects.map((p) => ({
                            ...p,
                            tasks: (p.tasks || []).filter((t) => !action.payload.includes(t.id)),
                        })),
                    }
                    : w
            );
        },
    },
});

export const {
    setWorkspaces,
    setCurrentWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
