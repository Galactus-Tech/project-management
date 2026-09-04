import React, { useState } from "react";
import {
    format,
    isSameDay,
    isSameMonth,
    isBefore,
    isToday,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
} from "date-fns";
import {
    Calendar as CalendarIcon,
    Clock,
    User,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    CalendarDays,
    ArrowUpRight,
    CheckSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Task } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectCalendarProps {
    tasks: Task[];
    projectId?: string;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const ProjectCalendar: React.FC<ProjectCalendarProps> = ({ tasks, projectId }) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    const today = new Date();

    const getTasksForDate = (date: Date) =>
        tasks.filter((task) => task.due_date && isSameDay(new Date(task.due_date), date));

    const upcomingTasks = tasks
        .filter((task) => task.due_date && !isBefore(new Date(task.due_date), today) && task.status !== "DONE")
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 6);

    const overdueTasks = tasks
        .filter((task) => task.due_date && isBefore(new Date(task.due_date), today) && task.status !== "DONE")
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    // Compute standard calendar grid interval (starts on Sunday, ends on Saturday)
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    });

    const handleMonthChange = (direction: "prev" | "next") => {
        setCurrentMonth((prev) => (direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1)));
    };

    const handleGoToToday = () => {
        const now = new Date();
        setCurrentMonth(now);
        setSelectedDate(now);
    };

    const handleSelectDay = (day: Date) => {
        setSelectedDate(day);
        if (!isSameMonth(day, currentMonth)) {
            setCurrentMonth(startOfMonth(day));
        }
    };

    const selectedDayTasks = getTasksForDate(selectedDate);

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Calendar View */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                    {/* Calendar Header with navigation controls */}
                    <CardHeader className="p-4 sm:p-5 flex flex-row items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                                <CalendarDays className="size-4" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                    {format(currentMonth, "MMMM yyyy")}
                                </CardTitle>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {tasks.filter((t) => t.due_date && isSameMonth(new Date(t.due_date), currentMonth)).length} tasks scheduled this month
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGoToToday}
                                        className="h-8 text-xs px-2.5 cursor-pointer font-medium"
                                    >
                                        Today
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Jump to current date</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 cursor-pointer"
                                        onClick={() => handleMonthChange("prev")}
                                        aria-label="Previous month"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Previous month</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 cursor-pointer"
                                        onClick={() => handleMonthChange("next")}
                                        aria-label="Next month"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Next month</TooltipContent>
                            </Tooltip>
                        </div>
                    </CardHeader>

                    <CardContent className="p-3 sm:p-5 pt-3">
                        {/* Weekday Column Headers (Sun -> Sat) */}
                        <div className="grid grid-cols-7 text-xs text-zinc-500 dark:text-zinc-400 mb-2 text-center font-semibold tracking-wider">
                            {WEEKDAY_NAMES.map((dayName, idx) => (
                                <div
                                    key={dayName}
                                    className={`py-1.5 ${idx === 0 || idx === 6 ? "text-zinc-400 dark:text-zinc-500" : ""}`}
                                >
                                    {dayName}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid Cells with Correct Weekday Alignment */}
                        <div className="grid grid-cols-7 gap-1 sm:gap-2">
                            {calendarDays.map((day) => {
                                const dayTasks = getTasksForDate(day);
                                const isSelected = isSameDay(day, selectedDate);
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isCurrentDayToday = isToday(day);
                                const hasOverdue = dayTasks.some(
                                    (t) => t.status !== "DONE" && t.due_date && isBefore(new Date(t.due_date), today)
                                );
                                const hasDoneTasks = dayTasks.some((t) => t.status === "DONE");
                                const hasPendingTasks = dayTasks.some((t) => t.status !== "DONE");

                                return (
                                    <Tooltip key={day.toISOString()}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => handleSelectDay(day)}
                                                className={`min-h-[58px] sm:min-h-[68px] p-1 sm:p-1.5 rounded-xl flex flex-col items-center justify-between text-xs cursor-pointer transition-all relative
                                                ${
                                                    isSelected
                                                        ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm ring-2 ring-zinc-900 dark:ring-zinc-100 z-10 scale-[1.02]"
                                                        : isCurrentMonth
                                                        ? "bg-zinc-50/90 dark:bg-zinc-900/70 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/90 hover:scale-[1.01]"
                                                        : "bg-zinc-50/30 dark:bg-zinc-900/20 text-zinc-400 dark:text-zinc-600 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 opacity-40 hover:opacity-75"
                                                }
                                                ${isCurrentDayToday && !isSelected ? "ring-1.5 ring-blue-500/80 font-semibold" : ""}
                                                ${hasOverdue && !isSelected ? "border border-red-400/80 dark:border-red-500/80" : "border border-transparent"}`}
                                                aria-label={`${format(day, "EEEE, MMMM d, yyyy")}, ${dayTasks.length} tasks`}
                                            >
                                                {/* Top Row: Date Number & Today Indicator */}
                                                <div className="w-full flex items-center justify-between px-0.5">
                                                    <span
                                                        className={`text-xs sm:text-sm font-medium leading-none ${
                                                            isCurrentDayToday && !isSelected
                                                                ? "text-blue-600 dark:text-blue-400 font-bold"
                                                                : ""
                                                        }`}
                                                    >
                                                        {format(day, "d")}
                                                    </span>

                                                    {isCurrentDayToday && (
                                                        <span
                                                            className={`size-1.5 rounded-full ${
                                                                isSelected
                                                                    ? "bg-blue-400 dark:bg-blue-600"
                                                                    : "bg-blue-500 animate-pulse"
                                                            }`}
                                                            title="Today"
                                                        />
                                                    )}
                                                </div>

                                                {/* Bottom Row: Task Count and Status Indicators */}
                                                <div className="w-full flex flex-col items-center gap-0.5 mt-auto">
                                                    {dayTasks.length > 0 && (
                                                        <div
                                                            className={`w-full text-center text-[10px] leading-tight px-1 py-0.5 rounded-md font-medium truncate ${
                                                                isSelected
                                                                    ? "bg-white/20 dark:bg-zinc-800 text-white dark:text-zinc-200"
                                                                    : hasOverdue
                                                                    ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                                                                    : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                                            }`}
                                                        >
                                                            {dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}
                                                        </div>
                                                    )}

                                                    {/* Multi-task status mini dots */}
                                                    {dayTasks.length > 0 && (
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            {hasOverdue && (
                                                                <span className="size-1.5 rounded-full bg-red-500" />
                                                            )}
                                                            {hasPendingTasks && !hasOverdue && (
                                                                <span className="size-1.5 rounded-full bg-amber-500" />
                                                            )}
                                                            {hasDoneTasks && (
                                                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="text-xs max-w-xs">
                                            <p className="font-semibold">{format(day, "EEEE, MMM d, yyyy")}</p>
                                            {dayTasks.length === 0 ? (
                                                <p className="text-zinc-400">No tasks due</p>
                                            ) : (
                                                <ul className="mt-1 space-y-0.5 text-[11px]">
                                                    {dayTasks.slice(0, 3).map((t) => (
                                                        <li key={t.id} className="truncate flex items-center gap-1.5">
                                                            <span
                                                                className={`size-1.5 rounded-full shrink-0 ${
                                                                    t.status === "DONE"
                                                                        ? "bg-emerald-400"
                                                                        : isBefore(new Date(t.due_date), today)
                                                                        ? "bg-red-400"
                                                                        : "bg-blue-400"
                                                                }`}
                                                            />
                                                            <span className="truncate">{t.title}</span>
                                                        </li>
                                                    ))}
                                                    {dayTasks.length > 3 && (
                                                        <li className="text-zinc-400">+{dayTasks.length - 3} more</li>
                                                    )}
                                                </ul>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>

                        {/* Calendar Legend */}
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-blue-500" />
                                    <span>Today</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-red-500" />
                                    <span>Overdue</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-amber-500" />
                                    <span>Pending</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    <span>Completed</span>
                                </div>
                            </div>
                            <span>Click any date to inspect tasks</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks for Selected Day Detail View */}
                <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                    <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80">
                        <div>
                            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <CalendarIcon className="size-4 text-blue-500" />
                                Tasks for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                            </CardTitle>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                {selectedDayTasks.length === 0
                                    ? "No tasks scheduled for this day"
                                    : `${selectedDayTasks.length} ${
                                          selectedDayTasks.length === 1 ? "task" : "tasks"
                                      } scheduled`}
                            </p>
                        </div>

                        {isToday(selectedDate) && (
                            <Badge variant="secondary" className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50">
                                Today
                            </Badge>
                        )}
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5 pt-4 space-y-3">
                        {selectedDayTasks.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 space-y-2">
                                <CheckSquare className="size-8 mx-auto text-zinc-300 dark:text-zinc-600 stroke-1" />
                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    No tasks due on {format(selectedDate, "MMM d")}
                                </p>
                                <p className="text-xs max-w-sm mx-auto text-zinc-400 dark:text-zinc-500">
                                    Select another date on the calendar above or create a new task with this due date.
                                </p>
                            </div>
                        ) : (
                            selectedDayTasks.map((task) => {
                                const isTaskOverdue =
                                    task.due_date && isBefore(new Date(task.due_date), today) && task.status !== "DONE";
                                const taskUrl = projectId
                                    ? `/taskDetails?projectId=${projectId}&taskId=${task.id}`
                                    : `/taskDetails?taskId=${task.id}`;

                                return (
                                    <Link
                                        key={task.id}
                                        to={taskUrl}
                                        className="block group"
                                    >
                                        <div
                                            className={`p-3.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                                isTaskOverdue
                                                    ? "bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/60 hover:border-red-300"
                                                    : task.status === "DONE"
                                                    ? "bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40 hover:border-emerald-300"
                                                    : "bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                        {task.title}
                                                    </h4>
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                        {task.type}
                                                    </Badge>
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
                                                </div>

                                                {task.description && (
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                                {task.assignee && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-default">
                                                                <Avatar className="size-5 border border-zinc-200 dark:border-zinc-700">
                                                                    <AvatarImage src={task.assignee.image} alt={task.assignee.name} />
                                                                    <AvatarFallback className="text-[9px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                                                        {task.assignee.name?.charAt(0) || "U"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-[11px] truncate max-w-24">
                                                                    {task.assignee.name}
                                                                </span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            Assignee: {task.assignee.name}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}

                                                <Badge
                                                    variant={task.status === "DONE" ? "default" : "secondary"}
                                                    className="text-xs font-normal"
                                                >
                                                    {task.status === "DONE" && <CheckCircle2 className="size-3 mr-1" />}
                                                    {task.status.replace("_", " ")}
                                                </Badge>

                                                <ArrowUpRight className="size-4 text-zinc-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar with Upcoming & Overdue Tasks */}
            <div className="space-y-6">
                {/* Upcoming Tasks */}
                <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
                    <CardHeader className="p-4 pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                        <CardTitle className="text-sm font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                <Clock className="size-4 text-blue-500" /> Upcoming Deadlines
                            </span>
                            <span className="text-xs font-normal text-zinc-500">
                                Next {upcomingTasks.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-3">
                        {upcomingTasks.length === 0 ? (
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs text-center py-4">
                                No upcoming deadlines scheduled
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {upcomingTasks.map((task) => {
                                    const taskDate = new Date(task.due_date);
                                    const isTaskDateSelected = isSameDay(taskDate, selectedDate);
                                    const taskUrl = projectId
                                        ? `/taskDetails?projectId=${projectId}&taskId=${task.id}`
                                        : `/taskDetails?taskId=${task.id}`;

                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => handleSelectDay(taskDate)}
                                            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                                isTaskDateSelected
                                                    ? "bg-blue-50/50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800"
                                                    : "bg-zinc-50/80 dark:bg-zinc-900/60 border-zinc-200/70 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start text-xs gap-2">
                                                <Link
                                                    to={taskUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                                                >
                                                    {task.title}
                                                </Link>
                                                <Badge
                                                    variant={
                                                        task.priority === "HIGH"
                                                            ? "destructive"
                                                            : task.priority === "MEDIUM"
                                                            ? "secondary"
                                                            : "outline"
                                                    }
                                                    className="text-[9px] px-1 py-0 shrink-0"
                                                >
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
                                                <span className="flex items-center gap-1">
                                                    <CalendarIcon className="size-3 text-zinc-400" />
                                                    {format(taskDate, "MMM d, yyyy")}
                                                </span>
                                                {task.assignee && (
                                                    <span className="truncate max-w-24 text-[10px] text-zinc-600 dark:text-zinc-300">
                                                        {task.assignee.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Overdue Tasks */}
                {overdueTasks.length > 0 && (
                    <Card className="border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 shadow-2xs">
                        <CardHeader className="p-4 pb-2 border-b border-red-100 dark:border-red-900/40">
                            <CardTitle className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <AlertCircle className="size-4" /> Overdue Tasks
                                </span>
                                <Badge variant="destructive" className="text-xs px-1.5 py-0 font-normal">
                                    {overdueTasks.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-3">
                            <div className="space-y-2">
                                {overdueTasks.slice(0, 5).map((task) => {
                                    const taskDate = new Date(task.due_date);
                                    const isTaskDateSelected = isSameDay(taskDate, selectedDate);
                                    const taskUrl = projectId
                                        ? `/taskDetails?projectId=${projectId}&taskId=${task.id}`
                                        : `/taskDetails?taskId=${task.id}`;

                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => handleSelectDay(taskDate)}
                                            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                                                isTaskDateSelected
                                                    ? "bg-red-100/60 dark:bg-red-900/40 border-red-300 dark:border-red-700"
                                                    : "bg-white dark:bg-zinc-900 border-red-200/80 dark:border-red-900/60 hover:border-red-300 dark:hover:border-red-800"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start text-xs gap-2">
                                                <Link
                                                    to={taskUrl}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-red-600 dark:hover:text-red-400 truncate"
                                                >
                                                    {task.title}
                                                </Link>
                                                <Badge variant="destructive" className="text-[9px] px-1 py-0 shrink-0">
                                                    Overdue
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px] text-red-600 dark:text-red-400 mt-1.5 font-medium">
                                                <span>Due {format(taskDate, "MMM d")}</span>
                                                {task.assignee && (
                                                    <span className="text-zinc-600 dark:text-zinc-400 font-normal truncate max-w-24 text-[10px]">
                                                        {task.assignee.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {overdueTasks.length > 5 && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center pt-1 font-medium">
                                        +{overdueTasks.length - 5} more overdue tasks
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ProjectCalendar;
