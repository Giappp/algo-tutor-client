import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/lib/types/api";
import type {
    VideoContent,
    VideoProgress,
    VideoProgressUpdate,
} from "@/lib/types/lesson";

export const videoLessonApi = {
    getContent: async (lessonSlug: string): Promise<VideoContent> => {
        const response = await apiClient.get<ApiResponse<VideoContent>>(
            `/lessons/${lessonSlug}/video`
        );
        return response.data.data;
    },

    getProgress: async (lessonSlug: string): Promise<VideoProgress> => {
        const response = await apiClient.get<ApiResponse<VideoProgress>>(
            `/lessons/${lessonSlug}/video/progress`
        );
        return response.data.data;
    },

    updateProgress: async (
        lessonSlug: string,
        payload: VideoProgressUpdate
    ): Promise<VideoProgress> => {
        const response = await apiClient.patch<ApiResponse<VideoProgress>>(
            `/lessons/${lessonSlug}/video/progress`,
            payload
        );
        return response.data.data;
    },

    updateProgressKeepalive: (
        lessonSlug: string,
        payload: VideoProgressUpdate
    ): void => {
        if (typeof window === "undefined") return;

        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
        const path = `/lessons/${lessonSlug}/video/progress`;
        const url = new URL(`${baseUrl}${path}`, window.location.origin);

        void fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            credentials: "include",
            keepalive: true,
        }).catch(() => {
            // The page is leaving; the next heartbeat/resume fetch will reconcile state.
        });
    },
};
