import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    ListTodo,
    ArrowUpRight,
    TrendingUp,
    BarChart2,
    Flame,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "../../app/store";
import { Task } from "../../types";

export const TaskProgressAnalytics: React.FC = () => {
    const { currentWorkspace, user } = useAppSelector((state) => state.workspace);
    const [scope, setScope] = useState<"all" | "mine">("all");

    const allTasks: Task[] = (currentWorkspace?.projects || []).flatMap(
        (project) => project.tasks || []
    );

    const filteredTasks =
        scope === "mine"
            ? allTasks.filter(
                  (t) =>
                      t.assigneeId === user?.id ||
                      t.assignee?.id === user?.id ||
                      t.assignee?.email === user?.email
              )
            : allTasks;

    const total = filteredTasks.length;
    const doneTasks = filteredTasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todoTasks = filteredTasks.filter((t) => t.status === "TODO").length;

    const completionRate = total > 0 ? Math.round((doneTasks / total) * 100) : 0;

    // Priority breakdowns
    const highPriority = filteredTasks.filter((t) => t.priority === "HIGH");
    const mediumPriority = filteredTasks.filter((t) => t.priority === "MEDIUM");
    const lowPriority = filteredTasks.filter((t) => t.priority === "LOW");

    // Overdue count
    const overdueCount = filteredTasks.filter((t) => {
        if (!t.due_date || t.status === "DONE") return false;
        return new Date(t.due_date) < new Date();
    }).length;

    return (
        <Card className="overflow-hidden" role="region" aria-label="Task Progress Analytics">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-row items-center justify-between gap-2 flex-wrap">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                            <BarChart2 className="size-4" />
                        </div>
                        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            Task Progress & Velocity
                        </CardTitle>
                    </div>
                    <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Real-time delivery status across {currentWorkspace?.name || "workspace"}
                    </CardDescription>
                </div>

                {/* Scope Switcher: All vs My Tasks */}
                <div className="flex items-center gap-1 p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs" role="tablist" aria-label="Task scope filter">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={scope === "all"}
                        onClick={() => setScope("all")}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            scope === "all"
                                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                    >
                        Workspace
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={scope === "mine"}
                        onClick={() => setScope("mine")}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            scope === "mine"
                                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                        }`}
                    >
                        Assigned to Me
                    </button>
                </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-6">
                {/* Main Completion Rate Bar with Multi-Segment Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            Completion Rate
                        </span>
                        <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                            {completionRate}%
                            <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500 ml-1">
                                ({doneTasks}/{total} tasks)
                            </span>
                        </span>
                    </div>

                    {/* Visual Segmented Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 flex overflow-hidden p-0.5 gap-0.5" role="progressbar" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100} aria-label={`${completionRate}% tasks completed`}>
                        {total > 0 ? (
                            <>
                                <div
                                    style={{ width: `${(doneTasks / total) * 100}%` }}
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    title={`Done: ${doneTasks}`}
                                />
                                <div
                                    style={{ width: `${(inProgressTasks / total) * 100}%` }}
                                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                    title={`In Progress: ${inProgressTasks}`}
                                />
                                <div
                                    style={{ width: `${(todoTasks / total) * 100}%` }}
                                    className="h-full bg-zinc-300 dark:bg-zinc-700 rounded-full transition-all duration-500"
                                    title={`To Do: ${todoTasks}`}
                                />
                            </>
                        ) : (
                            <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                        )}
                    </div>
                </div>

                {/* Status KPI Metric Boxes */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                                Done
                            </span>
                            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                            {doneTasks}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                                In Progress
                            </span>
                            <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-xl font-bold text-amber-800 dark:text-amber-200">
                            {inProgressTasks}
                        </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                                To Do
                            </span>
                            <ListTodo className="size-3.5 text-zinc-400" />
                        </div>
                        <p className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                            {todoTasks}
                        </p>
                    </div>
                </div>

                {/* Priority Breakdown & Overdue Alert */}
                <div className="space-y-3 pt-1">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                        Priority Distribution
                    </span>

                    <div className="space-y-2 text-xs">
                        {/* High */}
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 min-w-[70px]">
                                <span className="size-2 rounded-full bg-red-500" /> High
                            </span>
                            <Progress
                                value={total > 0 ? (highPriority.length / total) * 100 : 0}
                                className="h-2 flex-1"
                            />
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 w-8 text-right">
                                {highPriority.length}
                            </span>
                        </div>

                        {/* Medium */}
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 min-w-[70px]">
                                <span className="size-2 rounded-full bg-amber-500" /> Medium
                            </span>
                            <Progress
                                value={total > 0 ? (mediumPriority.length / total) * 100 : 0}
                                className="h-2 flex-1"
                            />
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 w-8 text-right">
                                {mediumPriority.length}
                            </span>
                        </div>

                        {/* Low */}
                        <div className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 min-w-[70px]">
                                <span className="size-2 rounded-full bg-blue-400" /> Low
                            </span>
                            <Progress
                                value={total > 0 ? (lowPriority.length / total) * 100 : 0}
                                className="h-2 flex-1"
                            />
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 w-8 text-right">
                                {lowPriority.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Overdue alert banner if any */}
                {overdueCount > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                            <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                            <span>
                                <strong>{overdueCount}</strong> task{overdueCount > 1 ? "s are" : " is"} overdue and require attention.
                            </span>
                        </div>
                        <Badge variant="destructive" className="text-[10px] shrink-0">
                            Action Needed
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
