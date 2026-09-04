import React, { useState } from "react";
import { Mail } from "lucide-react";
import { useAppSelector } from "../app/store";
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

interface InviteMemberDialogProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
}

const InviteMemberDialog: React.FC<InviteMemberDialogProps> = ({ isDialogOpen, setIsDialogOpen }) => {
    const currentWorkspace = useAppSelector((state) => state.workspace?.currentWorkspace || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        role: "org:member",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsDialogOpen(false);
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    {currentWorkspace && (
                        <DialogDescription>
                            Inviting to workspace: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{currentWorkspace.name}</span>
                        </DialogDescription>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="inviteEmail">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 w-4 h-4" />
                            <Input
                                id="inviteEmail"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Enter email address"
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label htmlFor="inviteRole">Role</Label>
                        <select
                            id="inviteRole"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full h-9 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 shadow-xs"
                        >
                            <option value="org:member">Member</option>
                            <option value="org:admin">Admin</option>
                        </select>
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
                            {isSubmitting ? "Sending..." : "Send Invitation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InviteMemberDialog;
