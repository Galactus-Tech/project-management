import React from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import { dummyWorkspaces } from "../assets/assets";
import { useAppDispatch, useAppSelector } from "../app/store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const WorkspaceDropdown: React.FC = () => {
    const { workspaces } = useAppSelector((state) => state.workspace);
    const currentWorkspace = useAppSelector((state) => state.workspace?.currentWorkspace || null);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (organizationId: string) => {
        dispatch(setCurrentWorkspace(organizationId));
        navigate('/');
    };

    return (
        <div className="m-3">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        className="w-full flex items-center justify-between p-2.5 text-left rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition outline-none cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="size-7 rounded-md">
                                <AvatarImage src={currentWorkspace?.image_url} alt={currentWorkspace?.name} />
                                <AvatarFallback className="rounded-md bg-blue-600 text-white text-xs">
                                    {currentWorkspace?.name?.charAt(0) || "W"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-zinc-900 dark:text-zinc-100 text-xs truncate">
                                    {currentWorkspace?.name || "Select Workspace"}
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 ml-1" />
                    </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-60" align="start">
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-zinc-500">
                        Workspaces
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {dummyWorkspaces.map((ws) => (
                        <DropdownMenuItem
                            key={ws.id}
                            onClick={() => onSelectWorkspace(ws.id)}
                            className="flex items-center gap-2.5 cursor-pointer py-2"
                        >
                            <Avatar className="size-6 rounded-md">
                                <AvatarImage src={ws.image_url} alt={ws.name} />
                                <AvatarFallback className="rounded-md text-[10px]">
                                    {ws.name?.charAt(0) || "W"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                    {ws.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {ws.membersCount || 0} members
                                </p>
                            </div>
                            {currentWorkspace?.id === ws.id && (
                                <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            )}
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="cursor-pointer text-blue-600 dark:text-blue-400 text-xs gap-2 py-2">
                        <Plus className="w-3.5 h-3.5" /> Create Workspace
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default WorkspaceDropdown;
