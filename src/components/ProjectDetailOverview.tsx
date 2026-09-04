import React from "react";
import { format, differenceInDays } from "date-fns";
import {
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    UserPlus,
    Plus,
    ArrowRight,
    Users,
    CheckSquare,
    TrendingUp,
    Shield
} from "lucide-react";
import { Project, Task } from "../types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { renderPriorityBadge, renderStatusBadge, getDeadlineInfo, getProjectProgress } from "./ProjectCard";
import { useAppSelector } from "../app/store";

interface ProjectDetailOverviewProps {
    project: Project;
    tasks: Task[];
    onNavigateTab: (tab: string) => void;
    onOpenCreateTask: () => void;
    onOpenAddMember: () => void;
}

export const ProjectDetailOverview: React.FC<ProjectDetailOverviewProps> = ({
    project,
    tasks,
    onNavigateTab,
    onOpenCreateTask,
    onOpenAddMember,
}) => {
    const currentWorkspace = useAppSelector((state) => state?.workspace?.currentWorkspace || null);
    const { percent, completedCount, totalCount } = getProjectProgress(project);
    const deadline = getDeadlineInfo(project.end_date, project.status);

    // Identify team lead
    const leadMember = currentWorkspace?.members?.find(
        (m) => m.userId === project.team_lead || m.user?.id === project.team_lead
    );
    const leadUser = leadMember?.user || project.owner;

    // Upcoming tasks sorted by due date
    const now = new Date();
    const upcomingTasks = [...tasks]
        .filter((t) => t.status !== "DONE" && t.due_date)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);

    // Task status counts
    const todoCount = tasks.filter((t) => t.status === "TODO").length;
    const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const doneCount = completedCount;

    // Members list
    const members = project.members && project.members.length > 0
        ? project.members
        : currentWorkspace?.members?.map((m) => ({
            id: m.id,
            userId: m.userId,
            projectId: project.id,
            user: m.user,
        })) || [];

    return (
        <div className="space-y-6">
            {/* Top Cards: Deadlines, Progress & Team Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Deadline & Schedule Card */}
                <Card>
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Timeline & Deadline</span>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                    {deadline.formatted}
                                </h3>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                <Calendar className="size-4" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400">Start Date:</span>
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                    {project.start_date ? format(new Date(project.start_date), "MMM d, yyyy") : "Not specified"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400">Target Due:</span>
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                    {deadline.formatted}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-zinc-500 dark:text-zinc-400">Deadline Status:</span>
                                {deadline.isOverdue && (
                                    <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
                                        <AlertCircle className="size-3.5" />
                                        {deadline.text}
                                    </span>
                                )}
                                {deadline.isNear && (
                                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                                        <Clock className="size-3.5" />
                                        {deadline.text}
                                    </span>
                                )}
                                {!deadline.isOverdue && !deadline.isNear && project.status === "COMPLETED" && (
                                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="size-3.5" />
                                        Completed
                                    </span>
                                )}
                                {!deadline.isOverdue && !deadline.isNear && project.status !== "COMPLETED" && (
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        {deadline.text}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Progress & Completion Card */}
                <Card>
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Overall Progress</span>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{percent}%</span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        ({doneCount}/{totalCount} tasks done)
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                <TrendingUp className="size-4" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Progress value={percent} className="h-2" />
                            <div className="grid grid-cols-3 gap-1 pt-2 text-center">
                                <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{todoCount}</div>
                                    <div className="text-[10px] text-zinc-500">To Do</div>
                                </div>
                                <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">{inProgressCount}</div>
                                    <div className="text-[10px] text-zinc-500">In Progress</div>
                                </div>
                                <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{doneCount}</div>
                                    <div className="text-[10px] text-zinc-500">Completed</div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Leadership & Team Card */}
                <Card>
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Team & Leadership</span>
                                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                                    {members.length} Member{members.length !== 1 ? "s" : ""}
                                </h3>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                <Users className="size-4" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            {leadUser && (
                                <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <Avatar className="size-7">
                                        <AvatarImage src={leadUser.image} alt={leadUser.name} />
                                        <AvatarFallback className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                            {leadUser.name?.charAt(0) || "L"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {leadUser.name}
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                Lead
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-zinc-400 truncate">{leadUser.email}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex -space-x-2 overflow-hidden">
                                    {members.slice(0, 4).map((m, idx) => (
                                        <Avatar key={idx} className="size-6 border-2 border-white dark:border-zinc-950">
                                            <AvatarImage src={m.user?.image} alt={m.user?.name} />
                                            <AvatarFallback className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                                {m.user?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {members.length > 4 && (
                                        <div className="size-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[9px] font-medium text-zinc-600 dark:text-zinc-400">
                                            +{members.length - 4}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onOpenAddMember}
                                    className="h-7 text-xs gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                >
                                    <UserPlus className="size-3" />
                                    Add Member
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Description & Objective Card */}
            <Card>
                <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            About this Project
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {renderStatusBadge(project.status)}
                            {renderPriorityBadge(project.priority)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {project.description || "No detailed description provided for this project."}
                    </p>
                </CardContent>
            </Card>

            {/* Two Columns: Upcoming Deadlines & Team Members Roster */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Tasks & Milestones */}
                <Card>
                    <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                Upcoming Deadlines
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                Tasks requiring immediate attention
                            </CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onNavigateTab("tasks")}
                            className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1 h-7"
                        >
                            View all tasks <ArrowRight className="size-3" />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        {upcomingTasks.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                <CheckCircle2 className="size-8 mx-auto mb-2 text-zinc-400 opacity-60" />
                                <p className="text-sm">No pending deadlines</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onOpenCreateTask}
                                    className="mt-3 gap-1.5 text-xs"
                                >
                                    <Plus className="size-3.5" />
                                    Add Task
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {upcomingTasks.map((task) => {
                                    const taskDueDate = new Date(task.due_date);
                                    const diff = differenceInDays(taskDueDate, now);
                                    const isOverdue = diff < 0;
                                    const isDueSoon = diff >= 0 && diff <= 3;

                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => onNavigateTab("tasks")}
                                            className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                        {task.title}
                                                    </span>
                                                    {renderPriorityBadge(task.priority)}
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                                                    <span className="capitalize">{task.type.toLowerCase()}</span>
                                                    {task.assignee && (
                                                        <span>• Assigned to {task.assignee.name}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                    {format(taskDueDate, "MMM d")}
                                                </div>
                                                {isOverdue ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
                                                        <AlertCircle className="size-3" />
                                                        {Math.abs(diff)}d overdue
                                                    </span>
                                                ) : isDueSoon ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                                        <Clock className="size-3" />
                                                        Due in {diff}d
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-zinc-400">
                                                        {diff}d left
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Team Roster & Allocation */}
                <Card>
                    <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                Team Roster
                            </CardTitle>
                            <CardDescription className="text-xs mt-0.5">
                                People assigned to this project
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenAddMember}
                            className="text-xs gap-1.5 h-7"
                        >
                            <UserPlus className="size-3" />
                            Add Member
                        </Button>
                    </CardHeader>
                    <CardContent className="p-5 pt-0">
                        {members.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                <Users className="size-8 mx-auto mb-2 text-zinc-400 opacity-60" />
                                <p className="text-sm">No members added to this project yet</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onOpenAddMember}
                                    className="mt-3 gap-1.5 text-xs"
                                >
                                    <UserPlus className="size-3.5" />
                                    Add First Member
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {members.map((member) => {
                                    const isLead =
                                        member.userId === project.team_lead ||
                                        member.user?.id === project.team_lead;
                                    const memberTasksCount = tasks.filter(
                                        (t) => t.assigneeId === member.userId || t.assignee?.id === member.user?.id
                                    ).length;

                                    return (
                                        <div
                                            key={member.id || member.userId}
                                            className="py-3 flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Avatar className="size-8 border border-zinc-200 dark:border-zinc-800">
                                                    <AvatarImage src={member.user?.image} alt={member.user?.name} />
                                                    <AvatarFallback className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                                        {member.user?.name?.charAt(0) || "U"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                            {member.user?.name || "Unnamed"}
                                                        </span>
                                                        {isLead && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                                Lead
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate block">
                                                        {member.user?.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0 font-medium">
                                                {memberTasksCount} task{memberTasksCount !== 1 ? "s" : ""}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
