import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage, LessonContext } from "@/lib/types/lesson";
import { toast } from "sonner";
import {
    buildFallbackIntroMessage,
    getAvailableModes,
    getDefaultTutorMode,
    getQuickActions,
    type QuickAction,
} from "@/lib/ai-tutor-config";
import {
    clearTutorSession,
    clearConversationId,
    loadChatHistory,
    readActiveCodeSnapshot,
    readFailedTestCases,
    readWorkspaceSnapshot,
    saveChatHistory,
    saveConversationId,
    type WorkspaceSnapshot,
} from "@/lib/ai-tutor-storage";
import {
    bootstrapTutorChat,
    getTutorChatHistory,
    sendTutorChat,
    streamTutorChat,
    type TutorChatError,
    type TutorChatRequest,
    type TutorChatResponseData,
} from "@/api/ai-tutor-service";

function mapHistoryMessages(history: Awaited<ReturnType<typeof getTutorChatHistory>>): ChatMessage[] {
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

function isGuidedMode(mode: string): boolean {
    return mode === "HINT" || mode === "DEBUG" || mode === "EXPLAIN";
}

function requiresCode(mode: string): boolean {
    return mode === "DEBUG" || mode === "REVIEW" || mode === "COMPLEXITY";
}

function applyMetadata(
    metadata: TutorChatResponseData,
    setters: {
        setConversationId: (conversationId: string | null) => void;
        setCanAskNextHint: (canAskNextHint: boolean) => void;
        setServerQuickActions: (quickActions: QuickAction[] | null) => void;
    }
) {
    if (metadata.conversationId !== undefined) {
        setters.setConversationId(metadata.conversationId ?? null);
    }

    if (metadata.quickActions !== undefined) {
        setters.setServerQuickActions(
            metadata.quickActions && metadata.quickActions.length > 0
                ? metadata.quickActions
                : null
        );
    }

    if (metadata.canAskNextHint !== undefined && metadata.canAskNextHint !== null) {
        setters.setCanAskNextHint(metadata.canAskNextHint);
    }
}

function getTutorChatError(error: unknown): TutorChatError | null {
    const maybeError = error as Partial<TutorChatError>;
    return maybeError?.code ? (maybeError as TutorChatError) : null;
}

export function useAITutor(context: LessonContext) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const [conversationId, setConversationId] = useState<string | null>(null);
    const [canAskNextHint, setCanAskNextHint] = useState(true);
    const [selectedMode, setSelectedMode] = useState(getDefaultTutorMode(context.lessonType));
    const [serverQuickActions, setServerQuickActions] = useState<QuickAction[] | null>(null);

    const [isSocratic, setIsSocratic] = useState(true);
    const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);
    const [workspace, setWorkspace] = useState<WorkspaceSnapshot | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(false);

    const fallbackIntroMessage = useMemo(
        () =>
            buildFallbackIntroMessage({
                lessonTitle: context.lessonTitle,
                lessonType: context.lessonType,
                roadmapName: context.roadmapName,
            }),
        [context.lessonTitle, context.lessonType, context.roadmapName]
    );

    const availableModes = useMemo(
        () => getAvailableModes(context.lessonType),
        [context.lessonType]
    );

    const quickActionsList = useMemo(
        () => serverQuickActions || getQuickActions(context.lessonType),
        [serverQuickActions, context.lessonType]
    );

    const isRateLimited = rateLimitCountdown !== null && rateLimitCountdown > 0;
    const hasRealMessages = messages.some((message) => message.id !== "intro");

    const applyResponseMetadata = useCallback((metadata: TutorChatResponseData) => {
        applyMetadata(metadata, {
            setConversationId,
            setCanAskNextHint,
            setServerQuickActions,
        });
    }, []);

    useEffect(() => {
        if (rateLimitCountdown === null || rateLimitCountdown <= 0) return;

        const interval = window.setInterval(() => {
            setRateLimitCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    window.clearInterval(interval);
                    return null;
                }

                return prev - 1;
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [rateLimitCountdown]);

    useEffect(() => {
        const updateWorkspaceState = () => {
            try {
                setWorkspace(readWorkspaceSnapshot(context.lessonSlug));
            } catch (error) {
                console.error("Error reading workspace state", error);
            }
        };

        updateWorkspaceState();

        const interval = window.setInterval(updateWorkspaceState, 1500);
        return () => window.clearInterval(interval);
    }, [context.lessonSlug]);

    const triggerBootstrap = useCallback(
        async (activeRef?: { current: boolean }, cachedMessages: ChatMessage[] = []) => {
            setIsLoading(true);

            try {
                const resData = await bootstrapTutorChat(context.lessonSlug);

                if (activeRef && !activeRef.current) return;

                if (resData) {
                    if (resData.conversationId) {
                        setConversationId(resData.conversationId);
                        saveConversationId(context.lessonSlug, resData.conversationId);
                    }

                    if (resData.canAskNextHint !== null && resData.canAskNextHint !== undefined) {
                        setCanAskNextHint(resData.canAskNextHint);
                    }

                    setServerQuickActions(
                        resData.quickActions && resData.quickActions.length > 0
                            ? resData.quickActions
                            : null
                    );

                    if (resData.conversationId) {
                        try {
                            const history = await getTutorChatHistory(resData.conversationId);

                            if (activeRef && !activeRef.current) return;

                            const historyMessages = mapHistoryMessages(history);
                            if (historyMessages.length > 0) {
                                setMessages(historyMessages);
                                setIsLoading(false);
                                return;
                            }
                        } catch (error) {
                            const chatError = getTutorChatError(error);
                            if (chatError?.code === "CONVERSATION_NOT_FOUND") {
                                clearConversationId(context.lessonSlug);
                                setConversationId(null);
                            } else {
                                console.warn("Could not restore lesson chat history.", error);
                            }
                        }
                    }

                    setMessages([
                        {
                            id: "intro",
                            role: "assistant",
                            content:
                                resData.answer ||
                                `Chào mừng bạn đến với bài học **${context.lessonTitle}**!`,
                            timestamp: new Date(),
                        },
                    ]);

                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.warn("Backend bootstrap API not ready or failed.", error);
            }

            if (activeRef && !activeRef.current) return;

            setConversationId(null);
            setCanAskNextHint(true);
            setServerQuickActions(null);

            setMessages(
                cachedMessages.length > 0
                    ? cachedMessages
                    : [
                        {
                            id: "intro",
                            role: "assistant",
                            content: fallbackIntroMessage,
                            timestamp: new Date(),
                        },
                    ]
            );

            setIsLoading(false);
        },
        [context.lessonSlug, context.lessonTitle, fallbackIntroMessage]
    );

    useEffect(() => {
        const stored = loadChatHistory(context.lessonSlug);
        const active = { current: true };

        const restoreChat = async () => {
            setSelectedMode(getDefaultTutorMode(context.lessonType));
            setServerQuickActions(null);

            if (stored.length > 0) {
                setMessages(stored);
            }

            await triggerBootstrap(active, stored);
        };

        void restoreChat();

        return () => {
            active.current = false;
        };
    }, [context.lessonSlug, context.lessonType, triggerBootstrap]);

    useEffect(() => {
        if (messages.length === 0) return;

        saveChatHistory(context.lessonSlug, messages);

        if (conversationId) {
            saveConversationId(context.lessonSlug, conversationId);
        }
    }, [messages, conversationId, context.lessonSlug]);

    useEffect(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isLoading]);

    const handleChatError = useCallback((error: unknown, tempAiMsgId: string): boolean => {
        const chatError = getTutorChatError(error);
        if (!chatError) return false;

        if (chatError.code === "RATE_LIMITED") {
            const retrySec = chatError.retryAfterSeconds ?? 60;

            setRateLimitCountdown(retrySec);
            toast.warning(`Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ${retrySec} giây.`);
            setMessages((prev) => prev.filter((message) => message.id !== tempAiMsgId));
            setIsLoading(false);
            isLoadingRef.current = false;
            return true;
        }

        if (chatError.code === "NO_MORE_HINTS") {
            toast.warning("Bạn đã hết lượt xin gợi ý cho bài tập này.");
            setCanAskNextHint(false);
            setMessages((prev) => prev.filter((message) => message.id !== tempAiMsgId));
            setIsLoading(false);
            isLoadingRef.current = false;
            return true;
        }

        if (chatError.code === "CODE_REQUIRED") {
            toast.warning("Chế độ này cần mã nguồn hiện tại. Hãy viết hoặc chạy code trước khi nhờ AI phân tích.");
            setMessages((prev) => prev.filter((message) => message.id !== tempAiMsgId));
            setIsLoading(false);
            isLoadingRef.current = false;
            return true;
        }

        if (chatError.code === "CONVERSATION_NOT_FOUND") {
            setConversationId(null);
            clearConversationId(context.lessonSlug);
            toast.info("Phiên chat AI đã hết hạn. Mình sẽ bắt đầu lại ở tin nhắn tiếp theo.");
            setMessages((prev) => prev.filter((message) => message.id !== tempAiMsgId));
            setIsLoading(false);
            isLoadingRef.current = false;
            return true;
        }

        return false;
    }, [context.lessonSlug]);

    const sendMessage = useCallback(
        async (text: string, overrideMode?: string) => {
            const trimmedText = text.trim();

            if (!trimmedText || isLoading || isLoadingRef.current) return;
            if (isRateLimited) return;
            if (context.lessonId === undefined) {
                toast.error("Không xác định được bài học hiện tại. Vui lòng tải lại trang.");
                return;
            }
            if (trimmedText.length > 5_000) {
                toast.warning("Tin nhắn gửi AI Tutor không được vượt quá 5.000 ký tự.");
                return;
            }

            isLoadingRef.current = true;

            const modeToSend = overrideMode || selectedMode;

            if (modeToSend === "HINT" && !canAskNextHint) {
                toast.warning("Bạn đã hết lượt xin gợi ý cho bài tập này. Hãy thử tự phân tích thêm trước.");
                isLoadingRef.current = false;
                return;
            }

            const finalPromptText =
                isSocratic && isGuidedMode(modeToSend)
                    ? `${trimmedText}`
                    : trimmedText;

            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                content: trimmedText,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setIsLoading(true);

            const tempAiMsgId = `${Date.now() + 1}`;

            setMessages((prev) => [
                ...prev,
                {
                    id: tempAiMsgId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                },
            ]);

            const activeCode = readActiveCodeSnapshot(context.lessonSlug);
            const { verdict, errorMessage, failedTestCases } = readFailedTestCases(
                context.lessonSlug
            );

            const modeRequiresCode = requiresCode(modeToSend);
            const hasActiveCode = Boolean(activeCode.code.trim());
            const canAttachCode = hasActiveCode && activeCode.code.length <= 10_000;

            if (modeRequiresCode && activeCode.code.length > 10_000) {
                toast.warning("Mã nguồn gửi AI Tutor không được vượt quá 10.000 ký tự.");
                setMessages((prev) =>
                    prev.filter(
                        (message) => message.id !== tempAiMsgId && message.id !== userMsg.id
                    )
                );
                setIsLoading(false);
                isLoadingRef.current = false;
                return;
            }

            if (modeRequiresCode && !hasActiveCode) {
                toast.warning("Chế độ này cần mã nguồn hiện tại. Hãy viết hoặc chạy code trước khi nhờ AI phân tích.");
                setMessages((prev) =>
                    prev.filter(
                        (message) => message.id !== tempAiMsgId && message.id !== userMsg.id
                    )
                );
                setIsLoading(false);
                isLoadingRef.current = false;
                return;
            }

            const requestBody: TutorChatRequest = {
                conversationId: conversationId || undefined,
                lessonId: context.lessonId,
                lessonSlug: context.lessonSlug,
                mode: modeToSend,
                message: finalPromptText,
                code: canAttachCode ? activeCode.code : undefined,
                language: canAttachCode ? activeCode.language : undefined,
                judgeResult: verdict,
                errorMessage: errorMessage || undefined,
                failedTestCases:
                    failedTestCases.length > 0
                        ? failedTestCases
                        : undefined,
            };

            let streamSuccess = false;
            let fullResponseText = "";

            try {
                await streamTutorChat(requestBody, {
                    onMessageChunk: (chunk) => {
                        fullResponseText += chunk;

                        setMessages((prev) =>
                            prev.map((message) =>
                                message.id === tempAiMsgId
                                    ? { ...message, content: fullResponseText }
                                    : message
                            )
                        );
                    },
                    onMetadata: applyResponseMetadata,
                });

                streamSuccess = true;
            } catch (error) {
                if (handleChatError(error, tempAiMsgId)) return;

                const chatError = getTutorChatError(error);
                if (chatError?.status) {
                    toast.error(chatError.message);
                    setMessages((prev) =>
                        prev.filter((message) => message.id !== tempAiMsgId)
                    );
                    setIsLoading(false);
                    isLoadingRef.current = false;
                    return;
                }

                console.warn("Streaming chat failed, falling back to sync chat.", error);
            }

            if (!streamSuccess) {
                try {
                    const resData = await sendTutorChat(requestBody);

                    if (resData) {
                        applyResponseMetadata(resData);

                        fullResponseText = resData.answer || "";

                        setMessages((prev) =>
                            prev.map((message) =>
                                message.id === tempAiMsgId
                                    ? { ...message, content: fullResponseText }
                                    : message
                            )
                        );

                        setIsLoading(false);
                        isLoadingRef.current = false;
                        return;
                    }
                } catch (error) {
                    console.warn("Synchronous chat failed.", error);
                    if (handleChatError(error, tempAiMsgId)) return;

                    const chatError = getTutorChatError(error);
                    toast.error(chatError?.message || "AI Tutor chưa thể trả lời lúc này. Vui lòng thử lại.");
                    setMessages((prev) =>
                        prev.filter((message) => message.id !== tempAiMsgId)
                    );
                }
            }

            setIsLoading(false);
            isLoadingRef.current = false;
        },
        [
            isLoading,
            isRateLimited,
            selectedMode,
            canAskNextHint,
            isSocratic,
            context.lessonSlug,
            context.lessonId,
            conversationId,
            applyResponseMetadata,
            handleChatError,
        ]
    );

    useEffect(() => {
        const handleExternalAsk = (event: Event) => {
            const customEvent = event as CustomEvent<{
                message: string;
                mode?: string;
            }>;

            if (!customEvent.detail?.message) return;

            const { message, mode } = customEvent.detail;

            if (mode) {
                setSelectedMode(mode);
            }

            sendMessage(message, mode);
        };

        window.addEventListener("ai-tutor-ask", handleExternalAsk);
        return () => window.removeEventListener("ai-tutor-ask", handleExternalAsk);
    }, [sendMessage]);

    const handleSend = useCallback(() => {
        sendMessage(input);
    }, [input, sendMessage]);

    const handleQuickAction = useCallback(
        (action: QuickAction) => {
            sendMessage(action.message, action.mode);
        },
        [sendMessage]
    );

    const handleClearChat = useCallback(() => {
        const confirmed = window.confirm(
            "Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện và bắt đầu lại với AI Tutor?"
        );

        if (!confirmed) return;

        setConversationId(null);
        setCanAskNextHint(true);
        setServerQuickActions(null);
        setMessages([
            {
                id: "intro",
                role: "assistant",
                content: fallbackIntroMessage,
                timestamp: new Date(),
            },
        ]);

        clearTutorSession(context.lessonSlug);
    }, [context.lessonSlug, fallbackIntroMessage]);

    const handleDebugRequest = useCallback(() => {
        setSelectedMode("DEBUG");
        sendMessage(
            `Tôi đang chạy thử bài làm của mình trên Editor và gặp lỗi [${workspace?.verdict}]. Hãy phân tích lỗi này giúp tôi và hướng dẫn tôi các bước debug cụ thể.`,
            "DEBUG"
        );
    }, [sendMessage, workspace?.verdict]);

    return {
        availableModes,
        canAskNextHint,
        handleClearChat,
        handleDebugRequest,
        handleQuickAction,
        handleSend,
        hasRealMessages,
        input,
        isLoading,
        isRateLimited,
        isSocratic,
        messages,
        quickActionsList,
        rateLimitCountdown,
        scrollRef,
        selectedMode,
        setInput,
        setIsSocratic,
        setSelectedMode,
        workspace,
    };
}
