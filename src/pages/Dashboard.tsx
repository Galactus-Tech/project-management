import React, { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import StatsGrid from "../components/StatsGrid";
import { TaskProgressAnalytics } from "../components/dashboard/TaskProgressAnalytics";
import { ProjectSummaryCard } from "../components/dashboard/ProjectSummaryCard";
import RecentActivity from "../components/RecentActivity";
import TasksSummary from "../components/TasksSummary";
import CreateProjectDialog from "../components/CreateProjectDialog";
import { DashboardSkeleton } from "../components/skeletons/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "../app/store";

const Dashboard: React.FC = () => {
    const { currentWorkspace, loading, user } = useAppSelector((state) => state.workspace);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

    if (loading) {
        return <DashboardSkeleton />;
    }

    const userName = user?.name || "Team Member";

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Welcome back, {userName}
                        </h1>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                        Here's your workspace overview for{" "}
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                            {currentWorkspace?.name || "your workspace"}
                        </span>
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        size="sm"
                        className="gap-2 text-xs sm:text-sm h-9 w-full sm:w-auto shadow-xs"
                        aria-label="Create a new project"
                    >
                        <Plus className="size-4" /> New Project
                    </Button>
                </div>

                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Key Statistics Grid */}
            <StatsGrid />

            {/* Dashboard Analytics & Summary Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Task Progress Analytics & Project Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Task Progress & Velocity Analytics Card */}
                    <TaskProgressAnalytics />

                    {/* Project Portfolio Summary Card */}
                    <ProjectSummaryCard onOpenCreateProject={() => setIsDialogOpen(true)} />

                    {/* Recent Workspace Activity */}
                    <RecentActivity />
                </div>

                {/* Right Column: Tasks Summary and Action Items */}
                <div className="space-y-6">
                    <TasksSummary />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
