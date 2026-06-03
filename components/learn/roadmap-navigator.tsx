"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { LessonTypeIcon } from "@/components/roadmap/lesson-type-icon";
import { DifficultyBadge } from "@/components/roadmap/difficulty-badge";
import { springs } from "@/lib/motion";
import type {
    RoadmapDetailResponse,
    TopicWithLessons,
    LessonType,
} from "@/lib/types/roadmap";
import {
    CheckIcon,
    LockIcon,
    PlayCircleIcon,
} from "lucide-react";

interface RoadmapNavigatorProps {
    roadmap: RoadmapDetailResponse;
    currentLessonSlug: string;
    roadmapSlug: string;
    onLessonSelect: (lessonSlug: string, type: LessonType) => void;
    panelVariant?: "desktop" | "mobile";
}

function getCompletedCount(topic: TopicWithLessons): number {
    return topic.lessons.filter((lesson) => lesson.progress === "COMPLETED").length;
}

function getDefaultOpenTopics(
    topics: TopicWithLessons[],
    currentLessonSlug: string
): string[] {
    const activeTopic = topics.find((topic) =>
        topic.lessons.some((lesson) => lesson.slug === currentLessonSlug)
    );

    if (!activeTopic) {
        return topics.slice(0, 2).map((topic) => String(topic.id));
    }

    return [String(activeTopic.id)];
}

export function RoadmapNavigator({
    roadmap,
    currentLessonSlug,
    onLessonSelect,
    panelVariant = "desktop",
}: RoadmapNavigatorProps) {
    const defaultOpenTopics = getDefaultOpenTopics(roadmap.topics, currentLessonSlug);
    const isMobile = panelVariant === "mobile";

    return (
        <div className="flex h-full min-h-0 flex-col bg-background/80">
            <div className="shrink-0 border-b border-border/50 px-4 py-3">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Nội dung lộ trình
                </p>
                <h2 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                    {roadmap.name}
                </h2>
            </div>

            <ScrollArea className="min-h-0 flex-1">
                <Accordion
                    type="multiple"
                    defaultValue={defaultOpenTopics}
                    className={cn(
                        "space-y-2",
                        isMobile ? "p-3" : "p-2.5"
                    )}
                >
                    {roadmap.topics.map((topic) => {
                        const completed = getCompletedCount(topic);
                        const total = topic.lessons.length;
                        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                        const topicLocked = topic.isLocked || topic.unlocked === false;
                        const hasActiveLesson = topic.lessons.some(
                            (lesson) => lesson.slug === currentLessonSlug
                        );

                        return (
                            <AccordionItem
                                key={topic.id}
                                value={String(topic.id)}
                                className={cn(
                                    "overflow-hidden rounded-2xl border bg-card/70 shadow-sm transition-colors",
                                    hasActiveLesson
                                        ? "border-primary/35 bg-primary/[0.035]"
                                        : "border-border/60"
                                )}
                            >
                                <AccordionTrigger
                                    className={cn(
                                        "group px-3.5 py-3 hover:no-underline",
                                        "data-[state=open]:border-b data-[state=open]:border-border/50"
                                    )}
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-3 text-left">
                                        <div
                                            className={cn(
                                                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold",
                                                topicLocked
                                                    ? "border-border bg-muted text-muted-foreground"
                                                    : hasActiveLesson
                                                        ? "border-primary/30 bg-primary text-primary-foreground"
                                                        : "border-primary/15 bg-primary/10 text-primary"
                                            )}
                                        >
                                            {topicLocked ? (
                                                <LockIcon className="size-4" />
                                            ) : (
                                                topic.displayOrder
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                                                    {topic.name}
                                                </h3>

                                                {hasActiveLesson && (
                                                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                                        Đang học
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-2 space-y-1.5">
                                                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                                    <motion.div
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            progress === 100
                                                                ? "bg-emerald-500"
                                                                : "bg-primary"
                                                        )}
                                                        initial={false}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={springs.gentle}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                    <span>
                                                        {completed}/{total} bài hoàn thành
                                                    </span>
                                                    <span className="font-medium">
                                                        {progress}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="pb-2 pt-2">
                                    <div className="space-y-1 px-2">
                                        {topic.lessons.map((lesson, lessonIndex) => {
                                            const isActive = lesson.slug === currentLessonSlug;
                                            const isCompleted = lesson.progress === "COMPLETED";
                                            const isLocked = topicLocked;

                                            return (
                                                <button
                                                    key={lesson.slug}
                                                    type="button"
                                                    disabled={isLocked}
                                                    aria-current={isActive ? "page" : undefined}
                                                    onClick={() => {
                                                        if (!isLocked) {
                                                            onLessonSelect(lesson.slug, lesson.type);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "group/lesson relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all",
                                                        isActive
                                                            ? "border-[var(--lesson-accent-border)] bg-[var(--lesson-accent-muted)] text-[var(--lesson-accent)] shadow-sm"
                                                            : isLocked
                                                                ? "cursor-not-allowed border-transparent text-muted-foreground/50 opacity-70"
                                                                : "border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/60 hover:text-foreground"
                                                    )}
                                                >
                                                    <div className="relative shrink-0">
                                                        <div
                                                            className={cn(
                                                                "flex size-7 items-center justify-center rounded-full border transition-colors",
                                                                isCompleted
                                                                    ? "border-emerald-500/20 bg-emerald-500/10"
                                                                    : isActive
                                                                        ? "border-[var(--lesson-accent-border)] bg-background"
                                                                        : isLocked
                                                                            ? "border-border bg-muted"
                                                                            : "border-border/70 bg-background group-hover/lesson:border-primary/30"
                                                            )}
                                                        >
                                                            {isCompleted ? (
                                                                <CheckIcon className="size-3.5 text-emerald-600" />
                                                            ) : isLocked ? (
                                                                <LockIcon className="size-3.5 text-muted-foreground" />
                                                            ) : isActive ? (
                                                                <PlayCircleIcon className="size-3.5 text-[var(--lesson-accent)]" />
                                                            ) : (
                                                                <LessonTypeIcon
                                                                    type={lesson.type}
                                                                    showLabel={false}
                                                                    className="size-3.5 text-muted-foreground"
                                                                />
                                                            )}
                                                        </div>

                                                        {lessonIndex < topic.lessons.length - 1 && (
                                                            <span className="absolute left-1/2 top-7 h-4 w-px -translate-x-1/2 bg-border/60" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <span
                                                                className={cn(
                                                                    "truncate text-sm leading-snug",
                                                                    isActive
                                                                        ? "font-bold"
                                                                        : "font-medium"
                                                                )}
                                                            >
                                                                {lesson.title}
                                                            </span>
                                                        </div>

                                                        <div className="mt-1 flex items-center gap-2">
                                                            <DifficultyBadge
                                                                difficulty={lesson.difficulty}
                                                                className="h-4 shrink-0 px-1.5 text-[10px]"
                                                            />

                                                            {isCompleted && (
                                                                <span className="text-[10px] font-medium text-emerald-600">
                                                                    Hoàn thành
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            </ScrollArea>
        </div>
    );
}