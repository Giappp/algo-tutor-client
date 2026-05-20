import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/lib/types/api";
import type { CurrentLessonResponse, EnrollmentListItem } from "@/lib/types/user";

export const userApi = {
    getCurrentLesson: async (): Promise<CurrentLessonResponse | null> => {
        const response = await apiClient.get<ApiResponse<CurrentLessonResponse>>(
            "/users/me/current-lesson"
        );
        // Backend returns 204 for no current lesson
        if (response.status === 204) return null;
        return response.data.data;
    },

    getEnrollments: async (): Promise<EnrollmentListItem[]> => {
        const response = await apiClient.get<ApiResponse<EnrollmentListItem[]>>(
            "/users/me/enrollments"
        );
        return response.data.data;
    },
};
