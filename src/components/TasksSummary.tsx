import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, AlertTriangle, User, LucideIcon } from "lucide-react";
import { useAppSelector } from "../app/store";
import { Task } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SummaryCardItem {
    title: string;
    count: number;
    icon: LucideIcon;
    items: Task[];
}

export default function TasksSummary() {
    const navigate = useNavigate();
    const { currentWorkspace, user } = useAppSelector((state) => state.workspace);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (currentWorkspace) {
            setTasks(currentWorkspace.projects.flatMap((project) => project.tasks || []));
        }
    }, [currentWorkspace]);

    const myTasks = tasks.filter(
        (i) =>
            i.assigneeId === user?.id ||
            i.assignee?.id === user?.id ||
            i.assignee?.email === user?.email ||
            i.assigneeId === "user_1"
    );
    const overdueTasks = tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "DONE"
    );
    const inProgressIssues = tasks.filter((i) => i.status === "IN_PROGRESS");

    const summaryCards: SummaryCardItem[] = [
        {
            title: "Assigned to Me",
            count: myTasks.length,
            icon: User,
            items: myTasks.slice(0, 3),
        },
        {
            title: "Overdue Tasks",
            count: overdueTasks.length,
            icon: AlertTriangle,
            items: overdueTasks.slice(0, 3),
        },
        {
            title: "In Progress",
            count: inProgressIssues.length,
            icon: Clock,
            items: inProgressIssues.slice(0, 3),
        },
    ];

    const handleTaskClick = (task: Task) => {
        navigate(`/taskDetails?projectId=${task.projectId}&taskId=${task.id}`);
    };

    return (
        <aside className="space-y-4" aria-label="Task Action Summaries">
            {summaryCards.map((card) => (
                <Card
                    key={card.title}
                    className="overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-2xs"
                >
                    <CardHeader className="p-3.5 pb-2.5 border-b border-zinc-200/80 dark:border-zinc-800">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400">
                                <card.icon className="size-4" aria-hidden="true" />
                            </div>
                            <div className="flex items-center justify-between flex-1">
                                <CardTitle className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                    {card.title}
                                </CardTitle>
                                <Badge
                                    variant={
                                        card.title === "Overdue Tasks" && card.count > 0
                                            ? "destructive"
                                            : "secondary"
                                    }
                                    className="text-[10px] px-1.5 py-0"
                                >
                                    {card.count}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-3.5">
                        {card.items.length === 0 ? (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-3">
                                No tasks currently {card.title.toLowerCase()}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {card.items.map((task) => (
                                    <div
                                        key={task.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleTaskClick(task)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                handleTaskClick(task);
                                            }
                                        }}
                                        className="p-2.5 rounded-lg bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                                        aria-label={`Open task ${task.title}, priority ${task.priority}`}
                                    >
                                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                            <span className="capitalize">{task.type.toLowerCase()}</span>
                                            <span
                                                className={`font-medium ${
                                                    task.priority === "HIGH"
                                                        ? "text-red-600 dark:text-red-400"
                                                        : ""
                                                }`}
                                            >
                                                {task.priority.toLowerCase()} priority
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {card.count > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => navigate("/projects")}
                                        className="flex items-center justify-center w-full text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 pt-1 transition-colors"
                                    >
                                        View all ({card.count}) <ArrowRight className="size-3 ml-1" />
                                    </button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </aside>
    );
}
