"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/api/api-client";
import { toast } from "sonner";

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

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    roadmaps?: RoadmapRecommendation[];
}

interface GeneralChatRequest {
    conversationId?: string;
    message: string;
    mode: "EXPLAIN";
}

interface StreamChatOptions {
    requestBody: GeneralChatRequest;
    assistantMessageId: string;
    signal?: AbortSignal;
    onTextDelta: (messageId: string, fullText: string) => void;
    onMetadata: (metadata: StreamMetadata, messageId: string) => void;
}

interface SyncChatOptions {
    requestBody: GeneralChatRequest;
    assistantMessageId: string;
    onSuccess: (response: SyncChatResponse, messageId: string) => void;
}

interface StreamMetadata {
    conversationId?: string;
    recommendedRoadmaps?: RoadmapRecommendation[];
    roadmaps?: RoadmapRecommendation[];
}

interface SyncChatResponse {
    conversationId?: string;
    answer?: string;
    recommendedRoadmaps?: RoadmapRecommendation[];
    roadmaps?: RoadmapRecommendation[];
}

const GENERAL_STORAGE_KEY = "ai-general-chat-history";
const CONVERSATION_ID_KEY = "ai-general-conversation-id";

const DEFAULT_API_BASE_URL = "http://localhost:8080/api/v1";

const WELCOME_MESSAGE = `Xin chào! Tôi là **AI Assistant** hỗ trợ học tập của AlgoTutor. 🚀

Tôi có thể giúp bạn tư vấn lộ trình học thuật toán, giải đáp các thắc mắc về cấu trúc dữ liệu, thuật toán nâng cao hoặc hướng dẫn chuẩn bị phỏng vấn.

Hôm nay bạn muốn trao đổi về chủ đề nào?`;

const CONNECTION_ERROR_MESSAGE =
    "⚠️ **Lỗi kết nối:** Không thể kết nối tới máy chủ trợ lý AI. Vui lòng thử lại sau ít phút hoặc kiểm tra lại kết nối mạng của bạn!";

function createMessage(
    role: ChatMessage["role"],
    content: string,
    extra?: Partial<ChatMessage>
): ChatMessage {
    return {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date(),
        ...extra,
    };
}

function createWelcomeMessage(): ChatMessage {
    return createMessage("assistant", WELCOME_MESSAGE);
}

function normalizeMessages(value: unknown): ChatMessage[] {
    if (!Array.isArray(value)) return [];

    return value
        .filter((item): item is ChatMessage => {
            if (!item || typeof item !== "object") return false;

            const message = item as Partial<ChatMessage>;

            return (
                typeof message.id === "string" &&
                (message.role === "user" || message.role === "assistant") &&
                typeof message.content === "string"
            );
        })
        .map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
            roadmaps: Array.isArray(message.roadmaps) ? message.roadmaps : undefined,
        }));
}

function loadGeneralChatHistory(): ChatMessage[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(GENERAL_STORAGE_KEY);
        if (!raw) return [];

        return normalizeMessages(JSON.parse(raw));
    } catch {
        return [];
    }
}

function saveGeneralChatHistory(messages: ChatMessage[]) {
    if (typeof window === "undefined") return;

    try {
        const persistableMessages = messages.filter(
            (message) =>
                message.role === "user" ||
                message.content.trim() ||
                Boolean(message.roadmaps?.length)
        );

        if (persistableMessages.length === 0) {
            localStorage.removeItem(GENERAL_STORAGE_KEY);
            return;
        }

        localStorage.setItem(GENERAL_STORAGE_KEY, JSON.stringify(persistableMessages));
    } catch {
        // Ignore localStorage errors.
    }
}

function loadConversationId(): string | null {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(CONVERSATION_ID_KEY);
}

function saveConversationId(conversationId: string | null) {
    if (typeof window === "undefined") return;

    if (conversationId) {
        localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
    } else {
        localStorage.removeItem(CONVERSATION_ID_KEY);
    }
}

function getRoadmaps(data: StreamMetadata | SyncChatResponse): RoadmapRecommendation[] {
    return data.recommendedRoadmaps ?? data.roadmaps ?? [];
}

function parseSseChunk(
    rawChunk: string,
    currentEventRef: { value: string },
    onMessage: (eventName: string, data: unknown) => void
) {
    const lines = rawChunk.split("\n");

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            currentEventRef.value = "";
            continue;
        }

        if (trimmed.startsWith("event:")) {
            currentEventRef.value = trimmed.substring("event:".length).trim();
            continue;
        }

        if (!trimmed.startsWith("data:")) continue;

        const dataContent = trimmed.substring("data:".length).trim();
        if (!dataContent) continue;

        try {
            onMessage(currentEventRef.value, JSON.parse(dataContent));
        } catch (error) {
            console.error("Error parsing stream data", error);
        }
    }
}

async function streamGeneralChat({
    requestBody,
    assistantMessageId,
    signal,
    onTextDelta,
    onMetadata,
}: StreamChatOptions): Promise<boolean> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

    const response = await fetch(`${baseUrl}/ai/general/chat/stream`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
        signal,
    });

    if (!response.ok) {
        throw new Error(`Streaming endpoint failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
        throw new Error("ReadableStream is not supported");
    }

    const decoder = new TextDecoder();
    const currentEventRef = { value: "" };

    let buffer = "";
    let fullResponseText = "";

    const handleMessage = (eventName: string, data: unknown) => {
        if (!data || typeof data !== "object") return;

        const parsed = data as Record<string, unknown>;

        if (eventName === "message") {
            const chunkText =
                typeof parsed.chunkText === "string"
                    ? parsed.chunkText
                    : typeof parsed.answer === "string"
                        ? parsed.answer
                        : "";

            if (!chunkText) return;

            fullResponseText += chunkText;
            onTextDelta(assistantMessageId, fullResponseText);
            return;
        }

        if (eventName === "metadata") {
            onMetadata(parsed as StreamMetadata, assistantMessageId);
        }
    };

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split("\n");
        buffer = chunks.pop() ?? "";

        parseSseChunk(chunks.join("\n"), currentEventRef, handleMessage);
    }

    const remainingText = buffer + decoder.decode();
    if (remainingText.trim()) {
        parseSseChunk(remainingText, currentEventRef, handleMessage);
    }

    return true;
}

async function syncGeneralChat({
    requestBody,
    assistantMessageId,
    onSuccess,
}: SyncChatOptions): Promise<boolean> {
    const response = await apiClient.post<{
        data?: SyncChatResponse;
    }>("/ai/general/chat", requestBody);

    const responseData = response.data?.data;
    if (!responseData) return false;

    onSuccess(responseData, assistantMessageId);

    return true;
}

export function useGeneralAIChat(isOpen: boolean) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const isLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const storedMessages = loadGeneralChatHistory();
        const storedConversationId = loadConversationId();

        if (storedMessages.length > 0) {
            setMessages(storedMessages);
            setConversationId(storedConversationId);
            return;
        }

        setMessages([createWelcomeMessage()]);
        setConversationId(null);
    }, [isOpen]);

    useEffect(() => {
        saveGeneralChatHistory(messages);
    }, [messages]);

    useEffect(() => {
        saveConversationId(conversationId);
    }, [conversationId]);

    useEffect(() => {
        if (isOpen) return;

        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
    }, [isOpen]);

    const updateAssistantContent = useCallback((messageId: string, content: string) => {
        setMessages((prev) =>
            prev.map((message) =>
                message.id === messageId
                    ? {
                        ...message,
                        content,
                    }
                    : message
            )
        );
    }, []);

    const updateAssistantMetadata = useCallback(
        (metadata: StreamMetadata, messageId: string) => {
            if (metadata.conversationId) {
                setConversationId(metadata.conversationId);
            }

            const roadmaps = getRoadmaps(metadata);
            if (roadmaps.length === 0) return;

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === messageId
                        ? {
                            ...message,
                            roadmaps,
                        }
                        : message
                )
            );
        },
        []
    );

    const updateAssistantFromSyncResponse = useCallback(
        (response: SyncChatResponse, messageId: string) => {
            if (response.conversationId) {
                setConversationId(response.conversationId);
            }

            const roadmaps = getRoadmaps(response);

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === messageId
                        ? {
                            ...message,
                            content: response.answer ?? "",
                            roadmaps,
                        }
                        : message
                )
            );
        },
        []
    );

    const setAssistantError = useCallback((messageId: string) => {
        setMessages((prev) =>
            prev.map((message) =>
                message.id === messageId
                    ? {
                        ...message,
                        content: CONNECTION_ERROR_MESSAGE,
                    }
                    : message
            )
        );
    }, []);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmedText = text.trim();

            if (!trimmedText || isLoadingRef.current) return;

            isLoadingRef.current = true;
            setIsLoading(true);

            abortControllerRef.current?.abort();

            const abortController = new AbortController();
            abortControllerRef.current = abortController;

            const userMessage = createMessage("user", trimmedText);
            const assistantMessage = createMessage("assistant", "");

            setMessages((prev) => [...prev, userMessage, assistantMessage]);
            setInput("");

            const requestBody: GeneralChatRequest = {
                conversationId: conversationId || undefined,
                message: trimmedText,
                mode: "EXPLAIN",
            };

            try {
                let streamSuccess = false;

                try {
                    streamSuccess = await streamGeneralChat({
                        requestBody,
                        assistantMessageId: assistantMessage.id,
                        signal: abortController.signal,
                        onTextDelta: updateAssistantContent,
                        onMetadata: updateAssistantMetadata,
                    });
                } catch (error) {
                    if (abortController.signal.aborted) return;

                    console.warn(
                        "General streaming chat failed. Attempting synchronous fallback.",
                        error
                    );
                }

                if (streamSuccess) return;

                const syncSuccess = await syncGeneralChat({
                    requestBody,
                    assistantMessageId: assistantMessage.id,
                    onSuccess: updateAssistantFromSyncResponse,
                });

                if (!syncSuccess) {
                    throw new Error("Synchronous chat returned empty response");
                }
            } catch (error) {
                if (abortController.signal.aborted) return;

                console.error("General AI chat failed.", error);
                toast.error(
                    "Không thể kết nối với máy chủ AI. Vui lòng kiểm tra lại kết nối mạng!"
                );
                setAssistantError(assistantMessage.id);
            } finally {
                if (abortControllerRef.current === abortController) {
                    abortControllerRef.current = null;
                }

                isLoadingRef.current = false;
                setIsLoading(false);
            }
        },
        [
            conversationId,
            setAssistantError,
            updateAssistantContent,
            updateAssistantFromSyncResponse,
            updateAssistantMetadata,
        ]
    );

    const clearChat = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;

        setMessages([createWelcomeMessage()]);
        setConversationId(null);
        setInput("");
        setIsLoading(false);
        isLoadingRef.current = false;

        localStorage.removeItem(GENERAL_STORAGE_KEY);
        localStorage.removeItem(CONVERSATION_ID_KEY);

        toast.success("Đã xóa lịch sử trò chuyện.");
    }, []);

    const handleCopy = useCallback(async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            toast.success("Đã sao chép câu trả lời vào clipboard.");
        } catch {
            toast.error("Không thể sao chép nội dung.");
        }
    }, []);

    return {
        messages,
        input,
        setInput,
        isLoading,
        sendMessage,
        clearChat,
        handleCopy,
    };
}