"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircle2Icon,
    Loader2Icon,
    TrophyIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LessonWithProgress } from "@/lib/types/roadmap";

interface LessonContentAreaProps {
    roadmapSlug: string;
    prev: LessonWithProgress | null;
    next: LessonWithProgress | null;
    onMarkComplete: () => void;
    isUpdating: boolean;
    isCompleted: boolean;
    children: ReactNode;
}

function LessonNavButton({
    href,
    direction,
    title,
    disabled = false,
}: {
    href?: string;
    direction: "prev" | "next";
    title?: string;
    disabled?: boolean;
}) {
    const isPrev = direction === "prev";

    const content = (
        <>
            {isPrev && <ArrowLeftIcon className="size-4 shrink-0" />}

            <span className="hidden min-w-0 truncate text-sm sm:inline">
                {title}
            </span>

            <span className="text-sm sm:hidden">
                {isPrev ? "Trước" : "Tiếp"}
            </span>

            {!isPrev && <ArrowRightIcon className="size-4 shrink-0" />}
        </>
    );

    if (disabled || !href) {
        return (
            <Button
                variant="ghost"
                size="sm"
                disabled
                className="h-9 min-w-0 gap-1.5 px-2.5 opacity-40 sm:max-w-[180px] sm:px-3"
            >
                {content}
            </Button>
        );
    }

    return (
        <Button
            variant={isPrev ? "ghost" : "secondary"}
            size="sm"
            asChild
            className={cn(
                "h-9 min-w-0 gap-1.5 rounded-lg px-2.5 sm:max-w-[220px] sm:px-3",
                isPrev
                    ? "text-muted-foreground hover:text-foreground"
                    : "border border-border/60 bg-card hover:bg-muted"
            )}
        >
            <Link href={href}>{content}</Link>
        </Button>
    );
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
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-20 shrink-0 border-b border-border/50 bg-background/85 backdrop-blur-xl">
                <div className="mx-auto flex h-13 max-w-6xl items-center gap-2 px-3 sm:px-5">
                    <div className="flex min-w-0 flex-1 justify-start">
                        <LessonNavButton
                            direction="prev"
                            href={prev ? `/learn/${roadmapSlug}/${prev.slug}` : undefined}
                            title={prev?.title ?? "Previous"}
                            disabled={!prev}
                        />
                    </div>

                    <div className="flex shrink-0 justify-center">
                        <Button
                            size="sm"
                            onClick={onMarkComplete}
                            disabled={isUpdating || isCompleted}
                            aria-live="polite"
                            className={cn(
                                "h-9 gap-2 rounded-lg px-3.5 text-sm font-bold shadow-sm transition-all sm:px-5",
                                isCompleted
                                    ? "cursor-default border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 shadow-none hover:bg-emerald-500/10 dark:text-emerald-400"
                                    : "bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90"
                            )}
                        >
                            {isUpdating ? (
                                <Loader2Icon className="size-4 animate-spin" />
                            ) : (
                                <CheckCircle2Icon
                                    className={cn(
                                        "size-4",
                                        isCompleted && "text-emerald-600 dark:text-emerald-400"
                                    )}
                                />
                            )}

                            <span className="hidden sm:inline">
                                {isUpdating
                                    ? "Đang cập nhật..."
                                    : isCompleted
                                        ? "Đã hoàn thành"
                                        : "Đánh dấu xong"}
                            </span>

                            <span className="sm:hidden">
                                {isCompleted ? "Done" : "Complete"}
                            </span>
                        </Button>
                    </div>

                    <div className="flex min-w-0 flex-1 justify-end">
                        {next ? (
                            <LessonNavButton
                                direction="next"
                                href={`/learn/${roadmapSlug}/${next.slug}`}
                                title={next.title}
                            />
                        ) : (
                            <Button
                                variant="default"
                                size="sm"
                                asChild
                                className="h-9 gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-bold text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                            >
                                <Link href={`/roadmaps/${roadmapSlug}`}>
                                    <span className="hidden sm:inline">Hoàn thành lộ trình</span>
                                    <span className="sm:hidden">Xong</span>
                                    <TrophyIcon className="size-4" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
