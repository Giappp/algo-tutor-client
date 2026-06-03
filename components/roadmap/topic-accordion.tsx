"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { TopicWithLessons, LessonWithProgress } from "@/lib/types";
import { LessonTypeIcon } from "./lesson-type-icon";
import { DifficultyBadge } from "./difficulty-badge";
import {
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from "@/components/ui/accordion";
import { LockIcon, CheckIcon } from "lucide-react";
import type { ProgressStatus } from "@/lib/types";

interface TopicAccordionProps {
    topic: TopicWithLessons;
    completedCount?: number;
    className?: string;
    roadmapSlug?: string;
}

function statusIcon(status: ProgressStatus | null) {
    switch (status) {
        case "COMPLETED":
            return (
                <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/20">
                    <CheckIcon className="size-3.5 text-emerald-500" strokeWidth={2.5} />
                </div>
            );
        case "IN_PROGRESS":
            return (
                <div className="flex size-7 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/20">
                    <div className="size-2 rounded-full bg-amber-500" />
                </div>
            );
        default:
            return (
                <div className="flex size-7 items-center justify-center rounded-full bg-muted ring-1 ring-border">
                    <div className="size-2 rounded-full bg-muted-foreground/30" />
                </div>
            );
    }
}

function LessonItem({
    lesson,
    isLocked,
    index,
    roadmapSlug,
}: {
    lesson: LessonWithProgress;
    isLocked: boolean;
    index: number;
    roadmapSlug: string;
}) {
    const router = useRouter();

    const handleClick = () => {
        if (isLocked) return;
        router.push(`/learn/${roadmapSlug}/${lesson.slug}`);
    };

    return (
        <div
            onClick={handleClick}
            role="button"
            tabIndex={isLocked ? -1 : 0}
            onKeyDown={(e) => e.key === "Enter" && handleClick()}
            className={cn(
                "group/lesson flex items-center gap-3 rounded-xl p-3",
                "border border-transparent",
                "transition-all duration-200",
                isLocked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-muted/60 hover:border-border cursor-pointer",
            )}
            style={{ animationDelay: `${index * 40}ms` }}
        >
            {/* Type Icon */}
            <div className="shrink-0">
                {isLocked ? (
                    <div className="flex size-9 items-center justify-center rounded-xl bg-muted border border-border">
                        <LockIcon className="size-4 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="flex size-9 items-center justify-center rounded-xl border bg-background shadow-sm transition-shadow group-hover/lesson:shadow-md">
                        <LessonTypeIcon type={lesson.type} showLabel={false} />
                    </div>
                )}
            </div>

            {/* Lesson Info */}
            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <span
                    className={cn(
                        "text-sm font-medium leading-tight truncate",
                        isLocked ? "text-muted-foreground" : "text-foreground group-hover/lesson:text-primary transition-colors"
                    )}
                >
                    <span className="text-muted-foreground/40 font-mono text-xs mr-2">
                        {String(lesson.displayOrder).padStart(2, "0")}
                    </span>
                    {lesson.title}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                    <LessonTypeIcon type={lesson.type} showLabel={true} />
                    <DifficultyBadge difficulty={lesson.difficulty} />
                </div>
            </div>

            {/* Status */}
            <div className="shrink-0">
                {isLocked ? (
                    <LockIcon className="size-4 text-muted-foreground" />
                ) : (
                    statusIcon(lesson.progress ?? null)
                )}
            </div>
        </div>
    );
}

export function TopicAccordion({
    topic,
    completedCount = 0,
    className,
    roadmapSlug,
}: TopicAccordionProps) {
    const totalLessons = topic.lessonCount;
    const codingLessons = topic.lessons.filter((l) => l.type === "CODING").length;
    const theoryLessons = topic.lessons.filter((l) => l.type === "THEORY").length;
    const quizLessons = topic.lessons.filter((l) => l.type === "QUIZ").length;

    const progressPercent =
        totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return (
        <AccordionItem
            value={topic.name}
            className={cn("border-b border-border/60 last:border-b-0", className)}
        >
            <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-muted/30 rounded-xl transition-colors duration-200">
                <div className="flex items-start gap-4 text-left w-full pr-2">
                    {/* Topic Number Badge */}
                    <div
                        className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors duration-200",
                            !topic.unlocked
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/10 text-primary",
                        )}
                    >
                        {topic.displayOrder}
                    </div>

                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                        {/* Title Row */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground tracking-tight">
                                {topic.name}
                            </span>
                            {!topic.unlocked && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                                    <LockIcon className="size-2.5 text-muted-foreground" />
                                    <span className="text-[10px] font-medium text-muted-foreground">Locked</span>
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground font-normal leading-relaxed line-clamp-1">
                            {topic.description}
                        </p>

                        {/* Meta Row */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                                <span className="font-semibold text-foreground">{totalLessons}</span>
                                <span>lessons</span>
                            </span>
                            {theoryLessons > 0 && (
                                <span className="text-[11px] text-blue-500/80 font-medium">
                                    {theoryLessons} theory
                                </span>
                            )}
                            {quizLessons > 0 && (
                                <span className="text-[11px] text-amber-500/80 font-medium">
                                    {quizLessons} quiz
                                </span>
                            )}
                            {codingLessons > 0 && (
                                <span className="text-[11px] text-emerald-500/80 font-medium">
                                    {codingLessons} coding
                                </span>
                            )}

                            {/* Progress indicator */}
                            {completedCount > 0 && topic.unlocked && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-[11px] font-semibold text-primary">
                                        {completedCount}/{totalLessons}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">done</span>
                                </div>
                            )}
                        </div>
 
                        {/* Progress Bar */}
                        {completedCount > 0 && topic.unlocked && (
                            <div className="h-1 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-700 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </AccordionTrigger>

            <AccordionContent className="pb-3">
                <div className="pl-[72px] pr-3 space-y-1">
                    {topic.lessons.map((lesson, i) => (
                        <LessonItem
                            key={lesson.slug}
                            lesson={lesson}
                            isLocked={!topic.unlocked}
                            index={i}
                            roadmapSlug={roadmapSlug ?? ""}
                        />
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
