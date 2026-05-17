import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="flex h-full overflow-hidden">
            {/* Top bar skeleton */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-background shrink-0">
                    <Skeleton className="h-8 w-24 rounded-md" />
                    <div className="flex-1" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                </div>

                {/* Content area skeleton */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Lesson header skeleton */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-6 w-16 rounded-md" />
                                <Skeleton className="h-6 w-12 rounded-full" />
                            </div>
                            <Skeleton className="h-10 w-3/4 rounded-md" />
                            <Skeleton className="h-4 w-1/3 rounded-md" />
                        </div>

                        {/* Content skeleton */}
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-5 w-1/4 rounded-md" />
                                    <Skeleton className="h-4 w-full rounded-md" />
                                    <Skeleton className="h-4 w-5/6 rounded-md" />
                                    <Skeleton className="h-4 w-2/3 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom nav skeleton */}
                    <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-background shrink-0">
                        <Skeleton className="h-8 w-28 rounded-md" />
                        <Skeleton className="h-8 flex-1 rounded-md" />
                        <Skeleton className="h-8 w-28 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Right panel skeleton (desktop) */}
            <div className="hidden md:flex w-72 shrink-0 flex-col border-l border-border bg-card">
                <div className="px-4 py-3 border-b border-border">
                    <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-8 w-full rounded-md" />
                            <div className="pl-4 space-y-1">
                                {[1, 2].map((j) => (
                                    <Skeleton key={j} className="h-6 w-full rounded-md" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
