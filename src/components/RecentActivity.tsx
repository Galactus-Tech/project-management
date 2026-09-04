import React, { useEffect, useState, useCallback } from "react";
import { GitCommit, MessageSquare, Clock, Bug, Zap, Square, LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { useAppSelector } from "../app/store";
import { Task, TaskType, TaskStatus } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TypeIconConfig {
    icon: LucideIcon;
    color: string;
}

const typeIcons: Record<TaskType, TypeIconConfig> = {
    BUG: { icon: Bug, color: "text-red-500 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-500 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-green-500 dark:text-green-400" },
    IMPROVEMENT: { icon: MessageSquare, color: "text-amber-500 dark:text-amber-400" },
    OTHER: { icon: GitCommit, color: "text-purple-500 dark:text-purple-400" },
};

const statusVariants: Record<TaskStatus, "default" | "secondary" | "outline"> = {
    TODO: "outline",
    IN_PROGRESS: "secondary",
    DONE: "default",
};

const RecentActivity: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const { currentWorkspace } = useAppSelector((state) => state.workspace);

    const getTasksFromCurrentWorkspace = useCallback(() => {
        if (!currentWorkspace) return;
        const allTasks = currentWorkspace.projects.flatMap((project) => project.tasks || []);
        setTasks(allTasks);
    }, [currentWorkspace]);

    useEffect(() => {
        getTasksFromCurrentWorkspace();
    }, [getTasksFromCurrentWorkspace]);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 p-4">
                <CardTitle className="text-md text-zinc-900 dark:text-zinc-100 font-medium">Recent Activity</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
                {tasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <Clock className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400">No recent activity</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {tasks.slice(0, 8).map((task) => {
                            const TypeIcon = typeIcons[task.type]?.icon || Square;
                            const iconColor = typeIcons[task.type]?.color || "text-zinc-500 dark:text-zinc-400";

                            return (
                                <div key={task.id} className="p-4 sm:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                            <TypeIcon className={`w-4 h-4 ${iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1.5">
                                                <h4 className="text-zinc-900 dark:text-zinc-100 truncate font-medium text-sm">
                                                    {task.title}
                                                </h4>
                                                <Badge
                                                    variant={statusVariants[task.status] || "secondary"}
                                                    className="ml-2"
                                                >
                                                    {task.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span className="capitalize">{task.type.toLowerCase()}</span>
                                                {task.assignee && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Avatar className="size-4">
                                                            <AvatarImage src={task.assignee.image} alt={task.assignee.name} />
                                                            <AvatarFallback className="text-[9px]">
                                                                {task.assignee.name ? task.assignee.name[0].toUpperCase() : 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>{task.assignee.name}</span>
                                                    </div>
                                                )}
                                                {task.updatedAt && (
                                                    <span>
                                                        {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default RecentActivity;
