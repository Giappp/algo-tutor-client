"use client";

import { use, useState, useCallback } from "react";
import Link from "next/link";
import { TheoryContent } from "@/components/learn/theory-content";
import { QuizContent } from "@/components/learn/quiz/quiz-content";
import { CodingContent } from "@/components/learn/coding-content";
import { useRoadmapActions, useRoadmapDetail, useLessonContent, useAutoMarkInProgress } from "@/hooks";
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
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-20">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                <BookOpenIcon className="size-8 text-muted-foreground/50" />
            </div>
            <div className="text-center">
                <h2 className="mb-1 text-lg font-semibold">Không tìm thấy bài học</h2>
                <p className="text-sm text-muted-foreground">
                    Chưa có nội dung cho: <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{lessonSlug}</code>
                </p>
            </div>
        </div>
    );
}

function LessonLoading() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Đang tải bài học...</p>
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
        <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center gap-6 px-6 py-20 text-center">
            <div className="relative">
                <div className="absolute -inset-1 animate-pulse rounded-2xl bg-[var(--lesson-accent)] opacity-35 blur-lg" />
                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-background shadow-lg">
                    <LockIcon className="size-7 text-[var(--lesson-accent)]" />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="flex items-center justify-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                    Nội dung giới hạn
                    <SparklesIcon className="size-5 text-amber-500 fill-amber-500" />
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Bạn cần đăng ký lộ trình học này để mở khóa bài học, làm các câu hỏi trắc nghiệm và thử thách lập trình.
                </p>
            </div>

            <div className="flex w-full flex-col items-center gap-3 pt-2 sm:flex-row">
                <button
                    onClick={onEnroll}
                    disabled={isEnrolling}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-[1.01] hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75"
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
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeftIcon className="size-3" />
                Quay lại chi tiết lộ trình
            </Link>
        </div>
    );
}

export default function LearnPage({ params }: PageProps) {
    const { roadmapSlug, lessonSlug } = use(params);

    // Fetch roadmap structure (for navigator + lesson type detection) using custom hook
    const { roadmap, mutate: mutateRoadmap } = useRoadmapDetail(roadmapSlug);

    const lessonType: LessonType = roadmap
        ? getLessonType(roadmap.topics, lessonSlug)
        : (lessonSlug.includes("quiz") ? "QUIZ" : lessonSlug.includes("coding") ? "CODING" : "THEORY");

    // Fetch lesson content based on type using custom hook
    const { lessonData, isLoading: isLoadingContent, error: contentError, mutate: mutateContent } = useLessonContent(lessonSlug, lessonType);
    const { enroll, isEnrolling, updateLessonProgress } = useRoadmapActions();
    const [contentCompleted, setContentCompleted] = useState(false);

    const currentProgress = roadmap
        ? getCurrentLessonProgress(roadmap.topics, lessonSlug)
        : null;

    const isLocked = contentError?.response?.status === 403 || contentError?.status === 403;

    // Auto-mark lesson as IN_PROGRESS when opened (fire-and-forget, non-blocking)
    useAutoMarkInProgress(
        roadmapSlug,
        lessonSlug,
        isLocked ? "IN_PROGRESS" : currentProgress,
        !!roadmap
    );

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
                onComplete={async () => {
                    handleContentComplete();
                    try {
                        await updateLessonProgress(roadmapSlug, lessonSlug, "COMPLETED");
                        mutateRoadmap();
                    } catch (error) {
                        console.error("Failed to complete theory lesson:", error);
                    }
                }}
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
