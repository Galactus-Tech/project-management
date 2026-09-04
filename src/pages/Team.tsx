import React, { useEffect, useState } from "react";
import { UsersIcon, Search, UserPlus, Shield, Activity } from "lucide-react";
import InviteMemberDialog from "../components/InviteMemberDialog";
import { useAppSelector } from "../app/store";
import { WorkspaceMember, Task } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const Team: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [users, setUsers] = useState<WorkspaceMember[]>([]);
    const currentWorkspace = useAppSelector((state) => state?.workspace?.currentWorkspace || null);
    const projects = currentWorkspace?.projects || [];

    const filteredUsers = users.filter(
        (member) =>
            member?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        setUsers(currentWorkspace?.members || []);
        const allTasks = currentWorkspace?.projects?.reduce<Task[]>(
            (acc, project) => [...acc, ...(project.tasks || [])],
            []
        ) || [];
        setTasks(allTasks);
    }, [currentWorkspace]);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 dark:text-white mb-1">Team</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Manage team members and their contributions
                    </p>
                </div>
                <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="gap-2"
                >
                    <UserPlus className="w-4 h-4" /> Invite Member
                </Button>
                <InviteMemberDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
            </div>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-4">
                {/* Total Members */}
                <Card className="flex-1 min-w-56">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Members</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{users.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                            <UsersIcon className="size-5 text-zinc-700 dark:text-zinc-300" />
                        </div>
                    </CardContent>
                </Card>

                {/* Active Projects */}
                <Card className="flex-1 min-w-56">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Projects</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {projects.filter((p) => p.status !== "CANCELLED" && p.status !== "COMPLETED").length}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                            <Activity className="size-5 text-zinc-700 dark:text-zinc-300" />
                        </div>
                    </CardContent>
                </Card>

                {/* Total Tasks */}
                <Card className="flex-1 min-w-56">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Tasks</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{tasks.length}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
                            <Shield className="size-5 text-zinc-700 dark:text-zinc-300" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 dark:text-zinc-500 size-4 pointer-events-none" />
                <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Team Members */}
            <div className="w-full">
                {filteredUsers.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                            <UsersIcon className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                            {users.length === 0
                                ? "No team members yet"
                                : "No members match your search"}
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                            {users.length === 0
                                ? "Invite team members to start collaborating"
                                : "Try adjusting your search term"}
                        </p>
                    </div>
                ) : (
                    <div className="max-w-4xl w-full">
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="w-[120px]">Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={member.user?.image || undefined} alt={member.user?.name} />
                                                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                                                            {member.user?.name?.charAt(0) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="truncate">
                                                        {member.user?.name || "Unknown User"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-zinc-500 dark:text-zinc-400">
                                                {member.user?.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={member.role === "ADMIN" ? "default" : "secondary"}
                                                >
                                                    {member.role || "MEMBER"}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="sm:hidden space-y-3">
                            {filteredUsers.map((member) => (
                                <Card key={member.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Avatar className="size-9">
                                                <AvatarImage src={member.user?.image || undefined} alt={member.user?.name} />
                                                <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs">
                                                    {member.user?.name?.charAt(0) || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-zinc-900 dark:text-white">
                                                    {member.user?.name || "Unknown User"}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {member.user?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <Badge
                                                variant={member.role === "ADMIN" ? "default" : "secondary"}
                                            >
                                                {member.role || "MEMBER"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
