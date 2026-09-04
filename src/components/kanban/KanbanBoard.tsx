import React, { useState } from "react";
import { Task, TaskStatus } from "../../types";
import { useAppDispatch } from "../../app/store";
import { updateTask } from "../../features/workspaceSlice";
import { KanbanColumn } from "./KanbanColumn";
import { TaskQuickViewDialog } from "../task/TaskQuickViewDialog";
import CreateTaskDialog from "../CreateTaskDialog";
import toast from "react-hot-toast";

interface KanbanBoardProps {
    tasks: Task[];
    projectId?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, projectId }) => {
    const dispatch = useAppDispatch();
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [quickViewTask, setQuickViewTask] = useState<Task | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [preselectedStatus, setPreselectedStatus] = useState<TaskStatus>("TODO");

    // Group tasks by status
    const todoTasks = tasks.filter((t) => t.status === "TODO");
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
    const doneTasks = tasks.filter((t) => t.status === "DONE");

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData("text/plain", taskId);
    };

    const handleDropTask = (targetStatus: TaskStatus) => {
        if (!draggedTaskId) return;

        const targetTask = tasks.find((t) => t.id === draggedTaskId);
        if (!targetTask) {
            setDraggedTaskId(null);
            return;
        }

        if (targetTask.status === targetStatus) {
            setDraggedTaskId(null);
            return;
        }

        const updated: Task = {
            ...targetTask,
            status: targetStatus,
            updatedAt: new Date().toISOString(),
        };

        dispatch(updateTask(updated));
        const statusLabel =
            targetStatus === "TODO"
                ? "To Do"
                : targetStatus === "IN_PROGRESS"
                ? "In Progress"
                : "Done";

        toast.success(`Moved "${targetTask.title}" to ${statusLabel}`);
        setDraggedTaskId(null);
    };

    const handleQuickAddTask = (status: TaskStatus) => {
        setPreselectedStatus(status);
        setIsCreateOpen(true);
    };

    // Keep quickViewTask in sync with tasks list
    const currentQuickViewTask = quickViewTask
        ? tasks.find((t) => t.id === quickViewTask.id) || quickViewTask
        : null;

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start overflow-x-auto pb-4">
                {/* Column 1: To Do */}
                <KanbanColumn
                    status="TODO"
                    title="To Do"
                    tasks={todoTasks}
                    colorDot="bg-zinc-400 dark:bg-zinc-500"
                    onDragStart={handleDragStart}
                    onDropTask={handleDropTask}
                    onOpenQuickView={(task) => setQuickViewTask(task)}
                    onQuickAddTask={handleQuickAddTask}
                />

                {/* Column 2: In Progress */}
                <KanbanColumn
                    status="IN_PROGRESS"
                    title="In Progress"
                    tasks={inProgressTasks}
                    colorDot="bg-amber-500"
                    onDragStart={handleDragStart}
                    onDropTask={handleDropTask}
                    onOpenQuickView={(task) => setQuickViewTask(task)}
                    onQuickAddTask={handleQuickAddTask}
                />

                {/* Column 3: Done */}
                <KanbanColumn
                    status="DONE"
                    title="Done"
                    tasks={doneTasks}
                    colorDot="bg-emerald-500"
                    onDragStart={handleDragStart}
                    onDropTask={handleDropTask}
                    onOpenQuickView={(task) => setQuickViewTask(task)}
                    onQuickAddTask={handleQuickAddTask}
                />
            </div>

            {/* Quick View Dialog */}
            {currentQuickViewTask && (
                <TaskQuickViewDialog
                    task={currentQuickViewTask}
                    isOpen={Boolean(currentQuickViewTask)}
                    onClose={() => setQuickViewTask(null)}
                />
            )}

            {/* Create Task Dialog */}
            {isCreateOpen && (
                <CreateTaskDialog
                    showCreateTask={isCreateOpen}
                    setShowCreateTask={setIsCreateOpen}
                    projectId={projectId || (tasks[0]?.projectId)}
                />
            )}
        </div>
    );
};
