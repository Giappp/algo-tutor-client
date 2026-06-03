import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/lib/types/api";
import type { TestResult, Submission } from "@/lib/types/lesson";

export interface RunRequest {
    lessonSlug: string;
    language: string;
    code: string;
}

// ─── Raw backend response shapes ──────────────────────────────────────────────

interface RawTestCase {
    index: number;
    status: string;
    stdin: string | null;
    expectedOutput: string | null;
    actualOutput: string | null;
    timeMs: number;
    memoryKb: number;
    hidden: boolean;
    errorMessage: string | null;
}

interface RawJudgeResponse {
    submissionId: string | null;
    verdict: string;
    summary: { passed: number; failed: number; total: number };
    performance: { totalTimeMs: number; maxMemoryKb: number };
    testCases: RawTestCase[];
    compilationError: string | null;
    lessonProgressUpdated: boolean | null;
}

// ─── FE-facing response types ─────────────────────────────────────────────────

export interface JudgeSummary {
    passed: number;
    failed: number;
    total: number;
}

export interface JudgePerformance {
    totalTimeMs: number;
    maxMemoryKb: number;
}

export interface RunResponse {
    verdict: Submission["status"];
    summary: JudgeSummary;
    performance: JudgePerformance;
    results: TestResult[];
    totalTime: number;
    compilationError: string | null;
}

export interface SubmitResponse {
    id: string;
    status: Submission["status"];
    summary: JudgeSummary;
    performance: JudgePerformance;
    results: TestResult[];
    totalTime: number;
    memoryUsed: number;
    compilationError: string | null;
    lessonProgressUpdated: boolean;
}

export interface SubmissionSummary {
    id: string;
    language: string;
    status: Submission["status"];
    passedTestcases: number;
    totalTestcases: number;
    executionTime: number;
    memoryUsed: number;
    submittedAt: Date;
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function mapTestCases(raw: RawTestCase[]): TestResult[] {
    return raw.map((tc) => ({
        stdin: tc.stdin ?? "",
        expected: tc.expectedOutput ?? "",
        actual: tc.actualOutput ?? "",
        passed: tc.status === "ACCEPTED",
        hidden: tc.hidden,
        executionTime: tc.timeMs,
        error: tc.errorMessage ?? undefined,
    }));
}

function mapVerdict(verdict: string): Submission["status"] {
    const map: Record<string, Submission["status"]> = {
        PENDING: "PENDING",
        ACCEPTED: "ACCEPTED",
        WRONG_ANSWER: "WRONG_ANSWER",
        RUNTIME_ERROR: "RUNTIME_ERROR",
        TIME_LIMIT_EXCEEDED: "TIME_LIMIT_EXCEEDED",
        MEMORY_LIMIT_EXCEEDED: "TIME_LIMIT_EXCEEDED",
        COMPILATION_ERROR: "COMPILATION_ERROR",
    };
    return map[verdict] ?? "WRONG_ANSWER";
}

// ─── API client ───────────────────────────────────────────────────────────────

export const judgeApi = {
    run: async (data: RunRequest): Promise<RunResponse> => {
        const response = await apiClient.post<ApiResponse<RawJudgeResponse>>(
            "/judge/run",
            {
                ...data,
                language: data.language.toUpperCase(),
            }
        );
        const raw = response.data.data;
        return {
            verdict: mapVerdict(raw.verdict),
            summary: raw.summary ?? { passed: 0, failed: 0, total: 0 },
            performance: raw.performance ?? { totalTimeMs: 0, maxMemoryKb: 0 },
            results: mapTestCases(raw.testCases ?? []),
            totalTime: raw.performance?.totalTimeMs ?? 0,
            compilationError: raw.compilationError,
        };
    },

    submit: async (data: RunRequest): Promise<SubmitResponse> => {
        const response = await apiClient.post<ApiResponse<RawJudgeResponse>>(
            "/judge/submit",
            {
                ...data,
                language: data.language.toUpperCase(),
            }
        );
        const raw = response.data.data;
        return {
            id: raw.submissionId ?? "",
            status: mapVerdict(raw.verdict),
            summary: raw.summary ?? { passed: 0, failed: 0, total: 0 },
            performance: raw.performance ?? { totalTimeMs: 0, maxMemoryKb: 0 },
            results: mapTestCases(raw.testCases ?? []),
            totalTime: raw.performance?.totalTimeMs ?? 0,
            memoryUsed: Math.round((raw.performance?.maxMemoryKb ?? 0) / 1024),
            compilationError: raw.compilationError,
            lessonProgressUpdated: raw.lessonProgressUpdated ?? false,
        };
    },

    getSubmissions: async (
        lessonSlug: string,
        params?: { page?: number; size?: number }
    ): Promise<SubmissionSummary[]> => {
        const response = await apiClient.get<ApiResponse<SubmissionSummary[]>>(
            "/submissions",
            { params: { lessonSlug, ...params } }
        );
        return response.data.data;
    },
};
