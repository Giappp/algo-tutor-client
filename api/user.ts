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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getProfile: async (): Promise<any> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiClient.get<ApiResponse<any>>("/users/me/profile");
        return response.data.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateProfile: async (data: { username: string; email: string; avatar: string }): Promise<any> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiClient.put<ApiResponse<any>>("/users/me/profile", data);
        return response.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changePassword: async (data: any): Promise<any> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiClient.put<ApiResponse<any>>("/users/me/change-password", data);
        return response.data;
    },

    getActivityHeatmap: async (year: number): Promise<Record<string, number>> => {
        const response = await apiClient.get<ApiResponse<Record<string, number>>>(
            "/users/me/activity-heatmap",
            { params: { year } }
        );
        return response.data.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getActiveSessions: async (): Promise<any[]> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiClient.get<ApiResponse<any[]>>("/users/me/sessions");
        return response.data.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    terminateSession: async (id: number): Promise<any> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiClient.delete<ApiResponse<any>>(`/users/me/sessions/${id}`);
        return response.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    terminateOtherSessions: async (): Promise<any> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiClient.delete<ApiResponse<any>>("/users/me/sessions/other");
        return response.data;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    uploadImage: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append("file", file);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await apiClient.post<ApiResponse<any>>("/upload/images", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },
};
