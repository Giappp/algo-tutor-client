"use client";

import useSWR from "swr";
import type { Quiz, QuizAttemptSummary } from "@/lib/types/lesson";
import { fetcher } from "@/api/fetchers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizAttemptsHistory } from "./quiz-attempts-history";
import {
    BookOpenIcon,
    ClockIcon,
    PlayIcon,
    RefreshCwIcon,
    TargetIcon,
    ZapIcon,
} from "lucide-react";

interface QuizOverviewProps {
    quiz: Quiz;
    roadmapSlug: string;
    lessonSlug: string;
    onStart: () => void;
}

// ─── QuizInfoCard ────────────────────────────────────────────────────────────

function QuizInfoCard({ quiz }: { quiz: Quiz }) {
    const multipleChoiceCount = quiz.questions.filter(
        (q) => q.type === "MULTIPLE_CHOICE"
    ).length;
    const singleChoiceCount = quiz.questions.length - multipleChoiceCount;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
            {/* Subtle gradient accent at top */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

            <div className="p-6 space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                    <h1 className="text-xl font-bold text-foreground leading-tight">
                        {quiz.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Test your understanding with this quiz
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatItem
                        icon={<BookOpenIcon className="size-4" />}
                        label="Questions"
                        value={`${quiz.questions.length}`}
                        color="text-primary"
                        bgColor="bg-primary/10"
                    />
                    <StatItem
                        icon={<TargetIcon className="size-4" />}
                        label="Pass score"
                        value={`${quiz.passingScore}%`}
                        color="text-emerald-600 dark:text-emerald-400"
                        bgColor="bg-emerald-500/10"
                    />
                    <StatItem
                        icon={<ZapIcon className="size-4" />}
                        label="Single choice"
                        value={`${singleChoiceCount}`}
                        color="text-blue-600 dark:text-blue-400"
                        bgColor="bg-blue-500/10"
                    />
                    <StatItem
                        icon={<ClockIcon className="size-4" />}
                        label="Multi choice"
                        value={`${multipleChoiceCount}`}
                        color="text-amber-600 dark:text-amber-400"
                        bgColor="bg-amber-500/10"
                    />
                </div>

                {/* Question type badges */}
                <div className="flex flex-wrap gap-2">
                    {singleChoiceCount > 0 && (
                        <Badge variant="secondary" className="text-xs gap-1">
                            <span className="size-1.5 rounded-full bg-blue-500" />
                            {singleChoiceCount} single choice
                        </Badge>
                    )}
                    {multipleChoiceCount > 0 && (
                        <Badge
                            variant="secondary"
                            className="text-xs gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        >
                            <span className="size-1.5 rounded-full bg-amber-500" />
                            {multipleChoiceCount} multiple choice
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── StatItem ────────────────────────────────────────────────────────────────

function StatItem({
    icon,
    label,
    value,
    color,
    bgColor,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string;
    bgColor: string;
}) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
            <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", bgColor, color)}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-foreground tabular-nums">{value}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
            </div>
        </div>
    );
}

// ─── StartButton ─────────────────────────────────────────────────────────────

function StartButton({
    hasAttempts,
    onStart,
}: {
    hasAttempts: boolean;
    onStart: () => void;
}) {
    return (
        <Button
            onClick={onStart}
            size="lg"
            className={cn(
                "w-full gap-2.5 h-12 text-base font-semibold rounded-xl shadow-md transition-all",
                "hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]",
                hasAttempts
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/25"
            )}
        >
            {hasAttempts ? (
                <>
                    <RefreshCwIcon className="size-4.5" />
                    Practice Again
                </>
            ) : (
                <>
                    <PlayIcon className="size-4.5" />
                    Start Quiz
                </>
            )}
        </Button>
    );
}

// ─── Loading ─────────────────────────────────────────────────────────────────

function OverviewSkeleton() {
    return (
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
            <Skeleton className="h-[200px] w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-[140px] w-full rounded-2xl" />
        </div>
    );
}

// ─── QuizOverview (main) ─────────────────────────────────────────────────────

export function QuizOverview({
    quiz,
    roadmapSlug,
    lessonSlug,
    onStart,
}: QuizOverviewProps) {
    const { data: attempts, isLoading } = useSWR<QuizAttemptSummary[]>(
        `/quiz/${lessonSlug}/quiz-attempts`,
        fetcher,
        { revalidateOnFocus: false }
    );

    if (isLoading) return <OverviewSkeleton />;

    const hasAttempts = !!attempts && attempts.length > 0;

    return (
        <div className="flex-1 overflow-y-auto bg-background/30">
            <div className="max-w-5xl mx-auto px-6 py-6 sm:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Panel: Quiz details & entry */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="space-y-2">
                            <h2 className="text-sm font-semibold text-[var(--lesson-accent)] tracking-wider uppercase">
                                Lesson Quiz
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Đánh giá mức độ hiểu biết của bạn để đánh dấu hoàn thành bài học này.
                            </p>
                        </div>

                        {/* Quiz stats & info */}
                        <QuizInfoCard quiz={quiz} />

                        {/* Instructions / Tips */}
                        <div className="rounded-2xl border border-border bg-card/60 p-5 space-y-3.5 relative overflow-hidden">
                            <div className="absolute right-0 top-0 size-24 bg-primary/5 blur-2xl rounded-full" />
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <ZapIcon className="size-4 text-amber-500 fill-amber-500" />
                                Hướng dẫn làm bài
                            </h4>
                            <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
                                <li><strong>Điểm tối thiểu đạt:</strong> Bạn cần đạt ít nhất <span className="text-emerald-500 font-semibold">{quiz.passingScore}%</span> số câu trả lời chính xác để hoàn thành bài này.</li>
                                <li><strong>Không giới hạn thời gian:</strong> Hãy suy nghĩ kỹ trước khi chọn, không có áp lực thời gian.</li>
                                <li><strong>Hỗ trợ làm lại:</strong> Bạn có thể làm lại quiz này bao nhiêu lần tùy thích để ôn tập và cải thiện điểm số.</li>
                                <li><strong>Học cùng AI:</strong> Nếu gặp câu khó, bạn luôn có thể bật bảng <strong>AI Tutor</strong> ở góc trên bên phải để được hướng dẫn!</li>
                            </ul>
                        </div>

                        {/* Start action */}
                        <div className="pt-2">
                            <StartButton hasAttempts={hasAttempts} onStart={onStart} />
                        </div>
                    </div>

                    {/* Right Panel: Attempts History */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                                Lịch sử làm bài
                            </h3>
                            <QuizAttemptsHistory
                                roadmapSlug={roadmapSlug}
                                lessonSlug={lessonSlug}
                                passingScore={quiz.passingScore}
                            />
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
