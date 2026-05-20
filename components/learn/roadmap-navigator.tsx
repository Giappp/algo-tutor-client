"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LessonTypeIcon } from "@/components/roadmap/lesson-type-icon";
import { DifficultyBadge } from "@/components/roadmap/difficulty-badge";
import type {
    RoadmapDetailResponse,
    TopicWithLessons,
    LessonType,
} from "@/lib/types/roadmap";
import {
    CheckIcon,
    LockIcon,
} from "lucide-react";

interface RoadmapNavigatorProps {
    roadmap: RoadmapDetailResponse;
    currentLessonSlug: string;
    roadmapSlug: string;
    onLessonSelect: (lessonSlug: string, type: LessonType) => void;
    panelVariant?: "desktop" | "mobile";
}

function getCompletedCountByTopic(topics: TopicWithLessons[]): number[] {
    return topics.map((topic) =>
        topic.lessons.filter((l) => l.progress === "COMPLETED").length
    );
}

export function RoadmapNavigator({
    roadmap,
    currentLessonSlug,
    onLessonSelect,
}: RoadmapNavigatorProps) {
    const completedCounts = getCompletedCountByTopic(roadmap.topics);

    return (
        <ScrollArea className="flex-1">
            <Accordion
                type="multiple"
                className="p-2 space-y-1"
                defaultValue={roadmap.topics.map((t) => String(t.id))}
            >
                {roadmap.topics.map((topic, topicIndex) => {
                    const completed = completedCounts[topicIndex] ?? 0;
                    const total = topic.lessonCount;
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                    return (
                        <AccordionItem
                            key={topic.id}
                            value={String(topic.id)}
                            className="border-b-0 rounded-lg overflow-hidden"
                        >
                            <AccordionTrigger className="px-3 py-3 hover:no-underline bg-muted/50 hover:bg-muted/70 rounded-lg data-[state=open]:rounded-b-none">
                                <div className="flex flex-col gap-1.5 text-left w-full pr-2">
                                    <div className="flex items-center gap-2.5">
                                        <span className="size-7 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                            {topic.displayOrder}
                                        </span>
                                        <span className="text-base font-bold text-foreground leading-tight">
                                            {topic.name}
                                        </span>
                                        {topic.isLocked && (
                                            <LockIcon className="size-4 text-muted-foreground/70 shrink-0" />
                                        )}
                                    </div>
                                    <div className="ml-[38px]">
                                        <div className="h-1.5 rounded-full bg-background/80 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-primary/80 transition-all"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground/80 mt-1 inline-block">
                                            {completed}/{total} completed
                                        </span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <div className="py-1 px-1 space-y-0.5">
                                    {topic.lessons.map((lesson) => {
                                        const isActive = lesson.slug === currentLessonSlug;
                                        const isLocked = topic.isLocked;

                                        return (
                                            <button
                                                key={lesson.slug}
                                                disabled={isLocked}
                                                onClick={() => !isLocked && onLessonSelect(lesson.slug, lesson.type)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-left transition-all",
                                                    isActive
                                                        ? "bg-primary/10 border border-primary/25 text-primary"
                                                        : isLocked
                                                        ? "opacity-40 cursor-not-allowed text-muted-foreground"
                                                        : "hover:bg-muted/40 text-foreground/70 hover:text-foreground"
                                                )}
                                            >
                                                <div className="shrink-0">
                                                    {lesson.progress === "COMPLETED" ? (
                                                        <div className="size-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                                            <CheckIcon className="size-3 text-emerald-600" />
                                                        </div>
                                                    ) : isLocked ? (
                                                        <LockIcon className="size-4 text-muted-foreground/60" />
                                                    ) : (
                                                        <LessonTypeIcon type={lesson.type} showLabel={false} className="size-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-sm truncate leading-tight flex-1",
                                                    isActive ? "font-semibold" : "font-medium"
                                                )}>
                                                    {lesson.title}
                                                </span>
                                                <DifficultyBadge difficulty={lesson.difficulty} className="text-[10px] h-4 px-1.5 shrink-0" />
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
    );
}
