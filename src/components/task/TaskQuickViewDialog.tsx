import React, { useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    ExternalLink,
    Clock,
    Tag,
    UserCheck,
    AlertCircle,
    CheckCircle2,
    Bug,
    Zap,
    Square,
    GitCommit,
    MessageSquare,
    Trash2,
} from "lucide-react";
import { Task, TaskStatus, Priority, TaskType } from "../../types";
import { useAppDispatch, useAppSelector } from "../../app/store";
import { updateTask, deleteTask } from "../../features/workspaceSlice";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SubtaskList } from "./SubtaskList";
import { AttachmentList } from "./AttachmentList";
import { CommentList } from "./CommentList";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import toast from "react-hot-toast";

interface TaskQuickViewDialogProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
}

export const TaskQuickViewDialog: React.FC<TaskQuickViewDialogProps> = ({
    task,
    isOpen,
    onClose,
}) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const currentWorkspace = useAppSelector((state) => state.workspace.currentWorkspace);

    if (!task) return null;

    const project = currentWorkspace?.projects?.find((p) => p.id === task.projectId);
    const members = project?.members || currentWorkspace?.members || [];

    const handleStatusChange = (newStatus: TaskStatus) => {
        const updated: Task = {
            ...task,
            status: newStatus,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    };

    const handlePriorityChange = (newPriority: Priority) => {
        const updated: Task = {
            ...task,
            priority: newPriority,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
        toast.success(`Priority updated to ${newPriority}`);
    };

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

    const handleDeleteTask = () => {
        dispatch(deleteTask([task.id]));
        toast.success("Task deleted");
        onClose();
    };

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

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
                {/* Header */}
                <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {renderTypeIcon(task.type)}
                                <span className="uppercase">{task.type}</span>
                            </span>
                            <Badge
                                variant={
                                    task.priority === "HIGH"
                                        ? "destructive"
                                        : task.priority === "MEDIUM"
                                        ? "secondary"
                                        : "outline"
                                }
                            >
                                {task.priority} Priority
                            </Badge>
                            <Badge
                                variant={task.status === "DONE" ? "default" : "outline"}
                                className={
                                    task.status === "IN_PROGRESS"
                                        ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
                                        : ""
                                }
                            >
                                {task.status.replace("_", " ")}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    onClose();
                                    navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`);
                                }}
                                className="h-7 text-xs gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                Full Page <ExternalLink className="size-3" />
                            </Button>
                        </div>
                    </div>

                    <DialogTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {task.title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {project?.name ? `Project: ${project.name}` : "Task Quick View"}
                    </DialogDescription>
                </div>

                {/* Body & Controls */}
                <div className="p-5 space-y-5">
                    {/* Quick Metadata Controls */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                        {/* Status Switcher */}
                        <div>
                            <span className="text-[10px] text-zinc-400 uppercase font-medium block mb-1">
                                Status
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 text-xs w-full justify-between">
                                        {task.status.replace("_", " ")}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-40">
                                    <DropdownMenuItem onClick={() => handleStatusChange("TODO")}>
                                        To Do
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange("IN_PROGRESS")}>
                                        In Progress
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange("DONE")}>
                                        Done
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Priority Switcher */}
                        <div>
                            <span className="text-[10px] text-zinc-400 uppercase font-medium block mb-1">
                                Priority
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 text-xs w-full justify-between">
                                        {task.priority}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-36">
                                    <DropdownMenuItem onClick={() => handlePriorityChange("LOW")}>
                                        Low
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange("MEDIUM")}>
                                        Medium
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handlePriorityChange("HIGH")}>
                                        High
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Assignee Indicator & Switcher */}
                        <div>
                            <span className="text-[10px] text-zinc-400 uppercase font-medium block mb-1">
                                Assignee
                            </span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-7 text-xs w-full justify-start gap-1.5 px-2">
                                        <Avatar className="size-4 shrink-0">
                                            <AvatarImage src={task.assignee?.image} alt={task.assignee?.name} />
                                            <AvatarFallback className="text-[8px]">
                                                {task.assignee?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{task.assignee?.name || "Assign"}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
                                    <DropdownMenuLabel className="text-xs">Select Assignee</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {members.map((m) => (
                                        <DropdownMenuItem
                                            key={m.userId || m.id}
                                            onClick={() => handleAssigneeChange(m.userId || m.user?.id)}
                                            className="flex items-center gap-2 text-xs"
                                        >
                                            <Avatar className="size-5 shrink-0">
                                                <AvatarImage src={m.user?.image} alt={m.user?.name} />
                                                <AvatarFallback className="text-[9px]">
                                                    {m.user?.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">{m.user?.name || "Member"}</span>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Due Date Indicator */}
                        <div>
                            <span className="text-[10px] text-zinc-400 uppercase font-medium block mb-1">
                                Due Date
                            </span>
                            <div className="flex items-center gap-1.5 h-7 px-2 rounded-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                                <Calendar className="size-3 text-zinc-400" />
                                <span className="truncate">
                                    {task.due_date ? format(new Date(task.due_date), "MMM d") : "No due date"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Task Description */}
                    {task.description && (
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                Description
                            </span>
                            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 rounded-md border border-zinc-100 dark:border-zinc-800">
                                {task.description}
                            </p>
                        </div>
                    )}

                    {/* Tabs for Subtasks, Attachments, Comments */}
                    <Tabs defaultValue="subtasks" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full bg-zinc-100 dark:bg-zinc-800 p-1">
                            <TabsTrigger value="subtasks" className="text-xs">
                                Subtasks ({(task.subtasks || []).length})
                            </TabsTrigger>
                            <TabsTrigger value="attachments" className="text-xs">
                                Attachments ({(task.attachments || []).length})
                            </TabsTrigger>
                            <TabsTrigger value="comments" className="text-xs">
                                Comments ({(task.comments || []).length})
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-4">
                            <TabsContent value="subtasks" className="m-0">
                                <SubtaskList task={task} />
                            </TabsContent>
                            <TabsContent value="attachments" className="m-0">
                                <AttachmentList task={task} />
                            </TabsContent>
                            <TabsContent value="comments" className="m-0">
                                <CommentList task={task} />
                            </TabsContent>
                        </div>
                    </Tabs>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteTask}
                            className="h-8 text-xs gap-1.5"
                        >
                            <Trash2 className="size-3.5" />
                            Delete Task
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="h-8 text-xs"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
