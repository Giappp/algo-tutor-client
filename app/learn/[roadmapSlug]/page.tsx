"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RoadmapDetailResponse } from "@/lib/types/roadmap";
import { Loader2Icon } from "lucide-react";
import { useRoadmapDetail } from "@/hooks";

interface PageProps {
    params: Promise<{ roadmapSlug: string }>;
}

/**
 * /learn/:roadmapSlug — Auto-redirect to the next incomplete lesson.
 *
 * Logic:
 * 1. Fetch roadmap detail (includes progress)
 * 2. Find the first lesson that is NOT completed
 * 3. Redirect to /learn/:roadmapSlug/:lessonSlug
 * 4. If all completed → redirect to the last lesson
 * 5. If not enrolled → redirect to /roadmaps/:slug
 */
function getNextLessonSlug(roadmap: RoadmapDetailResponse): string | null {
    const allLessons = roadmap.topics
        .filter((t) => !(t.isLocked || t.unlocked === false))
        .flatMap((t) => t.lessons);

    if (allLessons.length === 0) return null;

    // Find first incomplete lesson
    const nextLesson = allLessons.find((l) => l.progress !== "COMPLETED");
    if (nextLesson) return nextLesson.slug;

    // All completed — go to last lesson
    return allLessons[allLessons.length - 1].slug;
}

export default function LearnRoadmapPage({ params }: PageProps) {
    const { roadmapSlug } = use(params);
    const router = useRouter();

    const { roadmap, error } = useRoadmapDetail(roadmapSlug);

    useEffect(() => {
        if (error) {
            // Roadmap not found or not enrolled → go to roadmap detail
            router.replace(`/roadmaps/${roadmapSlug}`);
            return;
        }

        if (!roadmap) return; // Still loading

        if (!roadmap.enrolled) {
            // Not enrolled → redirect to roadmap detail page to enroll
            router.replace(`/roadmaps/${roadmapSlug}`);
            return;
        }

        const lessonSlug = getNextLessonSlug(roadmap);
        if (lessonSlug) {
            router.replace(`/learn/${roadmapSlug}/${lessonSlug}`);
        } else {
            // No lessons available → go back to roadmap
            router.replace(`/roadmaps/${roadmapSlug}`);
        }
    }, [roadmap, error, roadmapSlug, router]);

    return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Resuming your progress...</p>
            </div>
        </div>
    );
}
