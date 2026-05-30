"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LessonType, LessonWithProgress } from "@/lib/types/roadmap";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, Loader2Icon, } from "lucide-react";

interface LessonContentAreaProps {
    lessonType: LessonType;
    lessonSlug: string;
    roadmapSlug: string;
    prev: LessonWithProgress | null;
    next: LessonWithProgress | null;
    onMarkComplete: () => void;
    isUpdating: boolean;
    isCompleted: boolean;
    children: React.ReactNode;
}

export function LessonContentArea({
    roadmapSlug,
    prev,
    next,
    onMarkComplete,
    isUpdating,
    isCompleted,
    children,
}: LessonContentAreaProps) {
    return (
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Sticky Action Bar — positioned at top of content */}
            <div className="sticky top-0 z-20 shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-md">
                <div className="max-w-4xl mx-auto flex items-center gap-2 px-6 py-2">
                    {/* Previous */}
                    {prev ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="gap-1.5 h-9 text-muted-foreground hover:text-foreground"
                        >
                            <Link href={`/learn/${roadmapSlug}/${prev.slug}`}>
                                <ArrowLeftIcon className="size-4" />
                                <span className="hidden sm:inline truncate max-w-[140px] text-sm">
                                    {prev.title}
                                </span>
                                <span className="sm:hidden text-sm">Prev</span>
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" disabled className="gap-1.5 h-9 opacity-40">
                            <ArrowLeftIcon className="size-4" />
                            <span className="text-sm">Previous</span>
                        </Button>
                    )}

                    <div className="flex-1" />

                    {/* Mark Complete — prominent center button */}
                    <Button
                        size="sm"
                        onClick={onMarkComplete}
                        disabled={isUpdating || isCompleted}
                        className={cn(
                            "gap-2 h-9 px-5 font-semibold shadow-sm transition-all",
                            isCompleted
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/15 cursor-default shadow-none"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25"
                        )}
                    >
                        {isUpdating ? (
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <CheckCircle2Icon className="size-4" />
                        )}
                        <span className="text-sm">
                            {isCompleted ? "Completed" : "Mark Complete"}
                        </span>
                    </Button>

                    <div className="flex-1" />

                    {/* Next */}
                    {next ? (
                        <Button
                            variant="default"
                            size="sm"
                            asChild
                            className="gap-1.5 h-9 bg-primary/90 hover:bg-primary"
                        >
                            <Link href={`/learn/${roadmapSlug}/${next.slug}`}>
                                <span className="hidden sm:inline truncate max-w-[140px] text-sm">
                                    {next.title}
                                </span>
                                <span className="sm:hidden text-sm">Next</span>
                                <ArrowRightIcon className="size-4" />
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" asChild className="gap-1.5 h-9">
                            <Link href={`/roadmaps/${roadmapSlug}`}>
                                <span className="text-sm">Finish Course</span>
                                <CheckCircle2Icon className="size-4" />
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Lesson content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
