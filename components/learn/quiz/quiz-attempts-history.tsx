"use client";

import { useState } from "react";
import useSWR from "swr";
import type { QuizAttemptSummary } from "@/lib/types/lesson";
import { fetcher } from "@/api/fetchers";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CheckCircleIcon,
    ChevronDownIcon,
    ClockIcon,
    FlameIcon,
    HistoryIcon,
    TrophyIcon,
    XCircleIcon,
} from "lucide-react";

interface QuizAttemptsHistoryProps {
    roadmapSlug: string;
    lessonSlug: string;
    passingScore: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

function formatDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── BestAttemptCard ─────────────────────────────────────────────────────────

function BestAttemptCard({
    attempt,
    passingScore,
}: {
    attempt: QuizAttemptSummary;
    passingScore: number;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-orange-500/5">
            {/* Decorative glow */}
            <div className="absolute -top-12 -right-12 size-32 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="relative p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="size-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                            <TrophyIcon className="size-4.5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-foreground">Best Attempt</h3>
                            <p className="text-xs text-muted-foreground">
                                Attempt #{attempt.attemptNumber} · {formatDate(attempt.completedAt)}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant="secondary"
                        className={cn(
                            "text-xs font-semibold",
                            attempt.passed
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        )}
                    >
                        {attempt.passed ? "Passed" : "Failed"}
                    </Badge>
                </div>

                {/* Score display */}
                <div className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold text-foreground tabular-nums">
                                {attempt.score}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                                / {passingScore}% to pass
                            </span>
                        </div>
                        <Progress
                            value={attempt.score}
                            className="h-2.5"
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3 text-xs text-muted-foreground pb-0.5">
                        <div className="flex items-center gap-1">
                            <CheckCircleIcon className="size-3.5 text-emerald-500" />
                            <span className="tabular-nums">
                                {attempt.correctCount}/{attempt.totalQuestions}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <ClockIcon className="size-3.5" />
                            <span className="tabular-nums">{formatTime(attempt.timeSpentSeconds)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── AttemptRow ──────────────────────────────────────────────────────────────

function AttemptRow({ attempt }: { attempt: QuizAttemptSummary }) {
    return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
            {/* Status icon */}
            <div
                className={cn(
                    "size-7 rounded-lg flex items-center justify-center shrink-0",
                    attempt.passed ? "bg-emerald-500/10" : "bg-rose-500/10"
                )}
            >
                {attempt.passed ? (
                    <CheckCircleIcon className="size-3.5 text-emerald-500" />
                ) : (
                    <XCircleIcon className="size-3.5 text-rose-500" />
                )}
            </div>

            {/* Attempt info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                        Attempt #{attempt.attemptNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatDate(attempt.completedAt)}
                    </span>
                </div>
            </div>

            {/* Score + time */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ClockIcon className="size-3" />
                    <span className="tabular-nums">{formatTime(attempt.timeSpentSeconds)}</span>
                </div>
                <div
                    className={cn(
                        "text-sm font-semibold tabular-nums min-w-[3rem] text-right",
                        attempt.passed
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                    )}
                >
                    {attempt.score}%
                </div>
            </div>
        </div>
    );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function HistorySkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-[120px] w-full rounded-2xl" />
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <HistoryIcon className="size-5 text-muted-foreground/60" />
            </div>
            <p className="text-sm font-medium text-foreground">No attempts yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
                Complete the quiz to see your history here
            </p>
        </div>
    );
}

// ─── QuizAttemptsHistory (main) ──────────────────────────────────────────────

export function QuizAttemptsHistory({
    lessonSlug,
    passingScore,
}: QuizAttemptsHistoryProps) {
    const [expanded, setExpanded] = useState(false);

    const { data: attempts, isLoading } = useSWR<QuizAttemptSummary[]>(
        `/quiz/${lessonSlug}/quiz-attempts`,
        fetcher,
        { revalidateOnFocus: false }
    );

    if (isLoading) return <HistorySkeleton />;
    if (!attempts || attempts.length === 0) return <EmptyState />;

    // Best attempt = highest score
    const bestAttempt = attempts.reduce((best, curr) =>
        curr.score > best.score ? curr : best
    );

    // Sort by most recent first
    const sortedAttempts = [...attempts].sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const visibleAttempts = expanded ? sortedAttempts : sortedAttempts.slice(0, 3);
    const hasMore = sortedAttempts.length > 3;

    // Streak: consecutive passed attempts from most recent
    const currentStreak = sortedAttempts.reduce((streak, a) => {
        if (a.passed && streak === sortedAttempts.indexOf(a)) return streak + 1;
        return streak;
    }, 0);

    return (
        <div className="space-y-4">
            {/* Best attempt highlight */}
            <BestAttemptCard attempt={bestAttempt} passingScore={passingScore} />

            {/* Stats row */}
            <div className="flex items-center gap-4 px-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <HistoryIcon className="size-3.5" />
                    <span>
                        <span className="font-medium text-foreground">{attempts.length}</span> attempt{attempts.length !== 1 ? "s" : ""}
                    </span>
                </div>
                {currentStreak > 1 && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <FlameIcon className="size-3.5" />
                        <span className="font-medium">{currentStreak} streak</span>
                    </div>
                )}
            </div>

            {/* Attempts list */}
            <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
                <div className="px-3 py-2 border-b border-border/50">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        History
                    </h4>
                </div>
                <div className="p-1.5 space-y-0.5">
                    {visibleAttempts.map((attempt) => (
                        <AttemptRow key={attempt.id} attempt={attempt} />
                    ))}
                </div>

                {/* Show more */}
                {hasMore && (
                    <div className="px-3 pb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpanded(!expanded)}
                            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
                        >
                            <ChevronDownIcon
                                className={cn(
                                    "size-3.5 transition-transform",
                                    expanded && "rotate-180"
                                )}
                            />
                            {expanded
                                ? "Show less"
                                : `Show ${sortedAttempts.length - 3} more`}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
