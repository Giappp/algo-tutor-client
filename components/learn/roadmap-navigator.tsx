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
    panelVariant = "desktop",
}: RoadmapNavigatorProps) {
    const completedCounts = getCompletedCountByTopic(roadmap.topics);

    return (
        <ScrollArea className={panelVariant === "mobile" ? "flex-1" : "flex-1"}>
            <Accordion
                type="multiple"
                className="p-2"
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
                            className="border-b border-border/50 last:border-b-0"
                        >
                            <AccordionTrigger className="px-2 py-2.5 hover:no-underline">
                                <div className="flex flex-col gap-1 text-left w-full pr-2">
                                    <div className="flex items-center gap-2">
                                        <span className="size-5 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                            {topic.displayOrder}
                                        </span>
                                        <span className="text-xs font-semibold text-foreground truncate">
                                            {topic.name}
                                        </span>
                                        {topic.isLocked && (
                                            <LockIcon className="size-3 text-muted-foreground shrink-0" />
                                        )}
                                    </div>
                                    {completed > 0 && (
                                        <>
                                            <div className="h-1 rounded-full bg-muted overflow-hidden ml-7">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground ml-7">
                                                {completed}/{total} completed
                                            </span>
                                        </>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="pl-2 pr-1 pb-1 space-y-0.5">
                                    {topic.lessons.map((lesson) => {
                                        const isActive = lesson.slug === currentLessonSlug;
                                        const isLocked = topic.isLocked;

                                        return (
                                            <button
                                                key={lesson.slug}
                                                disabled={isLocked}
                                                onClick={() => !isLocked && onLessonSelect(lesson.slug, lesson.type)}
                                                className={cn(
                                                    "w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left transition-all text-xs",
                                                    isActive
                                                        ? "bg-primary/10 border border-primary/20 text-primary"
                                                        : isLocked
                                                        ? "opacity-40 cursor-not-allowed text-muted-foreground"
                                                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <div className="shrink-0">
                                                    {lesson.progress === "COMPLETED" ? (
                                                        <div className="size-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                                                            <CheckIcon className="size-3 text-emerald-500" />
                                                        </div>
                                                    ) : isLocked ? (
                                                        <LockIcon className="size-3.5 text-muted-foreground" />
                                                    ) : (
                                                        <LessonTypeIcon type={lesson.type} showLabel={false} className="size-4" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                                    <span className="truncate font-medium leading-tight">{lesson.title}</span>
                                                    <div className="flex items-center gap-1">
                                                        <LessonTypeIcon type={lesson.type} showLabel={true} className="text-[9px]" />
                                                        <DifficultyBadge difficulty={lesson.difficulty} className="text-[9px] h-3.5 px-1" />
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
    );
}
