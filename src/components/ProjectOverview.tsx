import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, UsersIcon, FolderOpen, Clock, AlertCircle } from "lucide-react";
import CreateProjectDialog from "./CreateProjectDialog";
import { useAppSelector } from "../app/store";
import { Project } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { renderStatusBadge, getDeadlineInfo, getProjectProgress } from "./ProjectCard";

const ProjectOverview: React.FC = () => {
    const currentWorkspace = useAppSelector((state) => state?.workspace?.currentWorkspace || null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        setProjects(currentWorkspace?.projects || []);
    }, [currentWorkspace]);

    if (!currentWorkspace) return null;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-row items-center justify-between">
                <CardTitle className="text-md text-zinc-900 dark:text-zinc-100 font-medium">Project Overview</CardTitle>
                <Link to={'/projects'} className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1">
                    View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </CardHeader>

            <CardContent className="p-0">
                {projects.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 rounded-full flex items-center justify-center">
                            <FolderOpen size={32} />
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">No projects yet</p>
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="mt-4"
                            size="sm"
                        >
                            Create your First Project
                        </Button>
                        <CreateProjectDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {projects.slice(0, 5).map((project) => {
                            const { percent } = getProjectProgress(project);
                            const deadline = getDeadlineInfo(project.end_date, project.status);

                            return (
                                <Link
                                    key={project.id}
                                    to={`/projectsDetail?id=${project.id}&tab=overview`}
                                    className="block p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-1.5">
                                        <div className="flex-1 min-w-0 pr-3">
                                            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                                {project.name}
                                            </h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                                {project.description || 'No description'}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            {renderStatusBadge(project.status)}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2 mt-2">
                                        <div className="flex items-center gap-3">
                                            {project.members && project.members.length > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <UsersIcon className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                                                </div>
                                            )}
                                            {project.end_date && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>{deadline.formatted}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            {deadline.isOverdue && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-600 dark:text-red-400">
                                                    <AlertCircle className="size-3" />
                                                    {deadline.text}
                                                </span>
                                            )}
                                            {deadline.isNear && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                                                    <Clock className="size-3" />
                                                    {deadline.text}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-500">Progress</span>
                                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{percent}%</span>
                                        </div>
                                        <Progress value={percent} className="h-1.5" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProjectOverview;
