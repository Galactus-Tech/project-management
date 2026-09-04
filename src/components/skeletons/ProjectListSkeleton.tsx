import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ProjectListSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300" aria-busy="true" aria-label="Loading projects">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48 rounded-lg" />
                    <Skeleton className="h-4 w-64 rounded-md" />
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <Skeleton className="h-8 w-48 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
            </div>

            {/* Grid of cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-4 space-y-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-5 w-3/5 rounded-md" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-2 w-full rounded-full" />
                        <div className="flex justify-between items-center pt-2">
                            <div className="flex -space-x-2">
                                <Skeleton className="size-6 rounded-full" />
                                <Skeleton className="size-6 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-20 rounded-md" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const ProjectDetailsSkeleton: React.FC = () => {
    return (
        <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300" aria-busy="true" aria-label="Loading project details">
            {/* Top Navigation */}
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-5">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-32 rounded-md" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-48 rounded-md" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>

            {/* Tabs */}
            <Skeleton className="h-10 w-96 rounded-lg" />

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card className="p-5 space-y-4">
                        <Skeleton className="h-5 w-40 rounded-md" />
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-4/5 rounded-md" />
                        <Skeleton className="h-3 w-full rounded-full" />
                    </Card>
                </div>
                <div className="space-y-4">
                    <Card className="p-5 space-y-3">
                        <Skeleton className="h-5 w-32 rounded-md" />
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                    </Card>
                </div>
            </div>
        </div>
    );
};
