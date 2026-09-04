import React, { useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2, CheckSquare } from "lucide-react";
import { Subtask, Task } from "../../types";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { updateTask } from "../../features/workspaceSlice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import toast from "react-hot-toast";

interface SubtaskListProps {
    task: Task;
    className?: string;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({ task, className = "" }) => {
    const dispatch = useAppDispatch();
    const currentWorkspace = useAppSelector((state) => state.workspace.currentWorkspace);
    const [newTitle, setNewTitle] = useState("");
    const subtasks = task.subtasks || [];

    const completedCount = subtasks.filter((st) => st.completed).length;
    const totalCount = subtasks.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const saveUpdatedTask = (updatedSubtasks: Subtask[]) => {
        const updated: Task = {
            ...task,
            subtasks: updatedSubtasks,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
    };

    const handleToggleSubtask = (subtaskId: string) => {
        const updated = subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        saveUpdatedTask(updated);
        const toggled = updated.find((st) => st.id === subtaskId);
        if (toggled?.completed) {
            toast.success("Subtask marked completed");
        }
    };

    const handleAddSubtask = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newTitle.trim();
        if (!trimmed) return;

        const newSubtask: Subtask = {
            id: `st_${Date.now()}`,
            title: trimmed,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        saveUpdatedTask([...subtasks, newSubtask]);
        setNewTitle("");
        toast.success("Subtask added");
    };

    const handleDeleteSubtask = (subtaskId: string) => {
        const updated = subtasks.filter((st) => st.id !== subtaskId);
        saveUpdatedTask(updated);
        toast.success("Subtask removed");
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                    <CheckSquare className="size-3.5 text-zinc-500" />
                    <span>Subtasks</span>
                    <span className="text-zinc-400 dark:text-zinc-500 font-normal">
                        ({completedCount}/{totalCount})
                    </span>
                </div>
                {totalCount > 0 && (
                    <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        {percent}%
                    </span>
                )}
            </div>

            {totalCount > 0 && (
                <Progress value={percent} className="h-1.5" />
            )}

            {/* Subtasks items list */}
            {subtasks.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                    {subtasks.map((st) => (
                        <div
                            key={st.id}
                            className="group flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-md hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                        >
                            <button
                                type="button"
                                onClick={() => handleToggleSubtask(st.id)}
                                className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                            >
                                {st.completed ? (
                                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                ) : (
                                    <Circle className="size-4 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 shrink-0" />
                                )}
                                <span
                                    className={`text-xs transition-all truncate ${
                                        st.completed
                                            ? "line-through text-zinc-400 dark:text-zinc-500"
                                            : "text-zinc-800 dark:text-zinc-200"
                                    }`}
                                >
                                    {st.title}
                                </span>
                            </button>

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSubtask(st.id)}
                                className="opacity-0 group-hover:opacity-100 size-6 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-opacity"
                                title="Delete subtask"
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : null}

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Add a subtask..."
                    className="h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
                <Button
                    type="submit"
                    size="sm"
                    disabled={!newTitle.trim()}
                    className="h-8 text-xs px-2.5 gap-1 shrink-0"
                >
                    <Plus className="size-3.5" />
                    Add
                </Button>
            </form>
        </div>
    );
};
