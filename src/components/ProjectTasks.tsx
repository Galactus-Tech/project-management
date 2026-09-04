import React, { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store";
import { deleteTask, updateTask } from "../features/workspaceSlice";
import {
    Bug,
    CalendarIcon,
    GitCommit,
    MessageSquare,
    Square,
    Trash,
    XIcon,
    Zap,
    LucideIcon,
    Kanban,
    List,
    Plus,
    Search,
    Paperclip,
    CheckSquare,
    MoreHorizontal,
    Eye,
    ArrowRight,
    AlertCircle,
    UserCheck,
    Clock,
} from "lucide-react";
import { Task, TaskType, Priority, TaskStatus } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { KanbanBoard } from "./kanban/KanbanBoard";
import { TaskQuickViewDialog } from "./task/TaskQuickViewDialog";
import CreateTaskDialog from "./CreateTaskDialog";

interface TypeIconConfig {
    icon: LucideIcon;
    color: string;
}

const typeIcons: Record<TaskType, TypeIconConfig> = {
    BUG: { icon: Bug, color: "text-red-500 dark:text-red-400" },
    FEATURE: { icon: Zap, color: "text-blue-500 dark:text-blue-400" },
    TASK: { icon: Square, color: "text-emerald-500 dark:text-emerald-400" },
    IMPROVEMENT: { icon: GitCommit, color: "text-purple-500 dark:text-purple-400" },
    OTHER: { icon: MessageSquare, color: "text-amber-500 dark:text-amber-400" },
};

interface ProjectTasksProps {
    tasks: Task[];
    projectId?: string;
}

const ProjectTasks: React.FC<ProjectTasksProps> = ({ tasks, projectId: propProjectId }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentWorkspace = useAppSelector((state) => state.workspace.currentWorkspace);

    const resolvedProjectId = propProjectId || searchParams.get("id") || tasks[0]?.projectId || "";
    const project = currentWorkspace?.projects?.find((p) => p.id === resolvedProjectId);
    const members = project?.members || currentWorkspace?.members || [];

    const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [quickViewTask, setQuickViewTask] = useState<Task | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [filters, setFilters] = useState({
        status: "",
        type: "",
        priority: "",
        assignee: "",
    });

    const assigneeList = useMemo(
        () => Array.from(new Set(tasks.map((t) => t.assignee?.name).filter((n): n is string => Boolean(n)))),
        [tasks]
    );

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const { status, type, priority, assignee } = filters;
            const matchesStatus = !status || task.status === status;
            const matchesType = !type || task.type === type;
            const matchesPriority = !priority || task.priority === priority;
            const matchesAssignee = !assignee || task.assignee?.name === assignee;
            const matchesSearch =
                !searchQuery.trim() ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesStatus && matchesType && matchesPriority && matchesAssignee && matchesSearch;
        });
    }, [filters, tasks, searchQuery]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
        const taskToUpdate = tasks.find((t) => t.id === taskId);
        if (!taskToUpdate) return;
        const updatedTask: Task = {
            ...taskToUpdate,
            status: newStatus,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updatedTask));
        toast.success(`Moved to ${newStatus.replace("_", " ")}`);
    };

    const handlePriorityChange = (taskId: string, newPriority: Priority) => {
        const taskToUpdate = tasks.find((t) => t.id === taskId);
        if (!taskToUpdate) return;
        const updatedTask: Task = {
            ...taskToUpdate,
            priority: newPriority,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updatedTask));
        toast.success(`Priority set to ${newPriority}`);
    };

    const handleAssigneeChange = (taskId: string, userId: string) => {
        const taskToUpdate = tasks.find((t) => t.id === taskId);
        if (!taskToUpdate) return;
        const targetMember = members.find((m) => m.userId === userId || m.user?.id === userId);
        const updatedTask: Task = {
            ...taskToUpdate,
            assigneeId: userId,
            assignee: targetMember?.user,
            updatedAt: new Date().toISOString(),
        };
        dispatch(updateTask(updatedTask));
        toast.success(`Assigned to ${targetMember?.user?.name || "Member"}`);
    };

    const handleDeleteSelected = () => {
        if (selectedTasks.length === 0) return;
        if (window.confirm(`Delete ${selectedTasks.length} selected task(s)?`)) {
            dispatch(deleteTask(selectedTasks));
            setSelectedTasks([]);
            toast.success("Selected tasks deleted");
        }
    };

    const handleDeleteSingle = (taskId: string) => {
        dispatch(deleteTask([taskId]));
        toast.success("Task deleted");
    };

    const hasActiveFilters = Boolean(
        filters.status || filters.type || filters.priority || filters.assignee || searchQuery.trim()
    );

    // Keep quickViewTask fresh with current Redux tasks
    const currentQuickViewTask = quickViewTask
        ? tasks.find((t) => t.id === quickViewTask.id) || quickViewTask
        : null;

    return (
        <div className="space-y-4">
            {/* Top Bar: View Switcher, Search, Filters, and New Task */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg shrink-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => setViewMode("kanban")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                                    viewMode === "kanban"
                                        ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-xs"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                                }`}
                                aria-label="Switch to Kanban Board view"
                            >
                                <Kanban className="size-3.5" />
                                <span>Kanban Board</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Interactive Drag & Drop Board</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                onClick={() => setViewMode("table")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                                    viewMode === "table"
                                        ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-xs"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                                }`}
                                aria-label="Switch to List Table view"
                            >
                                <List className="size-3.5" />
                                <span>List Table</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Structured List & Batch Actions</TooltipContent>
                    </Tooltip>
                </div>

                {/* Right Controls: Search + New Task */}
                <div className="flex items-center gap-2 flex-1 sm:justify-end">
                    <div className="relative flex-1 sm:max-w-xs">
                        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 text-xs pl-8 pr-7 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                            aria-label="Filter tasks by search query"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                                aria-label="Clear task search query"
                            >
                                <XIcon className="size-3" />
                            </button>
                        )}
                    </div>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                size="sm"
                                onClick={() => setIsCreateOpen(true)}
                                className="h-8 text-xs gap-1.5 px-3 shrink-0 cursor-pointer hover:scale-102 transition-transform"
                                aria-label="Create new task"
                            >
                                <Plus className="size-3.5" />
                                New Task
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Create a new task in this project</TooltipContent>
                    </Tooltip>
                </div>
            </div>

            {/* Filter Dropdowns Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                {/* Status */}
                <div className="w-32">
                    <Select
                        value={filters.status || "ALL"}
                        onValueChange={(val) => setFilters((prev) => ({ ...prev, status: val === "ALL" ? "" : val }))}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Type */}
                <div className="w-32">
                    <Select
                        value={filters.type || "ALL"}
                        onValueChange={(val) => setFilters((prev) => ({ ...prev, type: val === "ALL" ? "" : val }))}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="TASK">Task</SelectItem>
                            <SelectItem value="BUG">Bug</SelectItem>
                            <SelectItem value="FEATURE">Feature</SelectItem>
                            <SelectItem value="IMPROVEMENT">Improvement</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Priority */}
                <div className="w-32">
                    <Select
                        value={filters.priority || "ALL"}
                        onValueChange={(val) => setFilters((prev) => ({ ...prev, priority: val === "ALL" ? "" : val }))}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Priorities</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Assignee */}
                <div className="w-36">
                    <Select
                        value={filters.assignee || "ALL"}
                        onValueChange={(val) => setFilters((prev) => ({ ...prev, assignee: val === "ALL" ? "" : val }))}
                    >
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Assignees" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Assignees</SelectItem>
                            {assigneeList.map((n) => (
                                <SelectItem key={n} value={n}>
                                    {n}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFilters({ status: "", type: "", priority: "", assignee: "" });
                                    setSearchQuery("");
                                }}
                                className="h-8 text-xs gap-1 px-2.5 cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                                <XIcon className="size-3" /> Reset
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Clear all task filters</TooltipContent>
                    </Tooltip>
                )}

                {/* Batch Delete (Table View) */}
                {viewMode === "table" && selectedTasks.length > 0 && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleDeleteSelected}
                                className="h-8 text-xs gap-1.5 ml-auto cursor-pointer"
                            >
                                <Trash className="size-3" /> Delete Selected ({selectedTasks.length})
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Permanently delete selected tasks</TooltipContent>
                    </Tooltip>
                )}
            </div>

            {/* Interactive Filter Pills */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                    <span className="text-zinc-500 font-medium text-[11px]">Filtered by:</span>

                    {searchQuery && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setSearchQuery("")}
                        >
                            <span>Search: "{searchQuery}"</span>
                            <XIcon className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    {filters.status && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setFilters((p) => ({ ...p, status: "" }))}
                        >
                            <span>Status: {filters.status.replace("_", " ")}</span>
                            <XIcon className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    {filters.type && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setFilters((p) => ({ ...p, type: "" }))}
                        >
                            <span>Type: {filters.type}</span>
                            <XIcon className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    {filters.priority && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setFilters((p) => ({ ...p, priority: "" }))}
                        >
                            <span>Priority: {filters.priority}</span>
                            <XIcon className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    {filters.assignee && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-normal cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            onClick={() => setFilters((p) => ({ ...p, assignee: "" }))}
                        >
                            <span>Assignee: {filters.assignee}</span>
                            <XIcon className="size-3 text-zinc-400 hover:text-zinc-900 dark:hover:text-white" />
                        </Badge>
                    )}

                    <button
                        onClick={() => {
                            setFilters({ status: "", type: "", priority: "", assignee: "" });
                            setSearchQuery("");
                        }}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer ml-1"
                    >
                        Clear all
                    </button>
                </div>
            )}

            {/* View Content: Kanban vs Table */}
            {viewMode === "kanban" ? (
                <KanbanBoard tasks={filteredTasks} projectId={resolvedProjectId} />
            ) : (
                /* Enhanced Table View */
                <div className="overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xs">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent bg-zinc-50/50 dark:bg-zinc-900/50">
                                    <TableHead className="w-10">
                                        <input
                                            onChange={() =>
                                                selectedTasks.length > 0
                                                    ? setSelectedTasks([])
                                                    : setSelectedTasks(filteredTasks.map((t) => t.id))
                                            }
                                            checked={
                                                filteredTasks.length > 0 &&
                                                selectedTasks.length === filteredTasks.length
                                            }
                                            type="checkbox"
                                            className="size-3.5 rounded accent-blue-600"
                                        />
                                    </TableHead>
                                    <TableHead className="min-w-[200px]">Task Title</TableHead>
                                    <TableHead className="w-24">Type</TableHead>
                                    <TableHead className="w-24">Priority</TableHead>
                                    <TableHead className="w-32">Status</TableHead>
                                    <TableHead className="w-40">Assignee</TableHead>
                                    <TableHead className="w-28">Subtasks</TableHead>
                                    <TableHead className="w-28">Due Date</TableHead>
                                    <TableHead className="w-14 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => {
                                        const { icon: Icon, color } = typeIcons[task.type] || {};
                                        const subtasks = task.subtasks || [];
                                        const completedSub = subtasks.filter((s) => s.completed).length;
                                        const attachmentsCount = (task.attachments || []).length;
                                        const commentsCount = (task.comments || []).length;

                                        const taskDueDate = task.due_date ? new Date(task.due_date) : null;
                                        let isOverdue = false;
                                        if (taskDueDate && task.status !== "DONE") {
                                            isOverdue = differenceInDays(taskDueDate, new Date()) < 0;
                                        }

                                        return (
                                            <TableRow
                                                key={task.id}
                                                onClick={() => setQuickViewTask(task)}
                                                className="cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60"
                                            >
                                                {/* Checkbox */}
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="size-3.5 rounded accent-blue-600"
                                                        onChange={() =>
                                                            selectedTasks.includes(task.id)
                                                                ? setSelectedTasks(
                                                                      selectedTasks.filter((i) => i !== task.id)
                                                                  )
                                                                : setSelectedTasks((prev) => [...prev, task.id])
                                                        }
                                                        checked={selectedTasks.includes(task.id)}
                                                    />
                                                </TableCell>

                                                {/* Title & Metadata Pills */}
                                                <TableCell>
                                                    <div className="space-y-0.5">
                                                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400">
                                                            {task.title}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                                            {attachmentsCount > 0 && (
                                                                <span className="inline-flex items-center gap-0.5">
                                                                    <Paperclip className="size-2.5" />
                                                                    {attachmentsCount}
                                                                </span>
                                                            )}
                                                            {commentsCount > 0 && (
                                                                <span className="inline-flex items-center gap-0.5">
                                                                    <MessageSquare className="size-2.5" />
                                                                    {commentsCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Type */}
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        {Icon && <Icon className={`size-3.5 ${color}`} />}
                                                        <span className={`uppercase text-[11px] font-medium ${color}`}>
                                                            {task.type}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {/* Priority */}
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            task.priority === "HIGH"
                                                                ? "destructive"
                                                                : task.priority === "MEDIUM"
                                                                ? "secondary"
                                                                : "outline"
                                                        }
                                                        className="text-[10px] px-1.5 py-0"
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                </TableCell>

                                                {/* Status Selector */}
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        name="status"
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                task.id,
                                                                e.target.value as TaskStatus
                                                            )
                                                        }
                                                        value={task.status}
                                                        className="h-7 px-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-zinc-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                                                    >
                                                        <option value="TODO">To Do</option>
                                                        <option value="IN_PROGRESS">In Progress</option>
                                                        <option value="DONE">Done</option>
                                                    </select>
                                                </TableCell>

                                                {/* Assignee Indicator & Switcher */}
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button
                                                                type="button"
                                                                className="flex items-center gap-1.5 px-1.5 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
                                                            >
                                                                <Avatar className="size-5 shrink-0">
                                                                    <AvatarImage
                                                                        src={task.assignee?.image}
                                                                        alt={task.assignee?.name}
                                                                    />
                                                                    <AvatarFallback className="text-[9px]">
                                                                        {task.assignee?.name?.[0] || "?"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs truncate max-w-[90px]">
                                                                    {task.assignee?.name || "Unassigned"}
                                                                </span>
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="start" className="w-48 max-h-56 overflow-y-auto text-xs">
                                                            <DropdownMenuLabel className="text-xs">Reassign</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            {members.map((m) => (
                                                                <DropdownMenuItem
                                                                    key={m.userId || m.id}
                                                                    onClick={() =>
                                                                        handleAssigneeChange(
                                                                            task.id,
                                                                            m.userId || m.user?.id
                                                                        )
                                                                    }
                                                                    className="flex items-center gap-2 text-xs"
                                                                >
                                                                    <Avatar className="size-4">
                                                                        <AvatarImage src={m.user?.image} />
                                                                        <AvatarFallback className="text-[8px]">
                                                                            {m.user?.name?.charAt(0) || "U"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="truncate">
                                                                        {m.user?.name || "Member"}
                                                                    </span>
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>

                                                {/* Subtasks Progress */}
                                                <TableCell>
                                                    {subtasks.length > 0 ? (
                                                        <span className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                                                            <CheckSquare className="size-3 text-zinc-400" />
                                                            {completedSub}/{subtasks.length}
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-300 dark:text-zinc-600 text-xs">-</span>
                                                    )}
                                                </TableCell>

                                                {/* Due Date */}
                                                <TableCell>
                                                    <div
                                                        className={`flex items-center gap-1.5 text-xs ${
                                                            isOverdue
                                                                ? "text-red-600 dark:text-red-400 font-semibold"
                                                                : "text-zinc-500 dark:text-zinc-400"
                                                        }`}
                                                    >
                                                        <CalendarIcon className="size-3" />
                                                        {task.due_date
                                                            ? format(new Date(task.due_date), "MMM d")
                                                            : "-"}
                                                    </div>
                                                </TableCell>

                                                {/* Actions Menu */}
                                                <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                                                            >
                                                                <MoreHorizontal className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44 text-xs">
                                                            <DropdownMenuItem
                                                                onClick={() => setQuickViewTask(task)}
                                                                className="gap-2"
                                                            >
                                                                <Eye className="size-3.5" /> Quick View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/taskDetails?projectId=${task.projectId}&taskId=${task.id}`
                                                                    )
                                                                }
                                                                className="gap-2"
                                                            >
                                                                Full Details Page
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteSingle(task.id)}
                                                                className="gap-2 text-red-600 dark:text-red-400"
                                                            >
                                                                <Trash className="size-3.5" /> Delete Task
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center text-zinc-500 dark:text-zinc-400 py-10"
                                        >
                                            No tasks found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden flex flex-col gap-3 p-3">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const { icon: Icon, color } = typeIcons[task.type] || {};

                                return (
                                    <Card
                                        key={task.id}
                                        onClick={() => setQuickViewTask(task)}
                                        className="p-3.5 flex flex-col gap-2 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700"
                                    >
                                        <CardContent className="p-0 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-zinc-900 dark:text-zinc-100 text-xs font-semibold">
                                                    {task.title}
                                                </h3>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="size-4 rounded accent-blue-600"
                                                        onChange={() =>
                                                            selectedTasks.includes(task.id)
                                                                ? setSelectedTasks(
                                                                      selectedTasks.filter((i) => i !== task.id)
                                                                  )
                                                                : setSelectedTasks((prev) => [...prev, task.id])
                                                        }
                                                        checked={selectedTasks.includes(task.id)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                                {Icon && <Icon className={`size-3.5 ${color}`} />}
                                                <span className={`${color} uppercase font-medium text-[10px]`}>
                                                    {task.type}
                                                </span>
                                                <Badge
                                                    variant={
                                                        task.priority === "HIGH" ? "destructive" : "secondary"
                                                    }
                                                    className="ml-auto text-[10px] px-1.5 py-0"
                                                >
                                                    {task.priority}
                                                </Badge>
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    name="status"
                                                    onChange={(e) =>
                                                        handleStatusChange(task.id, e.target.value as TaskStatus)
                                                    }
                                                    value={task.status}
                                                    className="w-full mt-1 h-7 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 text-xs text-zinc-900 dark:text-zinc-200"
                                                >
                                                    <option value="TODO">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="DONE">Done</option>
                                                </select>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Avatar className="size-4">
                                                        <AvatarImage
                                                            src={task.assignee?.image}
                                                            alt={task.assignee?.name}
                                                        />
                                                        <AvatarFallback className="text-[8px]">
                                                            {task.assignee?.name?.[0] || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{task.assignee?.name || "Unassigned"}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-[11px]">
                                                    <CalendarIcon className="size-3" />
                                                    {task.due_date
                                                        ? format(new Date(task.due_date), "MMM d")
                                                        : "-"}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <p className="text-center text-zinc-500 dark:text-zinc-400 py-6 text-xs">
                                No tasks found matching your filters.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Quick View Dialog */}
            {currentQuickViewTask && (
                <TaskQuickViewDialog
                    task={currentQuickViewTask}
                    isOpen={Boolean(currentQuickViewTask)}
                    onClose={() => setQuickViewTask(null)}
                />
            )}

            {/* Create Task Dialog */}
            {isCreateOpen && (
                <CreateTaskDialog
                    showCreateTask={isCreateOpen}
                    setShowCreateTask={setIsCreateOpen}
                    projectId={resolvedProjectId}
                />
            )}
        </div>
    );
};

export default ProjectTasks;
