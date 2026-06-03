"use client";

import { use } from "react";
import { usePathname } from "next/navigation";
import { useRoadmapActions } from "@/hooks/use-roadmap-actions";
import { useRoadmapDetail } from "@/hooks";
import { LearningLayout } from "@/components/learn/learning-layout";
import { LessonThemeProvider } from "@/components/learn/lesson-theme-provider";
import type { RoadmapDetailResponse, LessonType } from "@/lib/types/roadmap";
import { Loader2Icon } from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ roadmapSlug: string }>;
}

function getLessonType(
    topics: RoadmapDetailResponse["topics"],
    lessonSlug: string
): LessonType {
    for (const topic of topics) {
        const lesson = topic.lessons.find((l) => l.slug === lessonSlug);
        if (lesson) return lesson.type;
    }
    if (lessonSlug.includes("quiz")) return "QUIZ";
    if (lessonSlug.includes("coding")) return "CODING";
    return "THEORY";
}

export default function RoadmapLearnLayout({ children, params }: LayoutProps) {
    const { roadmapSlug } = use(params);
    const pathname = usePathname();

    // Extract active lessonSlug from pathname: /learn/[roadmapSlug]/[lessonSlug]
    const segments = pathname.split("/");
    const lessonSlug = segments[3] || "";

    // Fetch roadmap structure at the layout level using custom hook
    const { roadmap, mutate: mutateRoadmap } = useRoadmapDetail(roadmapSlug);

    const { updateLessonProgress, isUpdatingProgress } = useRoadmapActions();

    if (!roadmap) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading course...</p>
                </div>
            </div>
        );
    }

    const lessonType = getLessonType(roadmap.topics, lessonSlug);
    const isLocked = !roadmap.enrolled;

    const handleMarkComplete = async () => {
        if (!lessonSlug) return;
        try {
            await updateLessonProgress(roadmapSlug, lessonSlug, "COMPLETED");
            mutateRoadmap();
        } catch {
            // error handled by API interceptor
        }
    };

    return (
        <LessonThemeProvider lessonType={lessonType}>
            <LearningLayout
                roadmapSlug={roadmapSlug}
                lessonSlug={lessonSlug}
                lessonType={lessonType}
                roadmapData={roadmap}
                isUpdating={isUpdatingProgress}
                isLocked={isLocked}
                onMarkComplete={handleMarkComplete}
            >
                {children}
            </LearningLayout>
        </LessonThemeProvider>
    );
}
