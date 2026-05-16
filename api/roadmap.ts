import { apiClient } from "@/api/api-client";
import type {
    RoadmapDetailResponse,
    RoadmapListItem,
    LessonProgressUpdateRequest,
    LessonProgressUpdateResponse,
    EnrollmentDetailResponse,
} from "@/lib/types/roadmap";
import type { ApiResponse } from "@/lib/types";

export const roadmapApi = {
    list: async (params?: {
        level?: string;
        page?: number;
        size?: number;
    }): Promise<RoadmapListItem[]> => {
        const response = await apiClient.get<
            ApiResponse<{ data: RoadmapListItem[] }>
        >("/roadmaps", { params });
        return response.data.data.data;
    },

    getBySlug: async (slug: string): Promise<RoadmapDetailResponse> => {
        const response = await apiClient.get<
            ApiResponse<RoadmapDetailResponse>
        >(`/roadmaps/${slug}`);
        return response.data.data;
    },

    enroll: async (
        slug: string
    ): Promise<{ id: string; userId: string; learningPathId: number }> => {
        const response = await apiClient.post<
            ApiResponse<{ id: string; userId: string; learningPathId: number }>
        >(`/roadmaps/${slug}/enroll`);
        return response.data.data;
    },

    updateLessonProgress: async (
        pathSlug: string,
        lessonSlug: string,
        status: LessonProgressUpdateRequest["status"]
    ): Promise<LessonProgressUpdateResponse> => {
        const response = await apiClient.patch<
            ApiResponse<LessonProgressUpdateResponse>
        >(`/roadmaps/${pathSlug}/lessons/${lessonSlug}/progress`, {
            status,
        } as LessonProgressUpdateRequest);
        return response.data.data;
    },

    getEnrollment: async (
        slug: string
    ): Promise<EnrollmentDetailResponse> => {
        const response = await apiClient.get<
            ApiResponse<EnrollmentDetailResponse>
        >(`/roadmaps/${slug}/enrollment`);
        return response.data.data;
    },
};

export type {
    RoadmapDetailResponse,
    RoadmapListItem,
    LessonProgressUpdateRequest,
    LessonProgressUpdateResponse,
    EnrollmentDetailResponse,
};
