import { useApiData } from "./use-api-data";
import type { RoadmapDetailResponse } from "@/lib/types/roadmap";
import { useMemo } from "react";

export function useRoadmapDetail(slug: string | null | undefined) {
    const { data, error, isLoading, isValidating, mutate } = useApiData<RoadmapDetailResponse>(
        slug ? `/roadmaps/${slug}` : null,
        { revalidateOnFocus: false, shouldRetryOnError: false }
    );

    const transformedRoadmap = useMemo(() => {
        if (!data) return data;

        return {
            ...data,
            topics: data.topics?.map((topic) => ({
                ...topic,
                lessons: topic.lessons?.map((lesson) => ({
                    ...lesson,
                    progress: lesson.progress ?? lesson.status ?? null,
                })),
            })),
        };
    }, [data]);

    return {
        roadmap: transformedRoadmap,
        error,
        isLoading,
        isValidating,
        mutate,
    };
}
