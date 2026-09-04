import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    SettingsIcon,
    BarChart3Icon,
    CalendarIcon,
    FileStackIcon,
    LayoutDashboardIcon,
    UserPlusIcon,
} from "lucide-react";
import ProjectAnalytics from "../components/ProjectAnalytics";
import ProjectSettings from "../components/ProjectSettings";
import CreateTaskDialog from "../components/CreateTaskDialog";
import AddProjectMember from "../components/AddProjectMember";
import ProjectCalendar from "../components/ProjectCalendar";
import ProjectTasks from "../components/ProjectTasks";
import { ProjectDetailOverview } from "../components/ProjectDetailOverview";
import { useAppSelector } from "../app/store";
import { Project, Task } from "../types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { renderPriorityBadge, renderStatusBadge } from "../components/ProjectCard";
import { ProjectDetailsSkeleton } from "../components/skeletons/ProjectListSkeleton";

export default function ProjectDetail() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab');
    const id = searchParams.get('id');

    const navigate = useNavigate();
    const { currentWorkspace, loading } = useAppSelector((state) => state.workspace);
    const projects = currentWorkspace?.projects || [];

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
    const [showAddMember, setShowAddMember] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>(tab || "overview");

    useEffect(() => {
        if (tab) {
            setActiveTab(tab);
        }
    }, [tab]);

    useEffect(() => {
        if (projects && projects.length > 0 && id) {
            const proj = projects.find((p) => p.id === id);
            setProject(proj || null);
            setTasks(proj?.tasks || []);
        }
    }, [id, projects]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        if (id) {
            setSearchParams({ id, tab: val });
        }
    };

    if (loading) {
        return <ProjectDetailsSkeleton />;
    }

    if (!project) {
        return (
            <div className="p-8 text-center text-zinc-900 dark:text-zinc-100 max-w-md mx-auto my-24">
                <div className="size-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <ArrowLeftIcon className="size-6 text-zinc-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                    The requested project could not be found or you may not have permission to view it.
                </p>
                <Button
                    onClick={() => navigate('/projects')}
                    variant="outline"
                    className="gap-2"
                >
                    <ArrowLeftIcon className="size-4" />
                    Back to Projects
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto text-zinc-900 dark:text-white">
            {/* Top Navigation & Breadcrumb */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg cursor-pointer"
                        onClick={() => navigate('/projects')}
                        title="Back to Projects"
                    >
                        <ArrowLeftIcon className="size-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
                            <Link to="/projects" className="hover:text-zinc-900 dark:hover:text-zinc-200">
                                Projects
                            </Link>
                            <span>/</span>
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-xs">
                                {project.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                {project.name}
                            </h1>
                            {renderStatusBadge(project.status)}
                            {renderPriorityBadge(project.priority)}
                        </div>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddMember(true)}
                        className="gap-1.5 text-xs h-9"
                    >
                        <UserPlusIcon className="size-3.5" />
                        Add Member
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setShowCreateTask(true)}
                        className="gap-1.5 text-xs h-9 shadow-xs"
                    >
                        <PlusIcon className="size-3.5" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Main Tabs Navigation */}
            <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
            >
                <TabsList className="bg-zinc-100 dark:bg-zinc-800/80 p-1 w-full max-w-full overflow-x-auto no-scrollbar justify-start sm:justify-center">
                    <TabsTrigger value="overview" className="gap-2 text-xs sm:text-sm">
                        <LayoutDashboardIcon className="size-3.5" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="gap-2 text-xs sm:text-sm">
                        <FileStackIcon className="size-3.5" />
                        Tasks ({tasks.length})
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="gap-2 text-xs sm:text-sm">
                        <CalendarIcon className="size-3.5" />
                        Calendar
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2 text-xs sm:text-sm">
                        <BarChart3Icon className="size-3.5" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2 text-xs sm:text-sm">
                        <SettingsIcon className="size-3.5" />
                        Settings
                    </TabsTrigger>
                </TabsList>

                {/* Tab Contents */}
                <div className="mt-6">
                    {activeTab === "overview" && (
                        <ProjectDetailOverview
                            project={project}
                            tasks={tasks}
                            onNavigateTab={handleTabChange}
                            onOpenCreateTask={() => setShowCreateTask(true)}
                            onOpenAddMember={() => setShowAddMember(true)}
                        />
                    )}

                    {activeTab === "tasks" && (
                        <div className="rounded-lg max-w-6xl">
                            <ProjectTasks tasks={tasks} projectId={project.id} />
                        </div>
                    )}

                    {activeTab === "calendar" && (
                        <div className="rounded-lg max-w-6xl">
                            <ProjectCalendar tasks={tasks} projectId={project.id} />
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div className="rounded-lg max-w-6xl">
                            <ProjectAnalytics tasks={tasks} project={project} />
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="rounded-lg max-w-6xl">
                            <ProjectSettings project={project} />
                        </div>
                    )}
                </div>
            </Tabs>

            {/* Create Task Modal */}
            {showCreateTask && (
                <CreateTaskDialog
                    showCreateTask={showCreateTask}
                    setShowCreateTask={setShowCreateTask}
                    projectId={id || undefined}
                />
            )}

            {/* Add Member Modal */}
            {showAddMember && (
                <AddProjectMember
                    isDialogOpen={showAddMember}
                    setIsDialogOpen={setShowAddMember}
                />
            )}
        </div>
    );
}
