import React, { useState, useMemo } from "react";
import {
    Plus,
    Search,
    FolderOpen,
    LayoutGrid,
    List,
    X,
    AlertCircle,
    CheckCircle2,
    Clock,
    Briefcase,
    SlidersHorizontal,
    RotateCcw,
    Calendar,
    Users,
} from "lucide-react";
import ProjectCard, { getDeadlineInfo, getProjectProgress } from "../components/ProjectCard";
import CreateProjectDialog from "../components/CreateProjectDialog";
import { useAppSelector } from "../app/store";
import { Project, Priority } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProjectListSkeleton } from "../components/skeletons/ProjectListSkeleton";

export default function Projects() {
    const { currentWorkspace, loading } = useAppSelector((state) => state.workspace);
    const projects = currentWorkspace?.projects || [];
    const members = currentWorkspace?.members || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [deadlineFilter, setDeadlineFilter] = useState<string>("ALL");
    const [memberFilter, setMemberFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<string>("deadline-asc");

    // Metrics for the top stats banner
    const stats = useMemo(() => {
        const total = projects.length;
        const active = projects.filter((p) => p.status === "ACTIVE" || p.status === "IN_PROGRESS").length;
        const completed = projects.filter((p) => p.status === "COMPLETED").length;
        const overdue = projects.filter((p) => {
            if (p.status === "COMPLETED" || !p.end_date) return false;
            const info = getDeadlineInfo(p.end_date, p.status);
            return info.isOverdue;
        }).length;

        return { total, active, completed, overdue };
    }, [projects]);

    // Filter and sort projects
    const filteredProjects = useMemo(() => {
        let result = [...projects];

        // Search term filter
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(term) ||
                    p.description?.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (statusFilter !== "ALL") {
            if (statusFilter === "ACTIVE") {
                result = result.filter((p) => p.status === "ACTIVE" || p.status === "IN_PROGRESS");
            } else {
                result = result.filter((p) => p.status === statusFilter);
            }
        }

        // Priority filter
        if (priorityFilter !== "ALL") {
            result = result.filter((p) => p.priority === priorityFilter);
        }

        // Deadline filter
        if (deadlineFilter !== "ALL") {
            result = result.filter((p) => {
                const info = getDeadlineInfo(p.end_date, p.status);
                if (deadlineFilter === "OVERDUE") return info.isOverdue;
                if (deadlineFilter === "NEAR") return info.isNear;
                if (deadlineFilter === "COMPLETED") return p.status === "COMPLETED";
                if (deadlineFilter === "NO_DEADLINE") return !p.end_date;
                return true;
            });
        }

        // Team Lead / Member filter
        if (memberFilter !== "ALL") {
            result = result.filter(
                (p) =>
                    p.team_lead === memberFilter ||
                    p.owner?.id === memberFilter ||
                    (p.members || []).some((m) => m.userId === memberFilter || m.user?.id === memberFilter)
            );
        }

        // Sorting logic
        result.sort((a, b) => {
            switch (sortBy) {
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "progress-desc": {
                    const progA = getProjectProgress(a).percent;
                    const progB = getProjectProgress(b).percent;
                    return progB - progA;
                }
                case "progress-asc": {
                    const progA = getProjectProgress(a).percent;
                    const progB = getProjectProgress(b).percent;
                    return progA - progB;
                }
                case "deadline-asc": {
                    if (!a.end_date) return 1;
                    if (!b.end_date) return -1;
                    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
                }
                case "deadline-desc": {
                    if (!a.end_date) return 1;
                    if (!b.end_date) return -1;
                    return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
                }
                case "priority-desc": {
                    const score: Record<Priority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    return (score[b.priority] || 0) - (score[a.priority] || 0);
                }
                case "newest": {
                    if (!a.createdAt) return 1;
                    if (!b.createdAt) return -1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                default:
                    return 0;
            }
        });

        return result;
    }, [projects, searchTerm, statusFilter, priorityFilter, deadlineFilter, memberFilter, sortBy]);

    const hasActiveFilters =
        searchTerm !== "" ||
        statusFilter !== "ALL" ||
        priorityFilter !== "ALL" ||
        deadlineFilter !== "ALL" ||
        memberFilter !== "ALL" ||
        sortBy !== "deadline-asc";

    const activeFilterCount =
        (searchTerm ? 1 : 0) +
        (statusFilter !== "ALL" ? 1 : 0) +
        (priorityFilter !== "ALL" ? 1 : 0) +
        (deadlineFilter !== "ALL" ? 1 : 0) +
        (memberFilter !== "ALL" ? 1 : 0);

    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
        setDeadlineFilter("ALL");
        setMemberFilter("ALL");
        setSortBy("deadline-asc");
    };

    if (loading) {
        return <ProjectListSkeleton />;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        Projects Directory
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5">
                        Track progress, milestones, and deliverables across all {projects.length} initiatives
                    </p>
                </div>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="gap-2 cursor-pointer shadow-xs hover:scale-102 transition-transform duration-150"
                        >
                            <Plus className="size-4" /> New Project
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Create a new workspace project</TooltipContent>
                </Tooltip>

                <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Metric Summary Cards / Quick Filters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={() => setStatusFilter(statusFilter === "ALL" ? "ACTIVE" : "ALL")}
                            className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs ${
                                statusFilter === "ALL"
                                    ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20"
                                    : "hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total Projects</p>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{stats.total}</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                    <Briefcase className="size-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Click to show all workspace projects</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={() => setStatusFilter(statusFilter === "ACTIVE" ? "ALL" : "ACTIVE")}
                            className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs ${
                                statusFilter === "ACTIVE"
                                    ? "border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20"
                                    : "hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Active & In Progress</p>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{stats.active}</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                                    <Clock className="size-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Filter to active projects</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={() => setStatusFilter(statusFilter === "COMPLETED" ? "ALL" : "COMPLETED")}
                            className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs ${
                                statusFilter === "COMPLETED"
                                    ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/20"
                                    : "hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Completed</p>
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{stats.completed}</p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="size-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Filter to completed projects</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={() => setDeadlineFilter(deadlineFilter === "OVERDUE" ? "ALL" : "OVERDUE")}
                            className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-2xs ${
                                deadlineFilter === "OVERDUE"
                                    ? "border-red-500 dark:border-red-400 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20"
                                    : "hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Overdue Deadlines</p>
                                    <p
                                        className={`text-2xl font-bold mt-0.5 ${
                                            stats.overdue > 0
                                                ? "text-red-600 dark:text-red-400"
                                                : "text-zinc-900 dark:text-zinc-50"
                                        }`}
                                    >
                                        {stats.overdue}
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
                                    <AlertCircle className="size-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Filter to projects with overdue deadlines</TooltipContent>
                </Tooltip>
            </div>

            {/* Search, Filter & Sort Controls */}
            <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                {/* Left: Search & Filter dropdowns */}
                <div className="flex flex-1 flex-wrap items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 size-4 pointer-events-none" />
                        <Input
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                            className="pl-9 pr-8 h-9 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-800/60"
                            placeholder="Search projects by name..."
                            aria-label="Filter projects by search term"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                aria-label="Clear search text"
                            >
                                <X className="size-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Status Select */}
                    <div className="w-36">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="PLANNING">Planning</SelectItem>
                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority Select */}
                    <div className="w-36">
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Priority</SelectItem>
                                <SelectItem value="HIGH">High Priority</SelectItem>
                                <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                                <SelectItem value="LOW">Low Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort By Select */}
                    <div className="w-44">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-9 text-xs">
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="deadline-asc">Deadline: Earliest</SelectItem>
                                <SelectItem value="deadline-desc">Deadline: Latest</SelectItem>
                                <SelectItem value="progress-desc">Progress: Highest</SelectItem>
                                <SelectItem value="progress-asc">Progress: Lowest</SelectItem>
                                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                                <SelectItem value="priority-desc">Priority: High to Low</SelectItem>
                                <SelectItem value="newest">Recently Created</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Advanced Filter Popover */}
                    <Popover>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 text-xs gap-1.5 px-3 relative cursor-pointer"
                                    >
                                        <SlidersHorizontal className="size-3.5" />
                                        <span>Filters</span>
                                        {(deadlineFilter !== "ALL" || memberFilter !== "ALL") && (
                                            <span className="size-2 rounded-full bg-blue-500 absolute -top-1 -right-1" />
                                        )}
                                    </Button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">More filters: deadlines and team members</TooltipContent>
                        </Tooltip>

                        <PopoverContent align="start" className="w-80 p-4 space-y-4 shadow-xl">
                            <div>
                                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1">
                                    <Calendar className="size-3.5 text-blue-500" />
                                    Filter by Deadline
                                </h4>
                                <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                                    <SelectTrigger className="h-8 text-xs mt-1">
                                        <SelectValue placeholder="All Deadlines" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Any Deadline</SelectItem>
                                        <SelectItem value="OVERDUE">Overdue Only</SelectItem>
                                        <SelectItem value="NEAR">Due in 7 Days</SelectItem>
                                        <SelectItem value="NO_DEADLINE">No Deadline Set</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1">
                                    <Users className="size-3.5 text-purple-500" />
                                    Filter by Team Member / Lead
                                </h4>
                                <Select value={memberFilter} onValueChange={setMemberFilter}>
                                    <SelectTrigger className="h-8 text-xs mt-1">
                                        <SelectValue placeholder="All Members" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Team Members</SelectItem>
                                        {members.map((m) => (
                                            <SelectItem key={m.userId || m.id} value={m.userId || m.id}>
                                                {m.user?.name || "Member"} ({m.role})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                <span className="text-[11px] text-zinc-500">
                                    {filteredProjects.length} projects match
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setDeadlineFilter("ALL");
                                        setMemberFilter("ALL");
                                    }}
                                    className="h-7 text-xs px-2"
                                >
                                    Reset Popover
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Reset All Button */}
                    {hasActiveFilters && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="h-9 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 gap-1 px-2.5 cursor-pointer"
                                >
                                    <RotateCcw className="size-3.5" />
                                    Reset All
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Clear all active filters</TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Right: View mode toggle & item counter */}
                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        Showing <strong className="text-zinc-900 dark:text-zinc-100">{filteredProjects.length}</strong> of {projects.length}
                    </span>

                    <div className="flex items-center p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode("grid")}
                                    className={`h-7 w-7 rounded-md p-0 ${
                                        viewMode === "grid"
                                            ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-xs"
                                            : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    }`}
                                    aria-label="Switch to Grid View"
                                >
                                    <LayoutGrid className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Grid View</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                    className={`h-7 w-7 rounded-md p-0 ${
                                        viewMode === "list"
                                            ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-xs"
                                            : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    }`}
                                    aria-label="Switch to List View"
                                >
                                    <List className="size-3.5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">List View</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Interactive Filter Pills/Chips */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5" aria-label="Active filters">
                    <span className="text-zinc-500 font-medium text-[11px]">Active filters:</span>

                    {searchTerm && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setSearchTerm("")}
                        >
                            <span>Search: "{searchTerm}"</span>
                            <X className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    {statusFilter !== "ALL" && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setStatusFilter("ALL")}
                        >
                            <span>Status: {statusFilter.replace("_", " ")}</span>
                            <X className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    {priorityFilter !== "ALL" && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setPriorityFilter("ALL")}
                        >
                            <span>Priority: {priorityFilter}</span>
                            <X className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    {deadlineFilter !== "ALL" && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setDeadlineFilter("ALL")}
                        >
                            <span>Deadline: {deadlineFilter.replace("_", " ")}</span>
                            <X className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    {memberFilter !== "ALL" && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setMemberFilter("ALL")}
                        >
                            <span>Member Filtered</span>
                            <X className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    <button
                        onClick={handleResetFilters}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
                    >
                        Clear all ({activeFilterCount})
                    </button>
                </div>
            )}

            {/* Projects Presentation (Grid or List) */}
            {filteredProjects.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/30">
                    <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                        <FolderOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">
                        No projects found
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-5 text-xs max-w-sm mx-auto">
                        {hasActiveFilters
                            ? "No projects match your current filter criteria. Try resetting or adjusting the filters."
                            : "Get started by creating your first workspace project."}
                    </p>
                    {hasActiveFilters ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                            className="gap-1.5 mx-auto cursor-pointer"
                        >
                            <RotateCcw className="size-3.5" />
                            Reset Filters
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => setIsDialogOpen(true)}
                            className="gap-1.5 mx-auto cursor-pointer"
                        >
                            <Plus className="size-4" />
                            Create Project
                        </Button>
                    )}
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} viewMode="grid" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} viewMode="list" />
                    ))}
                </div>
            )}
        </div>
    );
}
