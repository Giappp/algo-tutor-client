import { apiClient } from "@/api/api-client";
import type { ApiResponse } from "@/lib/types/api";

export type AiProvider = "OPENAI" | "GEMINI" | "CLAUDE";
export type AiConversationType = "LESSON" | "GENERAL";
export type AiMessageRole = "SYSTEM" | "USER" | "ASSISTANT" | "TOOL";

export type LessonChatMode =
    | "HINT"
    | "EXPLAIN"
    | "DEBUG"
    | "REVIEW"
    | "COMPLEXITY"
    | "SOLUTION"
    | "NEXT_STEP"
    | "BOOTSTRAP";

export type AiQuickActionIntent =
    | "FREE_CHAT"
    | "EXPLAIN_PROBLEM"
    | "GIVE_HINT"
    | "NEXT_HINT"
    | "DEBUG_CODE"
    | "EXPLAIN_CODE"
    | "EXPLAIN_ERROR"
    | "ANALYZE_COMPLEXITY"
    | "REVIEW_CODE"
    | "SUGGEST_NEXT_STEP"
    | "CONTINUE"
    | "REGENERATE";

export interface AiQuickAction {
    label: string;
    intent?: AiQuickActionIntent | string;
    mode: LessonChatMode | string;
    message: string;
}

export interface RoadmapRecommendation {
    name: string;
    slug: string;
    level: string;
    description: string;
    thumbnailUrl?: string;
    topicCount: number;
    lessonCount: number;
    isPremium: boolean;
}

export interface LessonChatRequest {
    conversationId?: string;
    lessonId: number;
    lessonSlug: string;
    provider?: AiProvider;
    mode: LessonChatMode | string;
    message?: string;
    code?: string;
    language?: string;
    judgeResult?: string;
    errorMessage?: string;
    failedTestCases?: string[];
}

export interface LessonChatResponse {
    conversationId?: string | null;
    answer?: string | null;
    mode?: LessonChatMode | string;
    quickActions?: AiQuickAction[] | null;
    sources?: unknown[];
    canAskNextHint?: boolean | null;
}

export interface GeneralChatRequest {
    conversationId?: string;
    provider?: AiProvider;
    message: string;
}

export interface GeneralChatResponse {
    conversationId?: string | null;
    answer?: string | null;
    roadmaps?: RoadmapRecommendation[] | null;
    recommendedRoadmaps?: RoadmapRecommendation[] | null;
}

export interface AiChatHistoryMessage {
    id: string;
    role: AiMessageRole;
    content: string;
    mode: string | null;
    createdAt: string;
}

export interface AiChatHistory {
    conversationId: string;
    type: AiConversationType;
    lessonId: number | null;
    title: string | null;
    provider: AiProvider;
    createdAt: string;
    updatedAt: string | null;
    messages: AiChatHistoryMessage[];
}

export type AiChatErrorCode =
    | "INVALID_CHAT_MODE"
    | "CODE_REQUIRED"
    | "CONVERSATION_NOT_FOUND"
    | "UNSUPPORTED_PROVIDER"
    | "RATE_LIMITED"
    | "AI_SERVICE_UNAVAILABLE"
    | "NO_MORE_HINTS"
    | "PROVIDER_NOT_CONFIGURED"
    | "CHAT_FAILED";

export interface AiChatError extends Error {
    code: AiChatErrorCode;
    status?: number;
    retryAfterSeconds?: number;
    details?: unknown;
}

interface PostSseOptions<TMetadata> {
    endpoint: string;
    body: unknown;
    signal?: AbortSignal;
    onMessageChunk: (chunk: string) => void;
    onMetadata: (metadata: TMetadata) => void;
}

const AI_ENDPOINTS = {
    lesson: {
        bootstrap: "/ai/chat/bootstrap",
        chat: "/ai/chat",
        stream: "/ai/chat/stream",
        history: (conversationId: string) =>
            `/ai/chat/history/${encodeURIComponent(conversationId)}`,
    },
    general: {
        chat: "/ai/general/chat",
        stream: "/ai/general/chat/stream",
        history: (conversationId: string) =>
            `/ai/general/chat/history/${encodeURIComponent(conversationId)}`,
    },
} as const;

const ERROR_CODE_BY_STATUS_CODE: Record<number, AiChatErrorCode> = {
    8000: "INVALID_CHAT_MODE",
    8001: "CODE_REQUIRED",
    8002: "CONVERSATION_NOT_FOUND",
    8003: "UNSUPPORTED_PROVIDER",
    8004: "RATE_LIMITED",
    8005: "AI_SERVICE_UNAVAILABLE",
    8006: "NO_MORE_HINTS",
    8007: "PROVIDER_NOT_CONFIGURED",
};

function parseRetryAfter(value: string | null | undefined): number {
    const seconds = value ? parseInt(value, 10) : 60;
    return Number.isNaN(seconds) ? 60 : seconds;
}

function createAiChatError(
    code: AiChatErrorCode,
    message: string,
    options?: {
        status?: number;
        retryAfterSeconds?: number;
        details?: unknown;
    }
): AiChatError {
    const error = new Error(message) as AiChatError;
    error.code = code;
    error.status = options?.status;
    error.retryAfterSeconds = options?.retryAfterSeconds;
    error.details = options?.details;
    return error;
}

function readErrorMessage(payload: unknown, fallback: string): string {
    if (!payload || typeof payload !== "object") return fallback;

    const data = payload as Record<string, unknown>;

    if (typeof data.errors === "string") return data.errors;
    if (typeof data.message === "string") return data.message;

    if (data.errors && typeof data.errors === "object") {
        const firstFieldError = Object.values(data.errors as Record<string, unknown>)
            .flatMap((value) => Array.isArray(value) ? value : [])
            .find((value): value is string => typeof value === "string");

        if (firstFieldError) return firstFieldError;
    }

    return fallback;
}

function readApiErrorCode(payload: unknown, status: number): AiChatErrorCode {
    if (status === 429) return "RATE_LIMITED";
    if (status === 503) return "AI_SERVICE_UNAVAILABLE";

    if (!payload || typeof payload !== "object") return "CHAT_FAILED";

    const data = payload as Record<string, unknown>;
    const explicitCode = data.errorCode;
    const numericCode = data.code;

    if (typeof explicitCode === "string" && isAiChatErrorCode(explicitCode)) {
        return explicitCode;
    }

    if (typeof explicitCode === "string" && explicitCode === "RATE_LIMIT_EXCEEDED") {
        return "RATE_LIMITED";
    }

    if (typeof numericCode === "number") {
        return ERROR_CODE_BY_STATUS_CODE[numericCode] ?? "CHAT_FAILED";
    }

    return "CHAT_FAILED";
}

function isAiChatErrorCode(value: string): value is AiChatErrorCode {
    return [
        "INVALID_CHAT_MODE",
        "CODE_REQUIRED",
        "CONVERSATION_NOT_FOUND",
        "UNSUPPORTED_PROVIDER",
        "RATE_LIMITED",
        "AI_SERVICE_UNAVAILABLE",
        "NO_MORE_HINTS",
        "PROVIDER_NOT_CONFIGURED",
        "CHAT_FAILED",
    ].includes(value);
}

async function createErrorFromFetchResponse(response: Response): Promise<AiChatError> {
    const payload = await response.json().catch(() => null);
    const code = readApiErrorCode(payload, response.status);
    const retryAfterSeconds =
        code === "RATE_LIMITED"
            ? parseRetryAfter(response.headers.get("Retry-After"))
            : undefined;

    return createAiChatError(code, readErrorMessage(payload, `AI chat request failed with status ${response.status}`), {
        status: response.status,
        retryAfterSeconds,
        details: payload,
    });
}

function createErrorFromAxios(error: unknown): AiChatError {
    const err = error as {
        response?: {
            status?: number;
            headers?: Record<string, string>;
            data?: unknown;
        };
    };

    const status = err.response?.status;
    const code = status ? readApiErrorCode(err.response?.data, status) : "CHAT_FAILED";
    const retryAfterHeader =
        err.response?.headers?.["retry-after"] || err.response?.headers?.["Retry-After"];

    return createAiChatError(code, readErrorMessage(err.response?.data, "AI chat request failed"), {
        status,
        retryAfterSeconds: code === "RATE_LIMITED" ? parseRetryAfter(retryAfterHeader) : undefined,
        details: err.response?.data ?? error,
    });
}

function parseSseEvent(rawEvent: string): { eventName: string; data: unknown } | null {
    const lines = rawEvent.split(/\r?\n/);
    let eventName = "message";
    const dataLines: string[] = [];

    for (const line of lines) {
        if (line.startsWith("event:")) {
            eventName = line.slice("event:".length).trim();
            continue;
        }

        if (line.startsWith("data:")) {
            dataLines.push(line.slice("data:".length).trimStart());
        }
    }

    if (dataLines.length === 0) {
        return { eventName, data: null };
    }

    const rawData = dataLines.join("\n");
    try {
        return {
            eventName,
            data: JSON.parse(rawData),
        };
    } catch {
        return { eventName, data: rawData };
    }
}

async function postSse<TMetadata>({
    endpoint,
    body,
    signal,
    onMessageChunk,
    onMetadata,
}: PostSseOptions<TMetadata>): Promise<void> {
    const response = await fetch(apiClient.getUri({ url: endpoint }), {
        method: "POST",
        credentials: apiClient.defaults.withCredentials ? "include" : "same-origin",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        signal,
    });

    if (!response.ok || !response.body) {
        throw await createErrorFromFetchResponse(response);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let receivedDone = false;

    const handleEvent = (rawEvent: string): boolean => {
        const parsedEvent = parseSseEvent(rawEvent);
        if (!parsedEvent) return false;

        const isDoneEvent =
            parsedEvent.eventName === "done"
            || parsedEvent.data === "done"
            || parsedEvent.data === "[DONE]"
            || (
                parsedEvent.data !== null
                && typeof parsedEvent.data === "object"
                && (parsedEvent.data as Record<string, unknown>).done === true
            );

        if (isDoneEvent) {
            receivedDone = true;
            return true;
        }

        if (!parsedEvent.data || typeof parsedEvent.data !== "object") {
            return false;
        }

        const payload = parsedEvent.data as Record<string, unknown>;

        if (parsedEvent.eventName === "message") {
            const chunk =
                typeof payload.answer === "string"
                    ? payload.answer
                    : typeof payload.chunkText === "string"
                        ? payload.chunkText
                        : "";

            if (chunk) onMessageChunk(chunk);
            return false;
        }

        if (parsedEvent.eventName === "metadata") {
            onMetadata(payload as TMetadata);
        }

        return false;
    };

    const flushEvents = (text: string): boolean => {
        const rawEvents = text.split(/\r?\n\r?\n/);
        buffer = rawEvents.pop() ?? "";

        for (const rawEvent of rawEvents) {
            if (handleEvent(rawEvent)) return true;
        }

        return false;
    };

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        if (flushEvents(buffer)) {
            await reader.cancel().catch(() => undefined);
            return;
        }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
        handleEvent(buffer);
    }

    if (!receivedDone) {
        throw createAiChatError(
            "CHAT_FAILED",
            "AI stream ended before receiving the done event"
        );
    }
}

export async function bootstrapLessonChat(
    lessonSlug: string
): Promise<LessonChatResponse | null> {
    try {
        const response = await apiClient.get<ApiResponse<LessonChatResponse>>(
            AI_ENDPOINTS.lesson.bootstrap,
            { params: { lessonSlug } }
        );

        return response.data?.data ?? null;
    } catch (error) {
        throw createErrorFromAxios(error);
    }
}

export async function getLessonChatHistory(conversationId: string): Promise<AiChatHistory> {
    try {
        const response = await apiClient.get<ApiResponse<AiChatHistory>>(
            AI_ENDPOINTS.lesson.history(conversationId)
        );
        return response.data.data;
    } catch (error) {
        throw createErrorFromAxios(error);
    }
}

export async function getGeneralChatHistory(conversationId: string): Promise<AiChatHistory> {
    try {
        const response = await apiClient.get<ApiResponse<AiChatHistory>>(
            AI_ENDPOINTS.general.history(conversationId)
        );
        return response.data.data;
    } catch (error) {
        throw createErrorFromAxios(error);
    }
}

export async function streamLessonChat(
    requestBody: LessonChatRequest,
    handlers: {
        onMessageChunk: (chunk: string) => void;
        onMetadata: (metadata: LessonChatResponse) => void;
    },
    signal?: AbortSignal
): Promise<void> {
    await postSse<LessonChatResponse>({
        endpoint: AI_ENDPOINTS.lesson.stream,
        body: requestBody,
        signal,
        ...handlers,
    });
}

export async function sendLessonChat(
    requestBody: LessonChatRequest
): Promise<LessonChatResponse | null> {
    try {
        const response = await apiClient.post<ApiResponse<LessonChatResponse>>(
            AI_ENDPOINTS.lesson.chat,
            requestBody
        );
        return response.data?.data ?? null;
    } catch (error) {
        throw createErrorFromAxios(error);
    }
}

export async function streamGeneralChat(
    requestBody: GeneralChatRequest,
    handlers: {
        onMessageChunk: (chunk: string) => void;
        onMetadata: (metadata: GeneralChatResponse) => void;
    },
    signal?: AbortSignal
): Promise<void> {
    await postSse<GeneralChatResponse>({
        endpoint: AI_ENDPOINTS.general.stream,
        body: requestBody,
        signal,
        ...handlers,
    });
}

export async function sendGeneralChat(
    requestBody: GeneralChatRequest
): Promise<GeneralChatResponse | null> {
    try {
        const response = await apiClient.post<ApiResponse<GeneralChatResponse>>(
            AI_ENDPOINTS.general.chat,
            requestBody
        );

        return response.data?.data ?? null;
    } catch (error) {
        throw createErrorFromAxios(error);
    }
}
