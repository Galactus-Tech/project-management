import React, { useState } from "react";
import { format, differenceInDays } from "date-fns";
import {
    Calendar,
    Clock,
    AlertCircle,
    Paperclip,
    MessageSquare,
    CheckSquare,
    MoreHorizontal,
    Bug,
    Zap,
    Square,
    GitCommit,
    CheckCircle2,
    ArrowRight,
    UserCheck,
    Trash2,
    Eye,
    GripVertical,
} from "lucide-react";
import { Task, TaskStatus, Priority, TaskType } from "../../types";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { updateTask, deleteTask } from "../../features/workspaceSlice";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface KanbanCardProps {
    task: Task;
    onDragStart: (e: React.DragEvent, taskId: string) => void;
    onOpenQuickView: (task: Task) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
    task,
    onDragStart,
    onOpenQuickView,
}) => {
    const dispatch = useAppDispatch();
    const currentWorkspace = useAppSelector((state) => state.workspace.currentWorkspace);
    const [isDragging, setIsDragging] = useState(false);

    const project = currentWorkspace?.projects?.find((p) => p.id === task.projectId);
    const members = project?.members || currentWorkspace?.members || [];

    // Deadline calculations
    const now = new Date();
    const taskDueDate = task.due_date ? new Date(task.due_date) : null;
    let isOverdue = false;
    let isDueSoon = false;
    let diffDays = 0;

    if (taskDueDate && task.status !== "DONE") {
        diffDays = differenceInDays(taskDueDate, now);
        isOverdue = diffDays < 0;
        isDueSoon = diffDays >= 0 && diffDays <= 3;
    }

    // Subtasks summary
    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter((s) => s.completed).length;
    const subtasksTotal = subtasks.length;
    const subtasksPercent = subtasksTotal > 0 ? Math.round((completedSubtasks / subtasksTotal) * 100) : 0;

    // Attachments & Comments counts
    const attachmentsCount = (task.attachments || []).length;
    const commentsCount = (task.comments || []).length;

    // Type icon
    const renderTypeIcon = (type: TaskType) => {
        switch (type) {
            case "BUG":
                return <Bug className="size-3.5 text-red-500" />;
            case "FEATURE":
                return <Zap className="size-3.5 text-blue-500" />;
            case "IMPROVEMENT":
                return <GitCommit className="size-3.5 text-purple-500" />;
            case "OTHER":
                return <MessageSquare className="size-3.5 text-amber-500" />;
            default:
                return <Square className="size-3.5 text-emerald-500" />;
        }
    };

    // Quick status update
    const handleStatusMove = (newStatus: TaskStatus) => {
        const updated: Task = {
            ...task,
            status: newStatus,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
        toast.success(`Moved to ${newStatus.replace("_", " ")}`);
    };

    // Quick priority update
    const handlePriorityChange = (newPriority: Priority) => {
        const updated: Task = {
            ...task,
            priority: newPriority,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
        toast.success(`Priority set to ${newPriority}`);
    };

    // Quick assignee update
    const handleAssigneeChange = (userId: string) => {
        const targetMember = members.find((m) => m.userId === userId || m.user?.id === userId);
        const updated: Task = {
            ...task,
            assigneeId: userId,
            assignee: targetMember?.user,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
        toast.success(`Assigned to ${targetMember?.user?.name || "Member"}`);
    };

    const handleDelete = () => {
        dispatch(deleteTask([task.id]));
        toast.success("Task deleted");
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`Task ${task.title}, priority ${task.priority}, status ${task.status}`}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenQuickView(task);
                }
            }}
            draggable
            onDragStart={(e) => {
                setIsDragging(true);
                onDragStart(e, task.id);
            }}
            onDragEnd={() => setIsDragging(false)}
            onClick={() => onOpenQuickView(task)}
            className={`group relative rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-zinc-300 dark:hover:border-zinc-700 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none ${
                isDragging ? "opacity-40 scale-98 rotate-1" : "opacity-100"
            }`}
        >
            {/* Top row: Type, Priority & Quick Actions */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                        title={`Type: ${task.type}`}
                    >
                        {renderTypeIcon(task.type)}
                        <span>{task.type}</span>
                    </span>

                    <Badge
                        variant={
                            task.priority === "HIGH"
                                ? "destructive"
                                : task.priority === "MEDIUM"
                                ? "secondary"
                                : "outline"
                        }
                        className="text-[10px] px-1.5 py-0 font-medium"
                    >
                        {task.priority}
                    </Badge>
                </div>

                {/* Quick Action Dropdown */}
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md"
                            >
                                <MoreHorizontal className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 text-xs">
                            <DropdownMenuItem onClick={() => onOpenQuickView(task)} className="gap-2">
                                <Eye className="size-3.5" /> Quick View
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Move Status Submenu */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2 text-xs">
                                    <ArrowRight className="size-3.5" /> Move Stage
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-36">
                                    <DropdownMenuItem
                                        disabled={task.status === "TODO"}
                                        onClick={() => handleStatusMove("TODO")}
                                    >
                                        To Do
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={task.status === "IN_PROGRESS"}
                                        onClick={() => handleStatusMove("IN_PROGRESS")}
                                    >
                                        In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        disabled={task.status === "DONE"}
                                        onClick={() => handleStatusMove("DONE")}
                                    >
                                        Done
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Change Priority Submenu */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2 text-xs">
                                    <AlertCircle className="size-3.5" /> Priority
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-32">
                                    <DropdownMenuItem onClick={() => handlePriorityChange("LOW")}>
                                        Low
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange("MEDIUM")}>
                                        Medium
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange("HIGH")}>
                                        High
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Quick Reassign Submenu */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2 text-xs">
                                    <UserCheck className="size-3.5" /> Reassign
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-44 max-h-52 overflow-y-auto">
                                    {members.map((m) => (
                                        <DropdownMenuItem
                                            key={m.userId || m.id}
                                            onClick={() => handleAssigneeChange(m.userId || m.user?.id)}
                                            className="text-xs flex items-center gap-2"
                                        >
                                            <Avatar className="size-4">
                                                <AvatarImage src={m.user?.image} />
                                                <AvatarFallback className="text-[8px]">
                                                    {m.user?.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">{m.user?.name || "Member"}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={handleDelete}
                                className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                            >
                                <Trash2 className="size-3.5" /> Delete Task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Task Title */}
            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {task.title}
            </h4>

            {/* Optional Description */}
            {task.description && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2.5 leading-relaxed">
                    {task.description}
                </p>
            )}

            {/* Subtasks Progress Bar (if subtasks exist) */}
            {subtasksTotal > 0 && (
                <div className="space-y-1 mb-2.5 bg-zinc-50 dark:bg-zinc-800/40 p-1.5 rounded-md">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 font-medium">
                            <CheckSquare className="size-3 text-zinc-400" />
                            Subtasks
                        </span>
                        <span>
                            {completedSubtasks}/{subtasksTotal} ({subtasksPercent}%)
                        </span>
                    </div>
                    <Progress value={subtasksPercent} className="h-1" />
                </div>
            )}

            {/* Bottom Row: Due Date & Task Indicators + Assignee */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 gap-2">
                {/* Left indicators: Due date & count badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    {taskDueDate && (
                        <div
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                isOverdue
                                    ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-semibold"
                                    : isDueSoon
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-semibold"
                                    : "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800"
                            }`}
                        >
                            {isOverdue ? (
                                <AlertCircle className="size-3 shrink-0" />
                            ) : isDueSoon ? (
                                <Clock className="size-3 shrink-0" />
                            ) : (
                                <Calendar className="size-3 shrink-0 text-zinc-400" />
                            )}
                            <span>
                                {isOverdue
                                    ? `${Math.abs(diffDays)}d overdue`
                                    : isDueSoon
                                    ? `${diffDays}d left`
                                    : format(taskDueDate, "MMM d")}
                            </span>
                        </div>
                    )}

                    {/* Attachments Pill */}
                    {attachmentsCount > 0 && (
                        <span
                            className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500 dark:text-zinc-400"
                            title={`${attachmentsCount} attachment${attachmentsCount > 1 ? "s" : ""}`}
                        >
                            <Paperclip className="size-3" />
                            {attachmentsCount}
                        </span>
                    )}

                    {/* Comments Pill */}
                    {commentsCount > 0 && (
                        <span
                            className="inline-flex items-center gap-0.5 text-[10px] text-zinc-500 dark:text-zinc-400"
                            title={`${commentsCount} comment${commentsCount > 1 ? "s" : ""}`}
                        >
                            <MessageSquare className="size-3" />
                            {commentsCount}
                        </span>
                    )}
                </div>

                {/* Right: Task Assignee Indicator with Quick Reassign */}
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/30 transition-all cursor-pointer"
                                title={task.assignee ? `Assigned to ${task.assignee.name}` : "Unassigned"}
                            >
                                <Avatar className="size-6 border border-zinc-200 dark:border-zinc-700">
                                    <AvatarImage src={task.assignee?.image} alt={task.assignee?.name} />
                                    <AvatarFallback className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                        {task.assignee?.name?.charAt(0) || "?"}
                                    </AvatarFallback>
                                </Avatar>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 max-h-56 overflow-y-auto text-xs">
                            <DropdownMenuLabel className="text-xs">Reassign Task</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {members.map((m) => (
                                <DropdownMenuItem
                                    key={m.userId || m.id}
                                    onClick={() => handleAssigneeChange(m.userId || m.user?.id)}
                                    className="flex items-center gap-2 text-xs"
                                >
                                    <Avatar className="size-5">
                                        <AvatarImage src={m.user?.image} />
                                        <AvatarFallback className="text-[8px]">
                                            {m.user?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{m.user?.name || "Member"}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
};
