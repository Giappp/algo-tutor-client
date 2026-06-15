"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
    getGeneralChatHistory,
    sendGeneralChat,
    streamGeneralChat,
    type AiChatHistory,
    type AiChatError,
    type GeneralChatRequest,
    type GeneralChatResponse,
    type RoadmapRecommendation,
} from "@/api/ai-chat-service";

export type { RoadmapRecommendation } from "@/api/ai-chat-service";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    mode?: string | null;
    roadmaps?: RoadmapRecommendation[];
}

const GENERAL_STORAGE_KEY = "ai-general-chat-history";
const CONVERSATION_ID_KEY = "ai-general-conversation-id";

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

function getRoadmaps(data: GeneralChatResponse): RoadmapRecommendation[] {
    return data.recommendedRoadmaps ?? data.roadmaps ?? [];
}

function mapHistoryMessages(history: AiChatHistory): ChatMessage[] {
    return history.messages.flatMap((message) => {
        if (message.role !== "USER" && message.role !== "ASSISTANT") return [];

        return [{
            id: message.id,
            role: message.role === "USER" ? "user" as const : "assistant" as const,
            content: message.content,
            timestamp: new Date(message.createdAt),
            mode: message.mode,
        }];
    });
}

function getGeneralChatError(error: unknown): AiChatError | null {
    const maybeError = error as Partial<AiChatError>;
    return maybeError?.code ? (maybeError as AiChatError) : null;
}

export function useGeneralAIChat(isOpen: boolean) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);

    const isLoadingRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const storedMessages = loadGeneralChatHistory();
        const storedConversationId = loadConversationId();
        let active = true;

        const restoreChat = async () => {
            await Promise.resolve();
            if (!active) return;

            setMessages(storedMessages.length > 0 ? storedMessages : [createWelcomeMessage()]);
            setConversationId(storedConversationId);

            if (!storedConversationId) return;

            try {
                const history = await getGeneralChatHistory(storedConversationId);
                if (!active) return;

                const historyMessages = mapHistoryMessages(history);
                setMessages(historyMessages.length > 0 ? historyMessages : [createWelcomeMessage()]);
                setConversationId(history.conversationId);
            } catch (error) {
                if (!active) return;

                const chatError = getGeneralChatError(error);
                if (chatError?.code !== "CONVERSATION_NOT_FOUND") return;

                saveConversationId(null);
                localStorage.removeItem(GENERAL_STORAGE_KEY);
                setConversationId(null);
                setMessages([createWelcomeMessage()]);
            }
        };

        void restoreChat();

        return () => {
            active = false;
        };
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

    // Handle rate limit countdown ticking
    useEffect(() => {
        if (rateLimitCountdown === null || rateLimitCountdown <= 0) return;

        const interval = setInterval(() => {
            setRateLimitCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [rateLimitCountdown]);

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
        (metadata: GeneralChatResponse, messageId: string) => {
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
        (response: GeneralChatResponse, messageId: string) => {
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

    const setAssistantError = useCallback((messageId: string, errorMessage?: string) => {
        setMessages((prev) =>
            prev.map((message) =>
                message.id === messageId
                    ? {
                        ...message,
                        content: errorMessage
                            ? `⚠️ **Không thể trả lời:** ${errorMessage}`
                            : CONNECTION_ERROR_MESSAGE,
                    }
                    : message
            )
        );
    }, []);

    const sendMessage = useCallback(
        async (text: string) => {
            const trimmedText = text.trim();

            if (!trimmedText || isLoadingRef.current) return;
            if (rateLimitCountdown !== null && rateLimitCountdown > 0) return;

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
                message: trimmedText
            };

            try {
                let streamSuccess = false;
                let fullResponseText = "";
                let fallbackRequestBody = requestBody;

                try {
                    await streamGeneralChat(
                        requestBody,
                        {
                            onMessageChunk: (chunk) => {
                                fullResponseText += chunk;
                                updateAssistantContent(assistantMessage.id, fullResponseText);
                            },
                            onMetadata: (metadata) => {
                                updateAssistantMetadata(metadata, assistantMessage.id);
                            },
                        },
                        abortController.signal
                    );
                    streamSuccess = true;
                } catch (error) {
                    if (abortController.signal.aborted) return;

                    const chatError = getGeneralChatError(error);

                    if (chatError?.code === "RATE_LIMITED") {
                        const retryAfter = chatError.retryAfterSeconds ?? 60;
                        setRateLimitCountdown(retryAfter);
                        toast.warning(`Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`);
                        setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
                        return;
                    }

                    if (chatError?.code === "CONVERSATION_NOT_FOUND") {
                        setConversationId(null);
                        saveConversationId(null);
                        fallbackRequestBody = {
                            ...requestBody,
                            conversationId: undefined,
                        };
                    } else if (chatError?.status) {
                        throw error;
                    }

                    console.warn(
                        "General streaming chat failed. Attempting synchronous fallback.",
                        error
                    );
                }

                if (streamSuccess) return;

                const syncResponse = await sendGeneralChat(fallbackRequestBody);
                const syncSuccess = Boolean(syncResponse);

                if (syncResponse) {
                    updateAssistantFromSyncResponse(syncResponse, assistantMessage.id);
                }

                if (!syncSuccess) {
                    throw new Error("Synchronous chat returned empty response");
                }
            } catch (error) {
                if (abortController.signal.aborted) return;

                const chatError = getGeneralChatError(error);

                if (chatError?.code === "RATE_LIMITED") {
                    const retryAfter = chatError.retryAfterSeconds ?? 60;
                    setRateLimitCountdown(retryAfter);
                    toast.warning(`Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${retryAfter} giây.`);
                    setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
                    return;
                }

                if (chatError?.code === "CONVERSATION_NOT_FOUND") {
                    setConversationId(null);
                    saveConversationId(null);
                    toast.info("Phiên chat AI đã hết hạn. Mình sẽ bắt đầu lại ở tin nhắn tiếp theo.");
                    setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
                    return;
                }

                console.error("General AI chat failed.", error);
                const errorMessage = chatError?.message
                    || "Không thể kết nối với máy chủ AI. Vui lòng kiểm tra lại kết nối mạng!";
                toast.error(errorMessage);
                setAssistantError(assistantMessage.id, chatError?.message);
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
            rateLimitCountdown,
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
        setRateLimitCountdown(null);

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
        rateLimitCountdown,
        setRateLimitCountdown,
    };
}
