"use client";

import useSWR, { mutate as globalMutate } from "swr";
import { useCallback } from "react";
import { roadmapApi } from "@/api/roadmap";
import { fetcher } from "@/api/fetchers";
import type {
    RoadmapDetailResponse,
    ProgressStatus,
    LessonProgressUpdateResponse,
    LessonWithProgress,
} from "@/lib/types/roadmap";

/**
 * Hook for tracking and updating lesson progress with optimistic updates.
 *
 * Uses SWR's optimistic mutation pattern to immediately update the UI
 * when a lesson is marked complete, then rolls back if the API call fails.
 */
export function useLessonProgress(pathSlug: string, lessonSlug: string) {
    /**
     * Update lesson progress with optimistic UI update.
     *
     * On success: the SWR cache is already updated via mutation,
     * so we just revalidate to sync with server state.
     *
     * On failure: we rollback by re-applying the previous status
     * through the roadmap cache mutation.
     */
    const updateProgress = useCallback(
        async (status: ProgressStatus): Promise<LessonProgressUpdateResponse | null> => {
            // Build the cache key for the roadmap detail
            const cacheKey = `/roadmaps/${pathSlug}`;

            try {
                // Optimistically update the cache
                globalMutate(
                    cacheKey,
                    (current: RoadmapDetailResponse | undefined) => {
                        if (!current) return current;

                        // Deep clone to avoid mutation
                        const updated = JSON.parse(JSON.stringify(current)) as RoadmapDetailResponse;

                        // Find and update the lesson's progress
                        for (const topic of updated.topics) {
                            const lesson = topic.lessons.find((l) => l.slug === lessonSlug);
                            if (lesson) {
                                lesson.progress = status;
                                lesson.status = status;
                                break;
                            }
                        }

                        return updated;
                    },
                    { revalidate: false }
                );

                // Call the API
                const result = await roadmapApi.updateLessonProgress(pathSlug, lessonSlug, status);

                // Revalidate to sync with server (server is source of truth)
                await globalMutate(cacheKey);

                return result;
            } catch (error) {
                // Rollback: re-fetch the roadmap to restore correct state
                await globalMutate(cacheKey);
                throw error;
            }
        },
        [pathSlug, lessonSlug]
    );

    /**
     * Mark a lesson as complete. Shorthand for updateProgress("COMPLETED").
     */
    const markComplete = useCallback(async () => {
        return updateProgress("COMPLETED");
    }, [updateProgress]);

    /**
     * Mark a lesson as in progress. Useful for tracking when a user starts a lesson.
     */
    const markInProgress = useCallback(async () => {
        return updateProgress("IN_PROGRESS");
    }, [updateProgress]);

    return {
        updateProgress,
        markComplete,
        markInProgress,
    };
}

/**
 * Hook to get all lesson progressions for the current user in a roadmap.
 * Used by the dashboard to show progress across all enrolled paths.
 */
export function useRoadmapProgress(slug: string) {
    const { data, error, isLoading } = useSWR(
        `/roadmaps/${slug}/enrollment`,
        fetcher,
        { revalidateOnFocus: false }
    );

    return {
        enrollment: data,
        isLoading,
        error,
    };
}

/**
 * Utility: find the next incomplete lesson in a roadmap.
 * Used by the dashboard to provide a "Continue Learning" link.
 */
export function findNextLesson(roadmap: RoadmapDetailResponse): LessonWithProgress | null {
    if (!roadmap.topics) return null;

    for (const topic of roadmap.topics) {
        if (!topic.unlocked) continue;
        for (const lesson of topic.lessons) {
            if (lesson.progress !== "COMPLETED") {
                return lesson;
            }
        }
    }

    return null;
}
