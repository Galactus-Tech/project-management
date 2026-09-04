import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300" aria-busy="true" aria-label="Loading dashboard">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-7 w-56 rounded-lg" />
                    <Skeleton className="h-4 w-72 rounded-md" />
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24 rounded-md" />
                            <Skeleton className="size-8 rounded-lg" />
                        </div>
                        <Skeleton className="h-8 w-16 rounded-md" />
                        <Skeleton className="h-3 w-32 rounded-md" />
                    </Card>
                ))}
            </div>

            {/* Analytics & Project Summary Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Task Progress & Project Summary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Task Progress Card Skeleton */}
                    <Card>
                        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                            <div className="space-y-1.5">
                                <Skeleton className="h-5 w-36 rounded-md" />
                                <Skeleton className="h-3.5 w-48 rounded-md" />
                            </div>
                            <Skeleton className="h-7 w-24 rounded-md" />
                        </CardHeader>
                        <CardContent className="p-5 pt-2 space-y-5">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3.5 w-28 rounded-md" />
                                    <Skeleton className="h-3.5 w-12 rounded-md" />
                                </div>
                                <Skeleton className="h-3 w-full rounded-full" />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                                        <Skeleton className="h-3 w-16 rounded-md" />
                                        <Skeleton className="h-6 w-10 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Project Overview Card Skeleton */}
                    <Card>
                        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
                            <Skeleton className="h-5 w-32 rounded-md" />
                            <Skeleton className="h-4 w-16 rounded-md" />
                        </CardHeader>
                        <CardContent className="p-0 divide-y divide-zinc-200 dark:divide-zinc-800">
                            {[1, 2, 3].map((k) => (
                                <div key={k} className="p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-40 rounded-md" />
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                    <Skeleton className="h-3 w-3/4 rounded-md" />
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Task Summary Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3].map((m) => (
                        <Card key={m} className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="size-6 rounded-md" />
                                    <Skeleton className="h-4 w-24 rounded-md" />
                                </div>
                                <Skeleton className="h-5 w-8 rounded-full" />
                            </div>
                            <div className="space-y-2 pt-1">
                                <Skeleton className="h-3.5 w-full rounded-md" />
                                <Skeleton className="h-3.5 w-4/5 rounded-md" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default DashboardSkeleton;
