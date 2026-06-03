import { apiClient } from "@/api/api-client";
import type { QuickAction } from "../lib/ai-tutor-config";

export interface TutorChatResponseData {
    conversationId?: string;
    canAskNextHint?: boolean;
    quickActions?: QuickAction[];
    answer?: string;
}

export interface TutorChatRequest {
    conversationId?: string;
    lessonId?: number;
    lessonSlug: string;
    mode: string;
    message: string;
    code?: string;
    language: string;
    judgeResult?: string;
    errorMessage?: string;
    failedTestCases?: string[];
}

export type TutorChatErrorCode = "RATE_LIMITED" | "NO_MORE_HINTS" | "CHAT_FAILED";

export interface TutorChatError extends Error {
    code: TutorChatErrorCode;
    retryAfterSeconds?: number;
}

interface StreamHandlers {
    onMessageChunk: (chunk: string) => void;
    onMetadata: (metadata: TutorChatResponseData) => void;
}

function createTutorChatError(
    code: TutorChatErrorCode,
    message: string,
    retryAfterSeconds?: number
): TutorChatError {
    const error = new Error(message) as TutorChatError;
    error.code = code;
    error.retryAfterSeconds = retryAfterSeconds;
    return error;
}

function parseRetryAfter(value: string | null | undefined): number {
    const seconds = value ? parseInt(value, 10) : 60;
    return Number.isNaN(seconds) ? 60 : seconds;
}

function getApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
}

export async function bootstrapTutorChat(lessonSlug: string): Promise<TutorChatResponseData | null> {
    const response = await apiClient.get<{ data: TutorChatResponseData }>("/ai/chat/bootstrap", {
        params: { lessonSlug },
    });

    return response.data?.data ?? null;
}

export async function streamTutorChat(
    requestBody: TutorChatRequest,
    handlers: StreamHandlers
): Promise<void> {
    const response = await fetch(`${getApiBaseUrl()}/ai/chat/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw createTutorChatError(
                "RATE_LIMITED",
                "Rate limit exceeded",
                parseRetryAfter(response.headers.get("Retry-After"))
            );
        }

        if (response.status === 400) {
            const errData = await response.json().catch(() => ({}));

            if (errData.errorCode === "NO_MORE_HINTS") {
                throw createTutorChatError("NO_MORE_HINTS", "No more hints available");
            }
        }

        throw createTutorChatError("CHAT_FAILED", "Streaming error response");
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw createTutorChatError("CHAT_FAILED", "No readable stream support");
    }

    const decoder = new TextDecoder();
    let accumulatedChunk = "";
    let currentEvent = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedChunk += decoder.decode(value, { stream: true });

        const lines = accumulatedChunk.split("\n");
        accumulatedChunk = lines.pop() || "";

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith("event:")) {
                currentEvent = trimmed.substring(6).trim();
                continue;
            }

            if (!trimmed.startsWith("data:")) continue;

            const dataContent = trimmed.substring(5).trim();

            try {
                const parsed = JSON.parse(dataContent);

                if (currentEvent === "message") {
                    handlers.onMessageChunk(parsed.answer || "");
                }

                if (currentEvent === "metadata") {
                    handlers.onMetadata(parsed);
                }
            } catch (error) {
                console.error("Error parsing stream chunk", error);
            }
        }
    }
}

export async function sendTutorChat(requestBody: TutorChatRequest): Promise<TutorChatResponseData | null> {
    try {
        const response = await apiClient.post<{ data: TutorChatResponseData }>("/ai/chat", requestBody);
        return response.data?.data ?? null;
    } catch (error) {
        const err = error as {
            response?: {
                status?: number;
                headers?: Record<string, string>;
                data?: { errorCode?: string };
            };
        };

        if (err?.response?.status === 429) {
            const retryAfterHeader =
                err.response.headers?.["retry-after"] || err.response.headers?.["Retry-After"];

            throw createTutorChatError(
                "RATE_LIMITED",
                "Rate limit exceeded",
                parseRetryAfter(retryAfterHeader)
            );
        }

        if (err?.response?.data?.errorCode === "NO_MORE_HINTS") {
            throw createTutorChatError("NO_MORE_HINTS", "No more hints available");
        }

        throw error;
    }
}
