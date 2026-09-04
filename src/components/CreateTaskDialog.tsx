import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useAppSelector, useAppDispatch } from "../app/store";
import { addTask } from "../features/workspaceSlice";
import { TaskType, TaskStatus, Priority, Task } from "../types";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateTaskDialogProps {
    showCreateTask: boolean;
    setShowCreateTask: (open: boolean) => void;
    projectId?: string;
    initialStatus?: TaskStatus;
}

interface TaskFormData {
    title: string;
    description: string;
    type: TaskType;
    status: TaskStatus;
    priority: Priority;
    assigneeId: string;
    due_date: string;
}

export default function CreateTaskDialog({
    showCreateTask,
    setShowCreateTask,
    projectId,
    initialStatus = "TODO",
}: CreateTaskDialogProps) {
    const dispatch = useAppDispatch();
    const currentWorkspace = useAppSelector((state) => state.workspace?.currentWorkspace || null);
    const resolvedProjectId = projectId || currentWorkspace?.projects[0]?.id || "";
    const project = currentWorkspace?.projects.find((p) => p.id === resolvedProjectId);
    const teamMembers = project?.members || currentWorkspace?.members || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<TaskFormData>({
        title: "",
        description: "",
        type: "TASK",
        status: initialStatus,
        priority: "MEDIUM",
        assigneeId: "",
        due_date: "",
    });

    useEffect(() => {
        if (showCreateTask) {
            setFormData({
                title: "",
                description: "",
                type: "TASK",
                status: initialStatus,
                priority: "MEDIUM",
                assigneeId: "",
                due_date: "",
            });
        }
    }, [showCreateTask, initialStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !resolvedProjectId) return;

        setIsSubmitting(true);
        const selectedMember = teamMembers.find(
            (m) => m.user?.id === formData.assigneeId || m.userId === formData.assigneeId
        );

        const newTask: Task = {
            id: `task_${Date.now()}`,
            projectId: resolvedProjectId,
            title: formData.title.trim(),
            description: formData.description.trim(),
            type: formData.type,
            status: formData.status,
            priority: formData.priority,
            assigneeId: formData.assigneeId,
            assignee: selectedMember?.user,
            due_date: formData.due_date
                ? new Date(formData.due_date).toISOString()
                : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
            subtasks: [],
            attachments: [],
        };

        dispatch(addTask(newTask));
        toast.success(`Task "${newTask.title}" created successfully`);
        setShowCreateTask(false);
        setIsSubmitting(false);
    };

    return (
        <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="taskTitle">Title</Label>
                        <Input
                            id="taskTitle"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Task title"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="taskDescription">Description</Label>
                        <Textarea
                            id="taskDescription"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the task"
                            className="h-24"
                        />
                    </div>

                    {/* Type & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="taskType">Type</Label>
                            <select
                                id="taskType"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as TaskType })}
                                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                            >
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="TASK">Task</option>
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="taskPriority">Priority</Label>
                            <select
                                id="taskPriority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignee and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="taskAssignee">Assignee</Label>
                            <select
                                id="taskAssignee"
                                value={formData.assigneeId}
                                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                            >
                                <option value="">Unassigned</option>
                                {teamMembers.map((member) => (
                                    <option key={member?.user?.id} value={member?.user?.id}>
                                        {member?.user?.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="taskStatus">Status</Label>
                            <select
                                id="taskStatus"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="taskDueDate">Due Date</Label>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
                            <Input
                                id="taskDueDate"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        {formData.due_date && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {format(new Date(formData.due_date), "PPP")}
                            </p>
                        )}
                    </div>

                    {/* Footer */}
                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateTask(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
