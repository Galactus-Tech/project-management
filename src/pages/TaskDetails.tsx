import React, { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
    CalendarIcon,
    ArrowLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserCheck,
    Trash2,
    PenIcon,
    Bug,
    Zap,
    Square,
    GitCommit,
    MessageSquare,
    Share2,
    CheckSquare,
    Paperclip,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../app/store";
import { Task, Project, TaskStatus, Priority, TaskType } from "../types";
import { updateTask, deleteTask } from "../features/workspaceSlice";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SubtaskList } from "../components/task/SubtaskList";
import { AttachmentList } from "../components/task/AttachmentList";
import { CommentList } from "../components/task/CommentList";

const TaskDetails: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get("projectId");
    const taskId = searchParams.get("taskId");

    const { currentWorkspace } = useAppSelector((state) => state.workspace);

    const project = currentWorkspace?.projects.find((p) => p.id === projectId) || null;
    const task = project?.tasks?.find((t) => t.id === taskId) || null;
    const members = project?.members || currentWorkspace?.members || [];

    if (!project || !task) {
        return (
            <div className="p-8 max-w-xl mx-auto text-center space-y-4">
                <div className="size-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="size-6" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Task Not Found</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    The requested task could not be located in this workspace. It may have been deleted or moved.
                </p>
                <Button
                    onClick={() => navigate(projectId ? `/projectsDetail?id=${projectId}` : "/")}
                    variant="outline"
                    className="gap-2"
                >
                    <ArrowLeft className="size-4" /> Back to Project
                </Button>
            </div>
        );
    }

    const handleStatusChange = (newStatus: TaskStatus) => {
        const updated: Task = {
            ...task,
            status: newStatus,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
        toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
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

    const handleTypeChange = (newType: TaskType) => {
        const updated: Task = {
            ...task,
            type: newType,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updated));
        toast.success(`Type updated to ${newType}`);
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
        if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
            dispatch(deleteTask([task.id]));
            toast.success("Task deleted");
            navigate(`/projectsDetail?id=${projectId}`);
        }
    };

    const renderTypeIcon = (type: TaskType) => {
        switch (type) {
            case "BUG":
                return <Bug className="size-4 text-red-500" />;
            case "FEATURE":
                return <Zap className="size-4 text-blue-500" />;
            case "IMPROVEMENT":
                return <GitCommit className="size-4 text-purple-500" />;
            case "OTHER":
                return <MessageSquare className="size-4 text-amber-500" />;
            default:
                return <Square className="size-4 text-emerald-500" />;
        }
    };

    const subtasks = task.subtasks || [];
    const completedSubtasks = subtasks.filter((s) => s.completed).length;
    const attachments = task.attachments || [];
    const comments = task.comments || [];

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Top Navigation Bar & Breadcrumb */}
            <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/projectsDetail?id=${projectId}`)}
                    className="gap-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    <ArrowLeft className="size-4" /> Back to {project.name}
                </Button>

                {/* Quick actions top bar */}
                <div className="flex items-center gap-2">
                    {task.status !== "DONE" ? (
                        <Button
                            size="sm"
                            onClick={() => handleStatusChange("DONE")}
                            className="h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <CheckCircle2 className="size-3.5" /> Mark as Done
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange("IN_PROGRESS")}
                            className="h-8 text-xs gap-1.5"
                        >
                            <Clock className="size-3.5" /> Re-open Task
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDeleteTask}
                        className="size-8 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete Task"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Task Title, Description, Subtasks, Attachments, Comments */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Card */}
                    <Card>
                        <CardHeader className="space-y-3 pb-4">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
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
                                    >
                                        {task.priority} Priority
                                    </Badge>
                                </div>
                                <span className="text-xs text-zinc-400">
                                    ID: {task.id.slice(0, 8)}
                                </span>
                            </div>

                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug">
                                {task.title}
                            </CardTitle>

                            {task.description && (
                                <CardDescription className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                                    {task.description}
                                </CardDescription>
                            )}
                        </CardHeader>
                    </Card>

                    {/* Interactive Multi-Section Tabs */}
                    <Card>
                        <CardContent className="p-5">
                            <Tabs defaultValue="subtasks" className="w-full">
                                <TabsList className="grid grid-cols-3 w-full bg-zinc-100 dark:bg-zinc-800 p-1 mb-5">
                                    <TabsTrigger value="subtasks" className="gap-1.5 text-xs">
                                        <CheckSquare className="size-3.5" />
                                        Subtasks
                                        <span className="ml-1 text-[11px] opacity-70">
                                            ({completedSubtasks}/{subtasks.length})
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger value="attachments" className="gap-1.5 text-xs">
                                        <Paperclip className="size-3.5" />
                                        Attachments
                                        <span className="ml-1 text-[11px] opacity-70">
                                            ({attachments.length})
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger value="comments" className="gap-1.5 text-xs">
                                        <MessageSquare className="size-3.5" />
                                        Discussion
                                        <span className="ml-1 text-[11px] opacity-70">
                                            ({comments.length})
                                        </span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="subtasks" className="m-0 focus-visible:outline-none">
                                    <SubtaskList task={task} />
                                </TabsContent>

                                <TabsContent value="attachments" className="m-0 focus-visible:outline-none">
                                    <AttachmentList task={task} />
                                </TabsContent>

                                <TabsContent value="comments" className="m-0 focus-visible:outline-none">
                                    <CommentList task={task} />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Sidebar: Quick Actions & Assignment Indicators */}
                <div className="space-y-5">
                    {/* Task Properties Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Task Attributes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs">
                            {/* Status Quick Switcher */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Status</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs font-medium gap-1.5"
                                        >
                                            <span
                                                className={`size-2 rounded-full ${
                                                    task.status === "DONE"
                                                        ? "bg-emerald-500"
                                                        : task.status === "IN_PROGRESS"
                                                        ? "bg-amber-500"
                                                        : "bg-zinc-400"
                                                }`}
                                            />
                                            {task.status.replace("_", " ")}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-36 text-xs">
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

                            <Separator />

                            {/* Priority Quick Switcher */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Priority</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 text-xs font-medium">
                                            {task.priority}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32 text-xs">
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

                            <Separator />

                            {/* Type Quick Switcher */}
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Type</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-7 text-xs font-medium gap-1">
                                            {renderTypeIcon(task.type)}
                                            {task.type}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-36 text-xs">
                                        <DropdownMenuItem onClick={() => handleTypeChange("TASK")}>
                                            Task
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleTypeChange("BUG")}>
                                            Bug
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleTypeChange("FEATURE")}>
                                            Feature
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleTypeChange("IMPROVEMENT")}>
                                            Improvement
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleTypeChange("OTHER")}>
                                            Other
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <Separator />

                            {/* Assignee Indicator & Switcher */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Assignee</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 text-[11px] text-blue-600 dark:text-blue-400 p-1">
                                                Change
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48 max-h-56 overflow-y-auto text-xs">
                                            <DropdownMenuLabel className="text-xs">Select Assignee</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {members.map((m) => (
                                                <DropdownMenuItem
                                                    key={m.userId || m.id}
                                                    onClick={() => handleAssigneeChange(m.userId || m.user?.id)}
                                                    className="flex items-center gap-2 text-xs"
                                                >
                                                    <Avatar className="size-5 shrink-0">
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

                                <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                                    <Avatar className="size-7">
                                        <AvatarImage src={task.assignee?.image} alt={task.assignee?.name} />
                                        <AvatarFallback className="text-xs bg-zinc-200 dark:bg-zinc-700">
                                            {task.assignee?.name?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                            {task.assignee?.name || "Unassigned"}
                                        </p>
                                        <p className="text-[11px] text-zinc-400 truncate">
                                            {task.assignee?.email || "No email assigned"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Due Date Indicator */}
                            <div className="space-y-1">
                                <span className="text-zinc-500 dark:text-zinc-400 font-medium block">Due Date</span>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                                    <CalendarIcon className="size-4 text-zinc-400 shrink-0" />
                                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                        {task.due_date ? format(new Date(task.due_date), "PPP") : "No due date"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Association Card */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Project Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <div>
                                <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                                    {project.name}
                                </p>
                                {project.description && (
                                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 pt-1">
                                <span>Project Status:</span>
                                <Badge variant="outline" className="text-[10px]">
                                    {project.status}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                                <span>Project Progress:</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                    {project.progress}%
                                </span>
                            </div>

                            <div className="pt-2">
                                <Link
                                    to={`/projectsDetail?id=${project.id}`}
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline block text-center"
                                >
                                    View full project dashboard →
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TaskDetails;
