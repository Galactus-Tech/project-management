import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { CheckCircle, Clock, AlertTriangle, Users } from "lucide-react";
import { Project, Task, Priority } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Colors for charts and priorities
const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

interface ProjectAnalyticsProps {
    project?: Project | null;
    tasks: Task[];
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ project, tasks }) => {
    const { stats, statusData, typeData, priorityData } = useMemo(() => {
        const now = new Date();
        const total = tasks.length;

        const stats = {
            total,
            completed: 0,
            inProgress: 0,
            todo: 0,
            overdue: 0,
        };

        const statusMap: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
        const typeMap: Record<string, number> = { TASK: 0, BUG: 0, FEATURE: 0, IMPROVEMENT: 0, OTHER: 0 };
        const priorityMap: Record<Priority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };

        tasks.forEach((t) => {
            if (t.status === "DONE") stats.completed++;
            if (t.status === "IN_PROGRESS") stats.inProgress++;
            if (t.status === "TODO") stats.todo++;
            if (t.due_date && new Date(t.due_date) < now && t.status !== "DONE") stats.overdue++;

            if (statusMap[t.status] !== undefined) statusMap[t.status]++;
            if (typeMap[t.type] !== undefined) typeMap[t.type]++;
            if (priorityMap[t.priority] !== undefined) priorityMap[t.priority]++;
        });

        return {
            stats,
            statusData: Object.entries(statusMap).map(([k, v]) => ({ name: k.replace("_", " "), value: v })),
            typeData: Object.entries(typeMap).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k, value: v })),
            priorityData: (Object.entries(priorityMap) as [Priority, number][]).map(([k, v]) => ({
                name: k,
                value: v,
                percentage: total > 0 ? Math.round((v / total) * 100) : 0,
            })),
        };
    }, [tasks]);

    const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

    const metrics = [
        {
            label: "Completion Rate",
            value: `${completionRate}%`,
            color: "text-emerald-600 dark:text-emerald-400",
            icon: <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />,
            bg: "bg-emerald-100 dark:bg-emerald-500/10",
        },
        {
            label: "Active Tasks",
            value: stats.inProgress,
            color: "text-blue-600 dark:text-blue-400",
            icon: <Clock className="size-5 text-blue-600 dark:text-blue-400" />,
            bg: "bg-blue-100 dark:bg-blue-500/10",
        },
        {
            label: "Overdue Tasks",
            value: stats.overdue,
            color: "text-red-600 dark:text-red-400",
            icon: <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />,
            bg: "bg-red-100 dark:bg-red-500/10",
        },
        {
            label: "Team Size",
            value: project?.members?.length || 0,
            color: "text-purple-600 dark:text-purple-400",
            icon: <Users className="size-5 text-purple-600 dark:text-purple-400" />,
            bg: "bg-purple-100 dark:bg-purple-500/10",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <Card key={i}>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">{m.label}</p>
                                <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                            </div>
                            <div className={`p-2.5 rounded-lg ${m.bg}`}>{m.icon}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Tasks by Status */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">Tasks by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={statusData}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: "#71717a", fontSize: 12 }}
                                    axisLine={{ stroke: "#e4e4e7" }}
                                />
                                <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={{ stroke: "#e4e4e7" }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Tasks by Type */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">Tasks by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={85}
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {typeData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Priority Breakdown */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Tasks by Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {priorityData.map((p) => (
                        <div key={p.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-900 dark:text-zinc-200 capitalize font-medium">{p.name.toLowerCase()}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">{p.value} tasks</span>
                                    <Badge variant="outline" className="text-xs">
                                        {p.percentage}%
                                    </Badge>
                                </div>
                            </div>
                            <Progress value={p.percentage} />
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProjectAnalytics;
