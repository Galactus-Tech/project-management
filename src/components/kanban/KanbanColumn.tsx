import React, { useState } from "react";
import { Plus, CheckCircle2, Clock, Circle } from "lucide-react";
import { Task, TaskStatus } from "../../types";
import { KanbanCard } from "./KanbanCard";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
    status: TaskStatus;
    title: string;
    tasks: Task[];
    colorDot: string;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onDropTask: (targetStatus: TaskStatus) => void;
    onOpenQuickView: (task: Task) => void;
    onQuickAddTask: (status: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    title,
    tasks,
    colorDot,
    onDragStart,
    onDropTask,
    onOpenQuickView,
    onQuickAddTask,
}) => {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isOver) setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only turn off if leaving the column boundary
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        onDropTask(status);
    };

    return (
        <div
            role="region"
            aria-label={`${title} stage, ${tasks.length} task${tasks.length === 1 ? '' : 's'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/50 border transition-all p-3 min-w-[280px] sm:min-w-[320px] flex-1 max-w-full ${
                isOver
                    ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20"
                    : "border-zinc-200/80 dark:border-zinc-800"
            }`}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 px-1">
                <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${colorDot}`} aria-hidden="true" />
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        {title}
                    </h3>
                    <span className="text-[11px] font-medium px-2 py-0.2 rounded-full bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                        {tasks.length}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onQuickAddTask(status)}
                    className="size-6 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={`Add new task to ${title}`}
                    title={`Add task to ${title}`}
                >
                    <Plus className="size-3.5" />
                </Button>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[140px] p-0.5">
                {tasks.map((task) => (
                    <KanbanCard
                        key={task.id}
                        task={task}
                        onDragStart={onDragStart}
                        onOpenQuickView={onOpenQuickView}
                    />
                ))}

                {/* Drop placeholder / empty state */}
                {tasks.length === 0 && (
                    <div
                        className={`h-32 flex flex-col items-center justify-center rounded-xl border border-dashed text-center p-4 transition-colors ${
                            isOver
                                ? "border-blue-400 bg-blue-50/40 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                                : "border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500"
                        }`}
                    >
                        <p className="text-xs font-medium">No tasks in this stage</p>
                        <p className="text-[10px] mt-0.5 opacity-80">Drag a task here or click +</p>
                    </div>
                )}
            </div>
        </div>
    );
};
