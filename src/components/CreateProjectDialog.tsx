import React, { useState } from "react";
import { XIcon } from "lucide-react";
import { useAppSelector } from "../app/store";
import { ProjectStatus, Priority } from "../types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface CreateProjectDialogProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
}

interface ProjectFormData {
    name: string;
    description: string;
    status: ProjectStatus;
    priority: Priority;
    start_date: string;
    end_date: string;
    team_members: string[];
    team_lead: string;
    progress: number;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ isDialogOpen, setIsDialogOpen }) => {
    const { currentWorkspace } = useAppSelector((state) => state.workspace);

    const [formData, setFormData] = useState<ProjectFormData>({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_members: [],
        team_lead: "",
        progress: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsDialogOpen(false);
        setIsSubmitting(false);
    };

    const removeTeamMember = (email: string) => {
        setFormData((prev) => ({ ...prev, team_members: prev.team_members.filter((m) => m !== email) }));
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    {currentWorkspace && (
                        <DialogDescription>
                            In workspace: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{currentWorkspace.name}</span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Project Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="projectName">Project Name</Label>
                        <Input
                            id="projectName"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter project name"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="projectDescription">Description</Label>
                        <Textarea
                            id="projectDescription"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe your project"
                            className="h-20"
                        />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="projectStatus">Status</Label>
                            <select
                                id="projectStatus"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                                className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                            >
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="projectPriority">Priority</Label>
                            <select
                                id="projectPriority"
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

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                min={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : undefined}
                            />
                        </div>
                    </div>

                    {/* Lead */}
                    <div className="space-y-1.5">
                        <Label htmlFor="projectLead">Project Lead</Label>
                        <select
                            id="projectLead"
                            value={formData.team_lead}
                            onChange={(e) => setFormData({
                                ...formData,
                                team_lead: e.target.value,
                                team_members: e.target.value ? Array.from(new Set([...formData.team_members, e.target.value])) : formData.team_members,
                            })}
                            className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                        >
                            <option value="">No lead</option>
                            {currentWorkspace?.members?.map((member) => (
                                <option key={member.user.email} value={member.user.email}>
                                    {member.user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Team Members */}
                    <div className="space-y-1.5">
                        <Label htmlFor="addMembers">Team Members</Label>
                        <select
                            id="addMembers"
                            className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                            value=""
                            onChange={(e) => {
                                if (e.target.value && !formData.team_members.includes(e.target.value)) {
                                    setFormData((prev) => ({ ...prev, team_members: [...prev.team_members, e.target.value] }));
                                }
                            }}
                        >
                            <option value="">Add team members</option>
                            {currentWorkspace?.members
                                ?.filter((member) => !formData.team_members.includes(member.user.email))
                                .map((member) => (
                                    <option key={member.user.email} value={member.user.email}>
                                        {member.user.email}
                                    </option>
                                ))}
                        </select>

                        {formData.team_members.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.team_members.map((email) => (
                                    <Badge key={email} variant="secondary" className="gap-1 py-1">
                                        {email}
                                        <button
                                            type="button"
                                            onClick={() => removeTeamMember(email)}
                                            className="ml-1 hover:text-red-500 rounded cursor-pointer"
                                        >
                                            <XIcon className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !currentWorkspace}
                        >
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateProjectDialog;
