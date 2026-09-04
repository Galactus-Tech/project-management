import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, Save } from "lucide-react";
import AddProjectMember from "./AddProjectMember";
import { Project, ProjectStatus, Priority } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ProjectSettingsProps {
    project: Project;
}

export default function ProjectSettings({ project }: ProjectSettingsProps) {
    const [formData, setFormData] = useState<Project>({
        id: "",
        workspaceId: "",
        name: "New Website Launch",
        description: "Initial launch for new web platform.",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "2025-09-10",
        end_date: "2025-10-15",
        progress: 30,
        members: [],
        tasks: [],
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (project) setFormData(project);
    }, [project]);

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Project Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="editProjName">Project Name</Label>
                            <Input
                                id="editProjName"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="editProjDesc">Description</Label>
                            <Textarea
                                id="editProjDesc"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="h-24"
                            />
                        </div>

                        {/* Status & Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="editProjStatus">Status</Label>
                                <select
                                    id="editProjStatus"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                                    className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                                >
                                    <option value="PLANNING">Planning</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="editProjPriority">Priority</Label>
                                <select
                                    id="editProjPriority"
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

                        {/* Timeline */}
                        <div className="space-y-4 grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="editStartDate">Start Date</Label>
                                <Input
                                    id="editStartDate"
                                    type="date"
                                    value={formData.start_date ? format(new Date(formData.start_date), "yyyy-MM-dd") : ""}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="editEndDate">End Date</Label>
                                <Input
                                    id="editEndDate"
                                    type="date"
                                    value={formData.end_date ? format(new Date(formData.end_date), "yyyy-MM-dd") : ""}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1.5">
                            <Label htmlFor="editProgress">Progress: {formData.progress || 0}%</Label>
                            <input
                                id="editProgress"
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={formData.progress || 0}
                                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                                className="w-full accent-blue-500 dark:accent-blue-400 cursor-pointer"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="gap-2"
                            >
                                <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Team Members */}
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                            Team Members <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">({project.members?.length || 0})</span>
                        </CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Plus className="size-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />

                        {/* Member List */}
                        {project.members && project.members.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {project.members.map((member, index) => (
                                    <div key={index} className="flex items-center justify-between px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-200">
                                        <span>{member?.user?.email || "Unknown"}</span>
                                        {project.team_lead === member.user?.id && (
                                            <Badge variant="outline">
                                                Team Lead
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">No members in this project</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
