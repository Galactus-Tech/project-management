import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/store";
import { updateProject } from "../features/workspaceSlice";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddProjectMemberProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
}

const AddProjectMember: React.FC<AddProjectMemberProps> = ({ isDialogOpen, setIsDialogOpen }) => {
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const currentWorkspace = useAppSelector((state) => state.workspace?.currentWorkspace || null);

    const project = currentWorkspace?.projects.find((p) => p.id === id);
    const projectMembersEmails = project?.members?.map((member) => member.user?.email) || [];

    const [email, setEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !project || !currentWorkspace) return;

        const targetMember = currentWorkspace.members?.find((m) => m.user?.email === email);
        if (!targetMember) return;

        setIsAdding(true);
        const newProjectMember = {
            id: `pm_${Date.now()}`,
            userId: targetMember.userId,
            projectId: project.id,
            user: targetMember.user,
        };

        const updatedProject = {
            ...project,
            members: [...(project.members || []), newProjectMember],
        };

        dispatch(updateProject(updatedProject));
        toast.success(`Added ${targetMember.user.name || email} to ${project.name}`);
        setEmail('');
        setIsDialogOpen(false);
        setIsAdding(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Member to Project</DialogTitle>
                    {currentWorkspace && (
                        <DialogDescription>
                            Adding to Project: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{project?.name}</span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="memberSelect">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4 pointer-events-none" />
                            <select
                                id="memberSelect"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                                required
                            >
                                <option value="">Select a member</option>
                                {currentWorkspace?.members
                                    ?.filter((member) => !projectMembersEmails.includes(member.user.email))
                                    .map((member) => (
                                        <option key={member.user.id} value={member.user.email}>
                                            {member.user.email}
                                        </option>
                                    ))}
                            </select>
                        </div>
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
                            disabled={isAdding || !currentWorkspace}
                        >
                            {isAdding ? "Adding..." : "Add Member"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddProjectMember;
