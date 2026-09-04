import React, { useEffect, useState } from "react";
import { FolderOpen, CheckCircle, Users, AlertTriangle, LucideIcon } from "lucide-react";
import { useAppSelector } from "../app/store";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardItem {
    icon: LucideIcon;
    title: string;
    value: number;
    subtitle: string;
    iconBg: string;
    iconColor: string;
}

export default function StatsGrid() {
    const currentWorkspace = useAppSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );

    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        myTasks: 0,
        overdueIssues: 0,
    });

    useEffect(() => {
        if (currentWorkspace) {
            const now = new Date();
            setStats({
                totalProjects: currentWorkspace.projects.length,
                activeProjects: currentWorkspace.projects.filter(
                    (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
                ).length,
                completedProjects: currentWorkspace.projects
                    .filter((p) => p.status === "COMPLETED")
                    .reduce((acc, project) => acc + (project.tasks?.length || 0), 0),
                myTasks: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc +
                        (project.tasks || []).filter(
                            (t) =>
                                t.assignee?.email === currentWorkspace.owner?.email ||
                                t.assigneeId === "user_1"
                        ).length,
                    0
                ),
                overdueIssues: currentWorkspace.projects.reduce(
                    (acc, project) =>
                        acc +
                        (project.tasks || []).filter(
                            (t) => t.due_date && new Date(t.due_date) < now && t.status !== "DONE"
                        ).length,
                    0
                ),
            });
        }
    }, [currentWorkspace]);

    const statCards: StatCardItem[] = [
        {
            icon: FolderOpen,
            title: "Total Projects",
            value: stats.totalProjects,
            subtitle: `In ${currentWorkspace?.name || "workspace"}`,
            iconBg: "bg-blue-50 dark:bg-blue-950/50",
            iconColor: "text-blue-600 dark:text-blue-400",
        },
        {
            icon: CheckCircle,
            title: "Completed Tasks",
            value: stats.completedProjects,
            subtitle: "Delivered successfully",
            iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
            iconColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
            icon: Users,
            title: "My Tasks",
            value: stats.myTasks,
            subtitle: "Assigned to me",
            iconBg: "bg-purple-50 dark:bg-purple-950/50",
            iconColor: "text-purple-600 dark:text-purple-400",
        },
        {
            icon: AlertTriangle,
            title: "Overdue",
            value: stats.overdueIssues,
            subtitle: stats.overdueIssues > 0 ? "Requires attention" : "All on schedule",
            iconBg: stats.overdueIssues > 0 ? "bg-red-50 dark:bg-red-950/50" : "bg-zinc-100 dark:bg-zinc-800",
            iconColor: stats.overdueIssues > 0 ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400",
        },
    ];

    return (
        <section
            aria-label="Workspace Key Statistics"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4 sm:my-6"
        >
            {statCards.map((card, i) => (
                <Card
                    key={i}
                    role="status"
                    aria-label={`${card.title}: ${card.value}, ${card.subtitle}`}
                    className="border border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 shadow-2xs hover:shadow-xs"
                >
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">
                                    {card.title}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                    {card.value}
                                </p>
                                {card.subtitle && (
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                        {card.subtitle}
                                    </p>
                                )}
                            </div>
                            <div className={`p-2.5 rounded-xl shrink-0 ${card.iconBg}`}>
                                <card.icon className={`size-5 ${card.iconColor}`} aria-hidden="true" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}
