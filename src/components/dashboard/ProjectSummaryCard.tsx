import React from "react";
import { Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import {
    FolderKanban,
    ArrowRight,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "../../app/store";
import { Project } from "../../types";

interface ProjectSummaryCardProps {
    onOpenCreateProject?: () => void;
}

export const ProjectSummaryCard: React.FC<ProjectSummaryCardProps> = ({ onOpenCreateProject }) => {
    const currentWorkspace = useAppSelector((state) => state.workspace.currentWorkspace);
    const projects = currentWorkspace?.projects || [];

    const total = projects.length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const inProgress = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "ACTIVE").length;
    const planning = projects.filter((p) => p.status === "PLANNING").length;

    const avgProgress =
        total > 0
            ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / total)
            : 0;

    return (
        <Card className="overflow-hidden" role="region" aria-label="Project Summary and Portfolio Health">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-row items-center justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                            <FolderKanban className="size-4" />
                        </div>
                        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            Project Portfolio Summary
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Overview of {total} initiative{total === 1 ? "" : "s"} across your workspace
                    </CardDescription>
                </div>

                <Link
                    to="/projects"
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 shrink-0"
                    aria-label="View all projects"
                >
                    View All <ArrowRight className="size-3.5" />
                </Link>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-5">
                {/* Overall Portfolio Health KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">
                            Active
                        </span>
                        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                            {inProgress}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">
                            Completed
                        </span>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {completed}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">
                            Planning
                        </span>
                        <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                            {planning}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">
                            Avg Progress
                        </span>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                            {avgProgress}%
                        </p>
                    </div>
                </div>

                {/* Portfolio Progress Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                        <span className="text-zinc-600 dark:text-zinc-400">Workspace Progress</span>
                        <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-2" aria-label={`Workspace progress: ${avgProgress}%`} />
                </div>

                {/* Active Projects List */}
                <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                        Recent Projects Status
                    </span>

                    {projects.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                            <p className="text-xs text-zinc-500">No projects yet in this workspace.</p>
                            {onOpenCreateProject && (
                                <Button size="sm" onClick={onOpenCreateProject} className="text-xs gap-1.5">
                                    <Plus className="size-3.5" /> Create Project
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {projects.slice(0, 4).map((project) => {
                                const daysLeft = project.end_date
                                    ? differenceInDays(new Date(project.end_date), new Date())
                                    : null;
                                const isOverdue = daysLeft !== null && daysLeft < 0 && project.status !== "COMPLETED";

                                return (
                                    <Link
                                        key={project.id}
                                        to={`/projectsDetail?id=${project.id}&tab=overview`}
                                        className="group block p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                                        aria-label={`Project ${project.name}, status ${project.status}, progress ${project.progress}%`}
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                                    {project.name}
                                                </h4>
                                                {project.description && (
                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Badge
                                                    variant={
                                                        project.status === "COMPLETED"
                                                            ? "default"
                                                            : project.status === "IN_PROGRESS" || project.status === "ACTIVE"
                                                            ? "secondary"
                                                            : "outline"
                                                    }
                                                    className="text-[10px] px-1.5 py-0"
                                                >
                                                    {project.status.replace("_", " ")}
                                                </Badge>
                                                <Badge
                                                    variant={
                                                        project.priority === "HIGH"
                                                            ? "destructive"
                                                            : project.priority === "MEDIUM"
                                                            ? "secondary"
                                                            : "outline"
                                                    }
                                                    className="text-[10px] px-1.5 py-0"
                                                >
                                                    {project.priority}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                                                <div className="flex items-center gap-2">
                                                    {/* Team members */}
                                                    <div className="flex -space-x-1.5 overflow-hidden">
                                                        {(project.members || []).slice(0, 3).map((m) => (
                                                            <Avatar key={m.userId || m.id} className="size-4 ring-1 ring-white dark:ring-zinc-900">
                                                                <AvatarImage src={m.user?.image} />
                                                                <AvatarFallback className="text-[7px]">
                                                                    {m.user?.name?.[0] || "U"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                    </div>

                                                    {/* Due Date Indicator */}
                                                    {project.end_date && (
                                                        <span
                                                            className={`flex items-center gap-1 ${
                                                                isOverdue
                                                                    ? "text-red-600 dark:text-red-400 font-semibold"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <Calendar className="size-3" />
                                                            {format(new Date(project.end_date), "MMM d")}
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                                    {project.progress || 0}%
                                                </span>
                                            </div>

                                            <Progress value={project.progress || 0} className="h-1.5" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
