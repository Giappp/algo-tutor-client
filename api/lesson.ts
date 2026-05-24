import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/lib/types/api";
import type {
    TheoryLesson,
    Quiz,
    CodingProblem,
    QuizAttemptRequest,
    QuizAttemptResponse,
    QuizAttemptSummary,
} from "@/lib/types/lesson";

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

    submitQuizAttempt: async (
        lessonSlug: string,
        data: QuizAttemptRequest
    ): Promise<QuizAttemptResponse> => {
        const response = await apiClient.post<ApiResponse<QuizAttemptResponse>>(
            `/quiz/${lessonSlug}/quiz-attempts`,
            data
        );
        return response.data.data;
    },

    getQuizAttempts: async (
        roadmapSlug: string,
        lessonSlug: string
    ): Promise<QuizAttemptSummary[]> => {
        const response = await apiClient.get<ApiResponse<QuizAttemptSummary[]>>(
            `/roadmaps/${roadmapSlug}/lessons/${lessonSlug}/quiz-attempts`
        );
        return response.data.data;
    },
};
