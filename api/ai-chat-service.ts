import { apiClient } from "@/api/api-client";

export type AiProvider = "OPENAI" | "GEMINI" | "CLAUDE";

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
    lessonId?: number;
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
    url: string;
    body: unknown;
    signal?: AbortSignal;
    onMessageChunk: (chunk: string) => void;
    onMetadata: (metadata: TMetadata) => void;
}

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

export function getAiApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
}

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

    return createAiChatError(code, `AI chat request failed with status ${response.status}`, {
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

    return createAiChatError(code, "AI chat request failed", {
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

    if (dataLines.length === 0) return null;

    try {
        return {
            eventName,
            data: JSON.parse(dataLines.join("\n")),
        };
    } catch {
        return null;
    }
}

async function postSse<TMetadata>({
    url,
    body,
    signal,
    onMessageChunk,
    onMetadata,
}: PostSseOptions<TMetadata>): Promise<void> {
    const response = await fetch(url, {
        method: "POST",
        credentials: "include",
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

    const flushEvents = (text: string) => {
        const rawEvents = text.split(/\r?\n\r?\n/);
        buffer = rawEvents.pop() ?? "";

        for (const rawEvent of rawEvents) {
            const parsedEvent = parseSseEvent(rawEvent);
            if (!parsedEvent || !parsedEvent.data || typeof parsedEvent.data !== "object") {
                continue;
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
                continue;
            }

            if (parsedEvent.eventName === "metadata") {
                onMetadata(payload as TMetadata);
            }
        }
    };

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        flushEvents(buffer);
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
        const parsedEvent = parseSseEvent(buffer);

        if (parsedEvent?.data && typeof parsedEvent.data === "object") {
            const payload = parsedEvent.data as Record<string, unknown>;

            if (parsedEvent.eventName === "message") {
                const chunk =
                    typeof payload.answer === "string"
                        ? payload.answer
                        : typeof payload.chunkText === "string"
                            ? payload.chunkText
                            : "";
                if (chunk) onMessageChunk(chunk);
            }

            if (parsedEvent.eventName === "metadata") {
                onMetadata(payload as TMetadata);
            }
        }
    }
}

export async function bootstrapLessonChat(
    lessonSlug: string
): Promise<LessonChatResponse | null> {
    try {
        const response = await apiClient.get<{ data: LessonChatResponse }>("/ai/chat/bootstrap", {
            params: { lessonSlug },
        });

        return response.data?.data ?? null;
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
        url: `${getAiApiBaseUrl()}/ai/chat/stream`,
        body: requestBody,
        signal,
        ...handlers,
    });
}

export async function sendLessonChat(
    requestBody: LessonChatRequest
): Promise<LessonChatResponse | null> {
    try {
        const response = await apiClient.post<{ data: LessonChatResponse }>("/ai/chat", requestBody);
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
        url: `${getAiApiBaseUrl()}/ai/general/chat/stream`,
        body: requestBody,
        signal,
        ...handlers,
    });
}

export async function sendGeneralChat(
    requestBody: GeneralChatRequest
): Promise<GeneralChatResponse | null> {
    try {
        const response = await apiClient.post<{ data: GeneralChatResponse }>(
            "/ai/general/chat",
            requestBody
        );

        return response.data?.data ?? null;
    } catch (error) {
        throw createErrorFromAxios(error);
    }
}
