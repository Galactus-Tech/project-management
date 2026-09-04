import React from "react";
import { Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import {
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    Users,
    Check,
} from "lucide-react";
import { Project, ProjectStatus, Priority } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppSelector } from "../app/store";

export function getProjectProgress(project: Project): {
    percent: number;
    completedCount: number;
    totalCount: number;
} {
    if (project.tasks && project.tasks.length > 0) {
        const completedCount = project.tasks.filter((t) => t.status === "DONE").length;
        const totalCount = project.tasks.length;
        const percent = Math.round((completedCount / totalCount) * 100);
        return { percent, completedCount, totalCount };
    }
    return {
        percent: project.progress || 0,
        completedCount: 0,
        totalCount: 0,
    };
}

export function getDeadlineInfo(endDateStr?: string, status?: ProjectStatus) {
    if (!endDateStr) {
        return {
            text: "No deadline",
            formatted: "Not set",
            isOverdue: false,
            isNear: false,
            days: null,
        };
    }

    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) {
        return {
            text: "Invalid date",
            formatted: "Invalid date",
            isOverdue: false,
            isNear: false,
            days: null,
        };
    }

    const now = new Date();
    const formatted = format(endDate, "MMM d, yyyy");

    if (status === "COMPLETED") {
        return {
            text: "Completed",
            formatted,
            isOverdue: false,
            isNear: false,
            days: null,
        };
    }

    const diffDays = differenceInDays(endDate, now);

    if (diffDays < 0) {
        return {
            text: `${Math.abs(diffDays)}d overdue`,
            formatted,
            isOverdue: true,
            isNear: false,
            days: diffDays,
        };
    } else if (diffDays === 0) {
        return {
            text: "Due today",
            formatted,
            isOverdue: false,
            isNear: true,
            days: 0,
        };
    } else if (diffDays <= 7) {
        return {
            text: `Due in ${diffDays}d`,
            formatted,
            isOverdue: false,
            isNear: true,
            days: diffDays,
        };
    } else {
        return {
            text: `${diffDays} days left`,
            formatted,
            isOverdue: false,
            isNear: false,
            days: diffDays,
        };
    }
}

export function renderPriorityBadge(priority: Priority) {
    switch (priority) {
        case "HIGH":
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="destructive" className="gap-1.5 py-0.5 font-normal text-xs cursor-default">
                            <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
                            High
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">High urgency - requires prompt delivery</TooltipContent>
                </Tooltip>
            );
        case "MEDIUM":
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="secondary" className="gap-1.5 py-0.5 font-normal text-xs text-amber-700 dark:text-amber-300 border-amber-300/40 bg-amber-500/10 cursor-default">
                            <span className="size-1.5 rounded-full bg-amber-400" />
                            Medium
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">Standard priority milestone</TooltipContent>
                </Tooltip>
            );
        case "LOW":
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Badge variant="outline" className="gap-1.5 py-0.5 font-normal text-xs text-zinc-600 dark:text-zinc-400 cursor-default">
                            <span className="size-1.5 rounded-full bg-zinc-400" />
                            Low
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="top">Low priority - flexible timeline</TooltipContent>
                </Tooltip>
            );
    }
}

export function renderStatusBadge(status: ProjectStatus) {
    switch (status) {
        case "ACTIVE":
            return (
                <Badge variant="default" className="gap-1.5 py-0.5 font-normal text-xs">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                </Badge>
            );
        case "PLANNING":
            return (
                <Badge variant="secondary" className="gap-1.5 py-0.5 font-normal text-xs">
                    <span className="size-1.5 rounded-full bg-zinc-400" />
                    Planning
                </Badge>
            );
        case "COMPLETED":
            return (
                <Badge variant="secondary" className="gap-1.5 py-0.5 font-normal text-xs text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 bg-emerald-500/10">
                    <Check className="size-3" />
                    Completed
                </Badge>
            );
        case "ON_HOLD":
            return (
                <Badge variant="outline" className="gap-1.5 py-0.5 font-normal text-xs text-amber-700 dark:text-amber-400 border-amber-500/30">
                    <Clock className="size-3" />
                    On Hold
                </Badge>
            );
        case "CANCELLED":
            return (
                <Badge variant="destructive" className="gap-1.5 py-0.5 font-normal text-xs">
                    Cancelled
                </Badge>
            );
    }
}

interface ProjectCardProps {
    project: Project;
    viewMode?: "grid" | "list";
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode = "grid" }) => {
    const currentWorkspace = useAppSelector((state) => state?.workspace?.currentWorkspace || null);
    const { percent, completedCount, totalCount } = getProjectProgress(project);
    const deadline = getDeadlineInfo(project.end_date, project.status);

    // Resolve team lead
    const leadMember = currentWorkspace?.members?.find(
        (m) => m.userId === project.team_lead || m.user?.id === project.team_lead
    );
    const leadUser = leadMember?.user || project.owner;

    // Members list
    const projectMembers = project.members && project.members.length > 0
        ? project.members
        : currentWorkspace?.members?.slice(0, 3) || [];

    if (viewMode === "list") {
        return (
            <Link
                to={`/projectsDetail?id=${project.id}&tab=overview`}
                className="block group"
            >
                <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-zinc-200/80 dark:border-zinc-800">
                    <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Name & Description */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {project.name}
                                </h3>
                                {renderStatusBadge(project.status)}
                                {renderPriorityBadge(project.priority)}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                {project.description || "No description provided"}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className="w-full md:w-44 shrink-0">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{percent}%</span>
                            </div>
                            <Progress value={percent} className="h-1.5" />
                        </div>

                        {/* Deadline */}
                        <div className="w-full md:w-36 shrink-0 text-xs">
                            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 mb-0.5">
                                <Calendar className="size-3.5 text-zinc-400" />
                                <span>{deadline.formatted}</span>
                            </div>
                            {deadline.isOverdue && (
                                <span className="text-[11px] font-medium text-red-600 dark:text-red-400">
                                    {deadline.text}
                                </span>
                            )}
                            {deadline.isNear && (
                                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                    {deadline.text}
                                </span>
                            )}
                        </div>

                        {/* Team Members */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex -space-x-2 overflow-hidden">
                                {projectMembers.slice(0, 3).map((m, idx) => (
                                    <Tooltip key={idx}>
                                        <TooltipTrigger asChild>
                                            <Avatar className="size-7 border-2 border-white dark:border-zinc-900 hover:scale-110 hover:z-10 transition-transform">
                                                <AvatarImage src={m.user?.image} alt={m.user?.name} />
                                                <AvatarFallback className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                                    {m.user?.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            {m.user?.name || "Team Member"} ({m.role || "Member"})
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                                {projectMembers.length > 3 && (
                                    <div className="size-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                                        +{projectMembers.length - 3}
                                    </div>
                                )}
                            </div>
                            <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 ml-2" />
                        </div>
                    </div>
                </Card>
            </Link>
        );
    }

    return (
        <Link
            to={`/projectsDetail?id=${project.id}&tab=overview`}
            className="block group h-full"
        >
            <Card className="hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col justify-between border border-zinc-200/80 dark:border-zinc-800">
                <div>
                    {/* Header */}
                    <CardHeader className="p-4 sm:p-5 pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <CardTitle className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {project.name}
                                </CardTitle>
                            </div>
                            <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>

                        <CardDescription className="line-clamp-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                            {project.description || "No description provided"}
                        </CardDescription>

                        {/* Status & Priority Badges */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {renderStatusBadge(project.status)}
                            {renderPriorityBadge(project.priority)}
                        </div>
                    </CardHeader>

                    {/* Deadline Section */}
                    <CardContent className="p-4 sm:p-5 pt-0 pb-3 space-y-3">
                        <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-200 dark:hover:border-zinc-700/60 transition-colors">
                            <div className="flex items-center justify-between text-xs mb-1">
                                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                                    <Calendar className="size-3.5" />
                                    <span>Deadline</span>
                                </div>
                                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                    {deadline.formatted}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-400 dark:text-zinc-500">
                                    {project.start_date
                                        ? `Started ${format(new Date(project.start_date), "MMM d")}`
                                        : "No start date"}
                                </span>

                                {deadline.isOverdue && (
                                    <span className="inline-flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                                        <AlertCircle className="size-3" />
                                        {deadline.text}
                                    </span>
                                )}
                                {deadline.isNear && (
                                    <span className="inline-flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                                        <Clock className="size-3" />
                                        {deadline.text}
                                    </span>
                                )}
                                {!deadline.isOverdue && !deadline.isNear && project.status === "COMPLETED" && (
                                    <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="size-3" />
                                        Finished
                                    </span>
                                )}
                                {!deadline.isOverdue && !deadline.isNear && project.status !== "COMPLETED" && project.end_date && (
                                    <span className="font-medium text-zinc-500 dark:text-zinc-400">
                                        {deadline.text}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Progress Section */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="space-y-1.5 cursor-default p-1 -m-1 rounded-lg hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{percent}%</span>
                                    </div>
                                    <Progress value={percent} className="h-1.5" />
                                    <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                                        <span>{totalCount > 0 ? `${completedCount} of ${totalCount} tasks` : "No tasks yet"}</span>
                                        {totalCount > 0 && <span>{totalCount - completedCount} remaining</span>}
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                {percent}% complete ({completedCount}/{totalCount} tasks finished)
                            </TooltipContent>
                        </Tooltip>
                    </CardContent>
                </div>

                {/* Footer: Team Lead & Members */}
                <CardFooter className="p-4 sm:p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        {leadUser ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 truncate cursor-default">
                                        <Avatar className="size-5 border border-zinc-200 dark:border-zinc-700">
                                            <AvatarImage src={leadUser.image} alt={leadUser.name} />
                                            <AvatarFallback className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                                {leadUser.name?.charAt(0) || "L"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate max-w-28 text-[11px]">{leadUser.name}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="top">Team Lead: {leadUser.name} ({leadUser.email})</TooltipContent>
                            </Tooltip>
                        ) : (
                            <span className="text-[11px] text-zinc-400">Unassigned lead</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="flex -space-x-1.5 overflow-hidden">
                            {projectMembers.slice(0, 3).map((m, idx) => (
                                <Tooltip key={idx}>
                                    <TooltipTrigger asChild>
                                        <Avatar className="size-5 border-2 border-white dark:border-zinc-900 hover:scale-115 hover:z-10 transition-transform">
                                            <AvatarImage src={m.user?.image} alt={m.user?.name} />
                                            <AvatarFallback className="text-[8px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                                {m.user?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        {m.user?.name || "Team Member"} ({m.role || "Contributor"})
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                        {projectMembers.length > 3 && (
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium ml-0.5">
                                +{projectMembers.length - 3}
                            </span>
                        )}
                        {projectMembers.length === 0 && (
                            <Users className="size-3.5 text-zinc-400" />
                        )}
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
};

export default ProjectCard;
