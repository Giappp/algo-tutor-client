import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/lib/types/api";
import type { TestResult, Submission } from "@/lib/types/lesson";

export interface RunRequest {
    lessonSlug: string;
    language: string;
    code: string;
}

export interface RunResponse {
    results: TestResult[];
    totalTime: number;
    compilationError: string | null;
}

export interface SubmitResponse {
    id: string;
    status: Submission["status"];
    results: TestResult[];
    totalTime: number;
    memoryUsed: number;
    compilationError: string | null;
    lessonProgressUpdated: boolean;
}

export interface SubmissionSummary {
    id: string;
    timestamp: string;
    language: string;
    status: Submission["status"];
    passedCount: number;
    totalCount: number;
    executionTime: number;
    memoryUsed: number;
}

export const judgeApi = {
    run: async (data: RunRequest): Promise<RunResponse> => {
        const response = await apiClient.post<ApiResponse<RunResponse>>(
            "/judge/run",
            data
        );
        return response.data.data;
    },

    submit: async (data: RunRequest): Promise<SubmitResponse> => {
        const response = await apiClient.post<ApiResponse<SubmitResponse>>(
            "/judge/submit",
            data
        );
        return response.data.data;
    },

    getSubmissions: async (
        lessonSlug: string,
        params?: { page?: number; size?: number }
    ): Promise<SubmissionSummary[]> => {
        const response = await apiClient.get<ApiResponse<{ data: SubmissionSummary[] }>>(
            "/judge/submissions",
            { params: { lessonSlug, ...params } }
        );
        return response.data.data.data;
    },
};
