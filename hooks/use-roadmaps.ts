import { usePaginatedData } from "./use-api-data";
import type { RoadmapListItem } from "@/lib/types/roadmap";

interface UseRoadmapsParams {
    page?: number;
    size?: number;
    level?: string;
}

export function useRoadmaps(params: UseRoadmapsParams) {
    const { data, pagination, error, isLoading, mutate } = usePaginatedData<
        RoadmapListItem,
        { level?: string }
    >("/roadmaps", {
        page: params.page ?? 0,
        size: params.size ?? 10,
        level: params.level,
    });

    return {
        roadmaps: data,
        pagination,
        error,
        isLoading,
        mutate,
    };
}
