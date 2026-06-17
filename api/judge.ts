import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/lib/types/api";
import type {
    Submission,
    SubmissionStatus,
    TestResult,
} from "@/lib/types/lesson";

export interface RunRequest {
    lessonSlug: string;
    language: string;
    code: string;
}

export interface JudgeTestCase {
    index: number;
    status: SubmissionStatus;
    timeMs: number;
    memoryKb: number;
    stdout: string;
    stderr: string;
}

export type SubmissionEvent =
    | {
        type: "TEST_CASE";
        submissionId: string;
        testCaseId: number;
        sortOrder: number;
        status: SubmissionStatus;
        timeMs: number;
        memoryKb: number;
        stdout: string;
        stderr: string;
        isCompleted: boolean;
    }
    | {
        type: "FINAL_RESULT";
        submissionId: string;
        status: SubmissionStatus;
        passed: number;
        total: number;
        maxTimeMs: number;
        maxMemoryKb: number;
        compilationError?: string | null;
        isCompleted: true;
    };

interface RawJudgeResponse {
    submissionId: string | null;
    verdict: SubmissionStatus;
    summary: JudgeSummary | null;
    performance: JudgePerformance | null;
    testCases: JudgeTestCase[] | null;
    compilationError: string | null;
    progressUpdated?: boolean;
}

interface RawSubmissionDetail {
    id: string;
    language: string;
    status: SubmissionStatus;
    sourceCode: string;
    passedTestCases: number;
    totalTestCases: number | null;
    executionTime: number | null;
    memoryUsed: number | null;
    compileOutput: string | null;
    progressUpdated?: boolean;
    submittedAt: string;
    testCases: JudgeTestCase[];
}

export interface JudgeSummary {
    passed: number;
    failed: number;
    total: number;
    executed: number;
}

export interface JudgePerformance {
    maxTimeMs: number;
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
    summary: JudgeSummary | null;
    performance: JudgePerformance | null;
    results: TestResult[] | null;
    compilationError: string | null;
    progressUpdated: boolean;
}

export interface SubmissionSummary {
    id: string;
    language: string;
    status: Submission["status"];
    passedTestCases?: number;
    totalTestCases?: number | null;
    passedTestcases?: number;
    totalTestcases?: number | null;
    executionTime: number | null;
    memoryUsed: number | null;
    progressUpdated?: boolean;
    submittedAt: string;
}

export interface SubmissionDetail {
    id: string;
    language: string;
    status: Submission["status"];
    passedTestCases: number;
    totalTestCases: number | null;
    executionTime: number | null;
    memoryUsed: number | null;
    progressUpdated: boolean;
    submittedAt: string;
    sourceCode: string;
    compileOutput: string | null;
    results: TestResult[];
}

export function isSubmissionInProgress(status: SubmissionStatus): boolean {
    return status === "PENDING" || status === "PROCESSING";
}

export function mapTestCase(raw: JudgeTestCase): TestResult {
    return {
        index: raw.index,
        status: raw.status,
        stdout: raw.stdout,
        stderr: raw.stderr,
        memoryKb: raw.memoryKb,
        stdin: "",
        expected: "",
        actual: raw.stdout,
        passed: raw.status === "ACCEPTED",
        hidden: false,
        executionTime: raw.timeMs,
        error: raw.stderr || undefined,
    };
}

export function mapTestCases(raw: JudgeTestCase[]): TestResult[] {
    return raw.toSorted((a, b) => a.index - b.index).map(mapTestCase);
}

function mapSubmissionDetail(raw: RawSubmissionDetail): SubmissionDetail {
    return {
        id: raw.id,
        language: raw.language,
        status: raw.status,
        sourceCode: raw.sourceCode,
        passedTestCases: raw.passedTestCases,
        totalTestCases: raw.totalTestCases,
        executionTime: raw.executionTime,
        memoryUsed: raw.memoryUsed,
        compileOutput: raw.compileOutput,
        progressUpdated: raw.progressUpdated ?? false,
        submittedAt: raw.submittedAt,
        results: mapTestCases(raw.testCases ?? []),
    };
}

export const judgeApi = {
    run: async (data: RunRequest): Promise<RunResponse> => {
        const response = await apiClient.post<ApiResponse<RawJudgeResponse>>(
            "/judge/run",
            data
        );
        const raw = response.data.data;
        return {
            verdict: raw.verdict,
            summary: raw.summary ?? { passed: 0, failed: 0, total: 0, executed: 0 },
            performance: raw.performance ?? { maxTimeMs: 0, maxMemoryKb: 0 },
            results: mapTestCases(raw.testCases ?? []),
            totalTime: raw.performance?.maxTimeMs ?? 0,
            compilationError: raw.compilationError,
        };
    },

    submit: async (data: RunRequest): Promise<SubmitResponse> => {
        const response = await apiClient.post<ApiResponse<RawJudgeResponse>>(
            "/judge/submit",
            data
        );
        const raw = response.data.data;

        if (!raw.submissionId) {
            throw new Error("Judge submit response is missing submissionId");
        }

        return {
            id: raw.submissionId,
            status: raw.verdict,
            summary: raw.summary,
            performance: raw.performance,
            results: raw.testCases ? mapTestCases(raw.testCases) : null,
            compilationError: raw.compilationError,
            progressUpdated: raw.progressUpdated ?? false,
        };
    },

    getSubmission: async (submissionId: string): Promise<SubmissionDetail> => {
        const response = await apiClient.get<ApiResponse<RawSubmissionDetail>>(
            `/judge/submissions/${submissionId}`
        );
        return mapSubmissionDetail(response.data.data);
    },

    getSubmissions: async (
        lessonSlug: string,
        params?: {
            page?: number;
            limit?: number;
            size?: number;
            status?: SubmissionStatus;
            language?: string;
        }
    ): Promise<SubmissionSummary[]> => {
        const { size, ...restParams } = params ?? {};
        const response = await apiClient.get<ApiResponse<SubmissionSummary[]>>(
            "/submissions",
            { params: { lessonSlug, limit: restParams.limit ?? size, ...restParams } }
        );
        return response.data.data;
    },
};
