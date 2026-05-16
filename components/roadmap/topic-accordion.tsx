"use client";

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

interface TopicAccordionProps {
    topic: TopicWithLessons;
    completedCount?: number;
    className?: string;
}

function LessonItem({
    lesson,
    isLocked,
}: {
    lesson: LessonWithProgress;
    isLocked: boolean;
}) {
    return (
        <div
            className={cn(
                "group/lesson flex items-center gap-3 rounded-lg p-3 transition-colors",
                isLocked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-muted/60 cursor-pointer"
            )}
        >
            {/* Type Icon */}
            <div className="shrink-0">
                {isLocked ? (
                    <div className="flex size-8 items-center justify-center rounded-md bg-muted border border-border">
                        <LockIcon className="size-4 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="flex size-8 items-center justify-center rounded-md border bg-background">
                        <LessonTypeIcon type={lesson.type} showLabel={false} />
                    </div>
                )}
            </div>

            {/* Lesson Info */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <span
                    className={cn(
                        "text-sm font-medium truncate",
                        isLocked ? "text-muted-foreground" : "text-foreground"
                    )}
                >
                    {lesson.displayOrder}. {lesson.title}
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
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                        <CheckIcon className="size-3.5 text-primary" />
                    </div>
                )}
            </div>
        </div>
    );
}

export function TopicAccordion({
    topic,
    completedCount = 0,
    className,
}: TopicAccordionProps) {
    const totalLessons = topic.lessonCount;
    const codingLessons = topic.lessons.filter(
        (l) => l.type === "CODING"
    ).length;
    const theoryLessons = topic.lessons.filter(
        (l) => l.type === "THEORY"
    ).length;
    const quizLessons = topic.lessons.filter(
        (l) => l.type === "QUIZ"
    ).length;

    const progressPercent =
        totalLessons > 0
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

    return (
        <AccordionItem
            value={topic.name}
            className={cn(
                "border-b border-border last:border-b-0",
                className
            )}
        >
            <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/40 rounded-lg">
                <div className="flex items-start gap-3 text-left w-full pr-2">
                    {/* Topic Number */}
                    <div
                        className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                            topic.isLocked
                                ? "bg-muted text-muted-foreground"
                                : "bg-primary/10 text-primary"
                        )}
                    >
                        {topic.displayOrder}
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                                {topic.name}
                            </span>
                            {topic.isLocked && (
                                <LockIcon className="size-3.5 text-muted-foreground" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground font-normal line-clamp-1">
                            {topic.description}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-[11px] text-muted-foreground">
                                {totalLessons} lessons
                            </span>
                            <span className="text-[11px] text-blue-500/80">
                                {theoryLessons} theory
                            </span>
                            <span className="text-[11px] text-amber-500/80">
                                {quizLessons} quiz
                            </span>
                            <span className="text-[11px] text-emerald-500/80">
                                {codingLessons} coding
                            </span>
                            {completedCount > 0 && !topic.isLocked && (
                                <span className="text-[11px] font-medium text-primary ml-auto">
                                    {completedCount}/{totalLessons} done
                                </span>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {completedCount > 0 && !topic.isLocked && (
                            <div className="h-1 rounded-full bg-muted overflow-hidden mt-0.5">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500 transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
                <div className="pl-[52px] pr-3 space-y-1">
                    {topic.lessons.map((lesson) => (
                        <LessonItem
                            key={lesson.slug}
                            lesson={lesson}
                            isLocked={topic.isLocked}
                        />
                    ))}
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
