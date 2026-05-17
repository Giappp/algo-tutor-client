import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/lib/types/api";
import type { TheoryLesson, Quiz, CodingProblem } from "@/lib/types/lesson";

export const lessonApi = {
    getTheory: async (lessonSlug: string): Promise<TheoryLesson> => {
        const response = await apiClient.get<ApiResponse<TheoryLesson>>(
            `/lessons/${lessonSlug}/theory`
        );
        return response.data.data;
    },

    getQuiz: async (lessonSlug: string): Promise<Quiz> => {
        const response = await apiClient.get<ApiResponse<Quiz>>(
            `/lessons/${lessonSlug}/quiz`
        );
        return response.data.data;
    },

    getCoding: async (lessonSlug: string): Promise<CodingProblem> => {
        const response = await apiClient.get<ApiResponse<CodingProblem>>(
            `/lessons/${lessonSlug}/coding`
        );
        return response.data.data;
    },
};
