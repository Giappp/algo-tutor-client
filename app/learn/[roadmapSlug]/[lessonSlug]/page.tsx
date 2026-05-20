"use client";

import { use, useState, useCallback } from "react";
import useSWR from "swr";
import { LearningLayout } from "@/components/learn/learning-layout";
import { TheoryContent } from "@/components/learn/theory-content";
import { QuizContent } from "@/components/learn/quiz-content";
import { CodingContent } from "@/components/learn/coding-content";
import { useRoadmapActions } from "@/hooks/use-roadmap-actions";
import { useAutoMarkInProgress } from "@/hooks/use-auto-mark-progress";
import { fetcher } from "@/api/fetchers";
import type { RoadmapDetailResponse, LessonType } from "@/lib/types/roadmap";
import type { TheoryLesson, Quiz, CodingProblem } from "@/lib/types/lesson";
import { BookOpenIcon, Loader2Icon } from "lucide-react";

interface PageProps {
    params: Promise<{ roadmapSlug: string; lessonSlug: string }>;
}

function getLessonType(
    topics: RoadmapDetailResponse["topics"],
    lessonSlug: string
): LessonType {
    for (const topic of topics) {
        const lesson = topic.lessons.find((l) => l.slug === lessonSlug);
        if (lesson) return lesson.type;
    }
    // Fallback: detect from slug
    if (lessonSlug.includes("quiz")) return "QUIZ";
    if (lessonSlug.includes("coding")) return "CODING";
    return "THEORY";
}

function getCurrentLessonProgress(
    topics: RoadmapDetailResponse["topics"],
    lessonSlug: string
) {
    for (const topic of topics) {
        const lesson = topic.lessons.find((l) => l.slug === lessonSlug);
        if (lesson) return lesson.progress;
    }
    return null;
}

function NotFoundContent({ lessonSlug }: { lessonSlug: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                <BookOpenIcon className="size-8 text-muted-foreground/50" />
            </div>
            <div className="text-center">
                <h2 className="text-lg font-semibold mb-1">Lesson not found</h2>
                <p className="text-sm text-muted-foreground">
                    No content for: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{lessonSlug}</code>
                </p>
            </div>
        </div>
    );
}

function LessonLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading lesson...</p>
        </div>
    );
}

export default function LearnPage({ params }: PageProps) {
    const { roadmapSlug, lessonSlug } = use(params);

    // Fetch roadmap structure (for navigator + lesson type detection)
    const { data: roadmap, mutate: mutateRoadmap } = useSWR<RoadmapDetailResponse>(
        `/roadmaps/${roadmapSlug}`,
        fetcher,
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    const lessonType: LessonType = roadmap
        ? getLessonType(roadmap.topics, lessonSlug)
        : (lessonSlug.includes("quiz") ? "QUIZ" : lessonSlug.includes("coding") ? "CODING" : "THEORY");

    // Fetch lesson content based on type
    const contentEndpoint = `/lessons/${lessonSlug}/${lessonType.toLowerCase()}`;
    const { data: lessonData, isLoading: isLoadingContent } = useSWR(
        contentEndpoint,
        fetcher,
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    const { updateLessonProgress, isUpdatingProgress } = useRoadmapActions();
    const [contentCompleted, setContentCompleted] = useState(false);

    const currentProgress = roadmap
        ? getCurrentLessonProgress(roadmap.topics, lessonSlug)
        : null;

    // Auto-mark lesson as IN_PROGRESS when opened (fire-and-forget, non-blocking)
    useAutoMarkInProgress(roadmapSlug, lessonSlug, currentProgress);

    const isCompleted = currentProgress === "COMPLETED" || contentCompleted;

    const handleContentComplete = useCallback(() => {
        setContentCompleted(true);
    }, []);

    // Render lesson content based on type
    let content: React.ReactNode = null;

    if (isLoadingContent) {
        content = <LessonLoading />;
    } else if (lessonType === "THEORY" && lessonData) {
        content = (
            <TheoryContent
                lesson={lessonData as TheoryLesson}
                onComplete={handleContentComplete}
                isCompleted={isCompleted}
            />
        );
    } else if (lessonType === "QUIZ" && lessonData) {
        content = (
            <QuizContent
                quiz={lessonData as Quiz}
                onComplete={handleContentComplete}
                onMarkComplete={async () => {
                    try {
                        await updateLessonProgress(roadmapSlug, lessonSlug, "COMPLETED");
                        mutateRoadmap();
                        setContentCompleted(true);
                    } catch {
                        // error handled by API interceptor
                    }
                }}
                isCompleted={isCompleted}
            />
        );
    } else if (lessonType === "CODING" && lessonData) {
        content = (
            <CodingContent
                problem={lessonData as CodingProblem}
                onComplete={handleContentComplete}
                onMarkComplete={async () => {
                    try {
                        await updateLessonProgress(roadmapSlug, lessonSlug, "COMPLETED");
                        mutateRoadmap();
                        setContentCompleted(true);
                    } catch {
                        // error handled by API interceptor
                    }
                }}
                isCompleted={isCompleted}
            />
        );
    } else if (!isLoadingContent) {
        content = <NotFoundContent lessonSlug={lessonSlug} />;
    }

    return (
        <LearningLayout
            roadmapSlug={roadmapSlug}
            lessonSlug={lessonSlug}
            lessonType={lessonType}
            roadmapData={roadmap}
            isUpdating={isUpdatingProgress}
            onMarkComplete={async () => {
                try {
                    await updateLessonProgress(roadmapSlug, lessonSlug, "COMPLETED");
                    mutateRoadmap();
                    setContentCompleted(true);
                } catch {
                    // error handled by API interceptor
                }
            }}
        >
            {content}
        </LearningLayout>
    );
}
