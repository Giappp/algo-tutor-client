import {
    bootstrapLessonChat,
    sendLessonChat,
    streamLessonChat,
    type AiChatError,
    type LessonChatRequest,
    type LessonChatResponse,
} from "@/api/ai-chat-service";

export type TutorChatResponseData = LessonChatResponse;
export type TutorChatRequest = LessonChatRequest;
export type TutorChatErrorCode = AiChatError["code"];
export type TutorChatError = AiChatError;

interface StreamHandlers {
    onMessageChunk: (chunk: string) => void;
    onMetadata: (metadata: TutorChatResponseData) => void;
}

export async function bootstrapTutorChat(
    lessonSlug: string
): Promise<TutorChatResponseData | null> {
    return bootstrapLessonChat(lessonSlug);
}

export async function streamTutorChat(
    requestBody: TutorChatRequest,
    handlers: StreamHandlers,
    signal?: AbortSignal
): Promise<void> {
    return streamLessonChat(requestBody, handlers, signal);
}

export async function sendTutorChat(
    requestBody: TutorChatRequest
): Promise<TutorChatResponseData | null> {
    return sendLessonChat(requestBody);
}
