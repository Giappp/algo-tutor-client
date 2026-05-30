"use client";

import { use, useState, useCallback } from "react";
import useSWR from "swr";
import Link from "next/link";
import { TheoryContent } from "@/components/learn/theory-content";
import { QuizContent } from "@/components/learn/quiz/quiz-content";
import { CodingContent } from "@/components/learn/coding-content";
import { useRoadmapActions } from "@/hooks/use-roadmap-actions";
import { useAutoMarkInProgress } from "@/hooks/use-auto-mark-progress";
import { fetcher } from "@/api/fetchers";
import type { RoadmapDetailResponse, LessonType } from "@/lib/types/roadmap";
import type { TheoryLesson, Quiz, CodingProblem } from "@/lib/types/lesson";
import { BookOpenIcon, Loader2Icon, LockIcon, SparklesIcon, ArrowLeftIcon } from "lucide-react";

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

function LockedLessonContent({
    roadmapSlug,
    onEnroll,
    isEnrolling,
}: {
    roadmapSlug: string;
    onEnroll: () => void;
    isEnrolling: boolean;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto px-6 py-20 text-center space-y-6">
            <div className="relative">
                {/* Decorative background glow */}
                <div className="absolute -inset-1 rounded-full bg-linear-to-r from-purple-600 via-violet-600 to-fuchsia-600 opacity-70 blur-lg animate-pulse" />
                <div className="relative size-16 rounded-full bg-background border border-border flex items-center justify-center shadow-lg">
                    <LockIcon className="size-7 text-purple-500" />
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
                    Nội dung giới hạn
                    <SparklesIcon className="size-5 text-amber-500 fill-amber-500" />
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Bạn cần đăng ký lộ trình học này để mở khóa bài học, làm các câu hỏi trắc nghiệm và thử thách lập trình.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                <button
                    onClick={onEnroll}
                    disabled={isEnrolling}
                    className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-linear-to-r from-purple-600 via-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-600/35 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-600/45 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                    {isEnrolling ? (
                        <>
                            <Loader2Icon className="size-4 animate-spin" />
                            Đang đăng ký...
                        </>
                    ) : (
                        "Đăng ký lộ trình ngay"
                    )}
                </button>
            </div>

            <Link
                href={`/roadmaps/${roadmapSlug}`}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
                <ArrowLeftIcon className="size-3" />
                Quay lại chi tiết lộ trình
            </Link>
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
    const { data: lessonData, isLoading: isLoadingContent, error: contentError, mutate: mutateContent } = useSWR(
        contentEndpoint,
        fetcher,
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );
    const { enroll, isEnrolling, updateLessonProgress } = useRoadmapActions();
    const [contentCompleted, setContentCompleted] = useState(false);

    const currentProgress = roadmap
        ? getCurrentLessonProgress(roadmap.topics, lessonSlug)
        : null;

    const isLocked = contentError?.response?.status === 403 || contentError?.status === 403;

    // Auto-mark lesson as IN_PROGRESS when opened (fire-and-forget, non-blocking)
    useAutoMarkInProgress(roadmapSlug, lessonSlug, isLocked ? "IN_PROGRESS" : currentProgress);

    const isCompleted = currentProgress === "COMPLETED" || contentCompleted;

    const handleContentComplete = useCallback(() => {
        setContentCompleted(true);
    }, []);

    const handleEnroll = async () => {
        if (isEnrolling) return;
        try {
            const result = await enroll(roadmapSlug);
            if (result) {
                mutateRoadmap();
                mutateContent();
            }
        } catch {
            // error handled by api interceptor
        }
    };

    // Render lesson content based on type
    let content: React.ReactNode = null;

    if (isLocked) {
        content = (
            <LockedLessonContent
                roadmapSlug={roadmapSlug}
                onEnroll={handleEnroll}
                isEnrolling={isEnrolling}
            />
        );
    } else if (isLoadingContent) {
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
                roadmapSlug={roadmapSlug}
                lessonSlug={lessonSlug}
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

    return <>{content}</>;
}
