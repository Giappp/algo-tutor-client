"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/api/api-client";
import { cn } from "@/lib/utils";
import type { ChatMessage, LessonContext } from "@/lib/types/lesson";
import { toast } from "sonner";
import {
    LightbulbIcon,
    SparklesIcon,
    TrendingUpIcon,
    ZapIcon,
    MessageSquareIcon,
    SlidersIcon,
    BotIcon,
    CheckIcon,
    Code2Icon,
} from "lucide-react";

// Subcomponents import
import { ChatHeader } from "./ai-tutor/chat-header";
import { WorkspaceStatus } from "./ai-tutor/workspace-status";
import { WelcomeDashboard } from "./ai-tutor/welcome-dashboard";
import { ChatMessagesList } from "./ai-tutor/chat-messages-list";
import { ChatInput } from "./ai-tutor/chat-input";

const STORAGE_KEY_PREFIX = "ai-tutor-chat-";

interface QuickAction {
    label: string;
    intent?: string;
    mode: string;
    message: string;
    icon?: React.ElementType;
}

function getStorageKey(lessonSlug: string): string {
    return `${STORAGE_KEY_PREFIX}${lessonSlug}`;
}

function loadChatHistory(lessonSlug: string): ChatMessage[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(getStorageKey(lessonSlug));
        if (!raw) return [];
        const parsed = JSON.parse(raw) as ChatMessage[];
        return parsed.map((m) => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch {
        return [];
    }
}

function saveChatHistory(lessonSlug: string, messages: ChatMessage[]) {
    if (typeof window === "undefined") return;
    try {
        localStorage.setItem(getStorageKey(lessonSlug), JSON.stringify(messages));
    } catch {
        // ignore
    }
}

export function AITutorPanel({ context }: { context: LessonContext }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(false);

    // Core AI states
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [canAskNextHint, setCanAskNextHint] = useState<boolean>(true);
    const [selectedMode, setSelectedMode] = useState<string>(
        context.lessonType === "CODING" ? "HINT" : "EXPLAIN"
    );
    const [serverQuickActions, setServerQuickActions] = useState<QuickAction[] | null>(null);

    // Socratic Persona Toggle
    const [isSocratic, setIsSocratic] = useState<boolean>(true);

    // Rate Limit State
    const [rateLimitCountdown, setRateLimitCountdown] = useState<number | null>(null);

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

    // Active Code Editor Watcher State
    const [workspace, setWorkspace] = useState<{
        code: string;
        language: string;
        verdict?: string;
        errorMessage?: string;
        failedCount: number;
        totalCount: number;
    } | null>(null);

    // Watcher for active editor changes
    useEffect(() => {
        const updateWorkspaceState = () => {
            if (typeof window === "undefined") return;
            try {
                const activeCode = sessionStorage.getItem(`active-code-${context.lessonSlug}`) || "";
                const activeLang = sessionStorage.getItem(`active-lang-${context.lessonSlug}`) || "PYTHON";
                const storedResult = sessionStorage.getItem(`active-judge-result-${context.lessonSlug}`);

                let verdict: string | undefined;
                let errorMessage: string | undefined;
                let failedCount = 0;
                let totalCount = 0;

                if (storedResult) {
                    const parsed = JSON.parse(storedResult);
                    verdict = parsed.verdict;
                    errorMessage = parsed.compilationError || parsed.results?.find((r: { passed?: boolean; error?: string }) => !r.passed)?.error || "";
                    if (parsed.results && Array.isArray(parsed.results)) {
                        totalCount = parsed.results.length;
                        failedCount = parsed.results.filter((r: { passed?: boolean; error?: string }) => !r.passed).length;
                    }
                }

                setWorkspace({
                    code: activeCode,
                    language: activeLang.toUpperCase(),
                    verdict,
                    errorMessage,
                    failedCount,
                    totalCount,
                });
            } catch (e) {
                console.error("Error reading workspace state", e);
            }
        };

        updateWorkspaceState();
        const interval = setInterval(updateWorkspaceState, 1500);
        return () => clearInterval(interval);
    }, [context.lessonSlug]);

    // Bootstrap chat session
    const triggerBootstrap = useCallback(async (activeRef?: { current: boolean }) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<{
                data: {
                    conversationId: string;
                    canAskNextHint?: boolean;
                    quickActions?: QuickAction[];
                    answer?: string;
                };
            }>(
                `/ai/chat/bootstrap`,
                { params: { lessonSlug: context.lessonSlug } }
            );

            if (activeRef && !activeRef.current) return;

            const resData = response.data?.data;
            if (resData) {
                setConversationId(resData.conversationId);
                if (typeof window !== "undefined") {
                    localStorage.setItem(`ai-conversation-id-${context.lessonSlug}`, resData.conversationId);
                }
                if (resData.canAskNextHint !== null && resData.canAskNextHint !== undefined) {
                    setCanAskNextHint(resData.canAskNextHint);
                }

                if (resData.quickActions && resData.quickActions.length > 0) {
                    setServerQuickActions(resData.quickActions);
                } else {
                    setServerQuickActions(null);
                }

                setMessages([
                    {
                        id: "intro",
                        role: "assistant",
                        content: resData.answer || `Chào mừng bạn đến với bài học **${context.lessonTitle}**!`,
                        timestamp: new Date()
                    }
                ]);
                setIsLoading(false);
                return;
            }
        } catch (err) {
            console.warn("Backend bootstrap API not ready or failed.", err);
        }

        if (activeRef && !activeRef.current) return;

        setConversationId(null);
        setCanAskNextHint(true);
        setServerQuickActions(null);

        const typeLabel = {
            THEORY: "bài học lý thuyết",
            QUIZ: "bài tập trắc nghiệm",
            CODING: "thử thách lập trình",
        }[context.lessonType] || "bài học";

        const introMsg: ChatMessage = {
            id: "intro",
            role: "assistant",
            content: `Xin chào! Tôi là **AI Tutor**, trợ lý học tập cá nhân của bạn trong bài học **${context.lessonTitle}**.

Chúng ta đang ở lộ trình **${context.roadmapName}**, cùng tìm hiểu một ${typeLabel}.

Tôi có thể hỗ trợ bạn:
- Giải thích chi tiết các khái niệm lý thuyết cốt lõi
- Phân tích hướng giải bài tập từng bước một (chế độ **Gợi ý / HINT**)
- Hướng dẫn dò lỗi và debug mã nguồn của bạn (chế độ **Sửa lỗi / DEBUG**)
- Giải thích chi tiết lý do đằng sau các đáp án trắc nghiệm
- Phân tích độ phức tạp thuật toán (chế độ **Độ phức tạp / COMPLEXITY**)

Hãy chọn chế độ chat phù hợp hoặc sử dụng các hành động nhanh bên dưới để bắt đầu nhé!`,
            timestamp: new Date(),
        };
        setMessages([introMsg]);
        setIsLoading(false);
    }, [context.lessonSlug, context.lessonTitle, context.lessonType, context.roadmapName]);

    // Context-aware local quick actions
    const getQuickActions = useCallback((): QuickAction[] => {
        if (context.lessonType === "CODING") {
            return [
                {
                    label: "💡 Nhận gợi ý hướng giải",
                    mode: "HINT",
                    message: "Tôi đang bị bí bài này. Hãy cho tôi một gợi ý về hướng tiếp cận tối ưu mà không cho code giải được không?",
                    icon: SparklesIcon,
                },
                {
                    label: "📖 Giải thích yêu cầu đề bài",
                    mode: "EXPLAIN",
                    message: "Bạn có thể giải thích chi tiết yêu cầu của đề bài và phân tích các ví dụ một cách dễ hiểu hơn không?",
                    icon: LightbulbIcon,
                },
                {
                    label: "🛠️ Hướng dẫn gỡ lỗi (Debug)",
                    mode: "DEBUG",
                    message: "Mã nguồn hiện tại của tôi đang gặp lỗi hoặc chưa tối ưu. Hãy hướng dẫn tôi cách dò lỗi từng bước.",
                    icon: Code2Icon,
                },
                {
                    label: "📈 Phân tích độ phức tạp tối ưu",
                    mode: "COMPLEXITY",
                    message: "Độ phức tạp thời gian và không gian tốt nhất cho bài toán này là bao nhiêu?",
                    icon: TrendingUpIcon,
                },
            ];
        }
        if (context.lessonType === "THEORY") {
            return [
                {
                    label: "📝 Tóm tắt lý thuyết trọng tâm",
                    mode: "EXPLAIN",
                    message: "Tóm tắt giúp tôi những kiến thức cốt lõi và quan trọng nhất trong bài học lý thuyết này.",
                    icon: LightbulbIcon,
                },
                {
                    label: "💡 Cho ví dụ thực tế trực quan",
                    mode: "EXPLAIN",
                    message: "Hãy cho tôi một ví dụ thực tế sinh động hoặc một hình ảnh ẩn dụ dễ hiểu để dễ ghi nhớ khái niệm này.",
                    icon: ZapIcon,
                },
                {
                    label: "🌍 Ứng dụng thực tế khi đi làm",
                    mode: "EXPLAIN",
                    message: "Trong thực tế dự án, cấu trúc dữ liệu hoặc giải thuật này thường được dùng để giải quyết bài toán gì?",
                    icon: TrendingUpIcon,
                },
                {
                    label: "❓ Đố vui ôn tập kiến thức",
                    mode: "NEXT_STEP",
                    message: "Hãy đặt cho tôi 2-3 câu hỏi ngắn để tự kiểm tra xem tôi đã hiểu bài học lý thuyết này chưa.",
                    icon: MessageSquareIcon,
                },
            ];
        }
        return [
            {
                label: "⚡ Trọng tâm kiến thức bài kiểm tra",
                mode: "EXPLAIN",
                message: "Tóm tắt ngắn gọn các chủ điểm lý thuyết chính liên quan mật thiết đến bộ câu hỏi trắc nghiệm này.",
                icon: LightbulbIcon,
            },
            {
                label: "🎯 Mẹo tránh bẫy trắc nghiệm",
                mode: "EXPLAIN",
                message: "Chia sẻ cho tôi một vài mẹo hoặc lưu ý quan trọng để tránh bị bẫy khi làm các câu hỏi thuộc chủ đề này.",
                icon: ZapIcon,
            },
            {
                label: "💡 Ví dụ minh họa kiến thức",
                mode: "EXPLAIN",
                message: "Cho tôi một ví dụ cụ thể liên quan đến các câu hỏi lý thuyết của bài tập trắc nghiệm này.",
                icon: TrendingUpIcon,
            },
            {
                label: "📝 Luyện thêm câu hỏi tương tự",
                mode: "NEXT_STEP",
                message: "Hãy đặt thêm một câu hỏi trắc nghiệm phụ liên quan để tôi thử sức củng cố kiến thức.",
                icon: MessageSquareIcon,
            },
        ];
    }, [context.lessonType]);

    // Available chat modes
    const getAvailableModes = useCallback(() => {
        if (context.lessonType === "CODING") {
            return [
                { id: "HINT", label: "Gợi ý", icon: SparklesIcon, tooltip: "Gợi ý hướng giải bài tập từng bước" },
                { id: "EXPLAIN", label: "Giải thích", icon: LightbulbIcon, tooltip: "Giải thích đề bài & lý thuyết" },
                { id: "DEBUG", label: "Sửa lỗi", icon: BotIcon, tooltip: "Dò lỗi & gỡ lỗi trong mã nguồn" },
                { id: "REVIEW", label: "Đánh giá", icon: CheckIcon, tooltip: "Đánh giá cấu trúc & chất lượng code" },
                { id: "COMPLEXITY", label: "Độ phức tạp", icon: TrendingUpIcon, tooltip: "Phân tích độ phức tạp thuật toán" },
            ];
        }
        return [
            { id: "EXPLAIN", label: "Giải thích", icon: LightbulbIcon, tooltip: "Giải thích lý thuyết & ví dụ" },
            { id: "NEXT_STEP", label: "Định hướng", icon: ZapIcon, tooltip: "Gợi mở bước học tập tiếp theo" },
        ];
    }, [context.lessonType]);

    // Initialize or load chat history
    useEffect(() => {
        const stored = loadChatHistory(context.lessonSlug);
        const active = { current: true };

        const timer = setTimeout(() => {
            if (!active.current) return;
            setSelectedMode(context.lessonType === "CODING" ? "HINT" : "EXPLAIN");

            if (stored.length > 0) {
                setMessages(stored);
                setServerQuickActions(null);

                const lastMsg = stored[stored.length - 1];
                if (lastMsg && typeof window !== "undefined") {
                    const cachedConvId = localStorage.getItem(`ai-conversation-id-${context.lessonSlug}`);
                    if (cachedConvId) setConversationId(cachedConvId);
                }
            } else {
                setMessages([]);
                triggerBootstrap(active);
            }
        }, 0);

        return () => {
            active.current = false;
            clearTimeout(timer);
        };
    }, [context.lessonSlug, context.lessonType, triggerBootstrap]);

    // Persist messages
    useEffect(() => {
        if (messages.length > 0) {
            saveChatHistory(context.lessonSlug, messages);
            if (conversationId && typeof window !== "undefined") {
                localStorage.setItem(`ai-conversation-id-${context.lessonSlug}`, conversationId);
            }
        }
    }, [messages, conversationId, context.lessonSlug]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const sendMessage = useCallback(
        async (text: string, overrideMode?: string) => {
            if (!text.trim() || isLoading || isLoadingRef.current) return;
            if (rateLimitCountdown !== null && rateLimitCountdown > 0) return;
            isLoadingRef.current = true;

            const modeToSend = overrideMode || selectedMode;

            if (modeToSend === "HINT" && !canAskNextHint) {
                toast.error("Bạn đã hết lượt xin gợi ý cho bài tập này! Hãy thử sức tự giải quyết nhé.");
                isLoadingRef.current = false;
                return;
            }

            let finalPromptText = text;
            if (isSocratic && (modeToSend === "HINT" || modeToSend === "DEBUG" || modeToSend === "EXPLAIN")) {
                finalPromptText = `${text}\n\n[System Directive: Please reply as an expert Socratic Coding Tutor. DO NOT output completed code solutions or complete rewrites. Instead, analyze the student's code, point out the logical error conceptually, provide progressive tips, and ask guided questions to help them code the solution themselves.]`;
            }

            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                content: text,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setIsLoading(true);

            const tempAiMsgId = (Date.now() + 1).toString();
            setMessages((prev) => [
                ...prev,
                {
                    id: tempAiMsgId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date()
                }
            ]);

            const activeCode = sessionStorage.getItem(`active-code-${context.lessonSlug}`) || "";
            const activeLang = (sessionStorage.getItem(`active-lang-${context.lessonSlug}`) || "PYTHON").toUpperCase();

            let verdict: string | undefined;
            let errorMessage: string | undefined;
            let failedTestCases: string[] = [];

            try {
                const storedResult = sessionStorage.getItem(`active-judge-result-${context.lessonSlug}`);
                if (storedResult) {
                    const parsed = JSON.parse(storedResult);
                    verdict = parsed.verdict;
                    errorMessage = parsed.compilationError || parsed.results?.find((r: { passed?: boolean; error?: string }) => !r.passed)?.error || "";
                    failedTestCases = parsed.results
                        ?.map((r: { passed?: boolean; error?: string }, i: number) => (!r.passed ? `test_case_${i + 1}` : null))
                        .filter((v: string | null): v is string => v !== null) || [];
                }
            } catch (e) {
                console.error("Error reading judge result", e);
            }

            const requestBody = {
                conversationId: conversationId || undefined,
                lessonId: context.lessonId,
                lessonSlug: context.lessonSlug,
                mode: modeToSend,
                message: finalPromptText,
                code: activeCode || undefined,
                language: activeLang,
                judgeResult: verdict,
                errorMessage: errorMessage || undefined,
                failedTestCases: failedTestCases.length > 0 ? failedTestCases : undefined
            };

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";
            let streamSuccess = false;
            let fullResponseText = "";

            try {
                const response = await fetch(`${baseUrl}/ai/chat/stream`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "text/event-stream"
                    },
                    body: JSON.stringify(requestBody),
                    credentials: "include"
                });

                if (!response.ok) {
                    if (response.status === 429) {
                        const retryAfterHeader = response.headers.get("Retry-After");
                        const seconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
                        const retrySec = isNaN(seconds) ? 60 : seconds;

                        setRateLimitCountdown(retrySec);
                        toast.error(`Bạn đang thao tác quá nhanh. AI cần nghỉ ngơi một chút. Vui lòng thử lại sau ${retrySec} giây.`);
                        setMessages((prev) => prev.filter((m) => m.id !== tempAiMsgId));
                        setIsLoading(false);
                        isLoadingRef.current = false;
                        return;
                    }
                    if (response.status === 400) {
                        const errData = await response.json().catch(() => ({}));
                        if (errData.errorCode === "NO_MORE_HINTS") {
                            toast.error("Bạn đã hết lượt xin gợi ý cho bài tập này!");
                            setCanAskNextHint(false);
                            setMessages((prev) => prev.filter((m) => m.id !== tempAiMsgId));
                            setIsLoading(false);
                            isLoadingRef.current = false;
                            return;
                        }
                    }
                    throw new Error("Streaming error response");
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No readable stream support");

                streamSuccess = true;
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
                        } else if (trimmed.startsWith("data:")) {
                            const dataContent = trimmed.substring(5).trim();
                            try {
                                const parsed = JSON.parse(dataContent);
                                if (currentEvent === "message") {
                                    const newChunk = parsed.answer || "";
                                    fullResponseText += newChunk;
                                    setMessages((prev) =>
                                        prev.map((m) =>
                                            m.id === tempAiMsgId ? { ...m, content: fullResponseText } : m
                                        )
                                    );
                                } else if (currentEvent === "metadata") {
                                    if (parsed.conversationId) {
                                        setConversationId(parsed.conversationId);
                                    }
                                    if (parsed.quickActions && parsed.quickActions.length > 0) {
                                        setServerQuickActions(parsed.quickActions);
                                    }
                                    if (parsed.canAskNextHint !== undefined && parsed.canAskNextHint !== null) {
                                        setCanAskNextHint(parsed.canAskNextHint);
                                    }
                                }
                            } catch (e) {
                                console.error("Error parsing stream chunk", e);
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn("Streaming chat failed, falling back to sync chat.", err);
            }

            if (!streamSuccess) {
                try {
                    const response = await apiClient.post<{
                        data: {
                            conversationId?: string;
                            canAskNextHint?: boolean;
                            quickActions?: QuickAction[];
                            answer?: string;
                        };
                    }>("/ai/chat", requestBody);
                    const resData = response.data?.data;
                    if (resData) {
                        setConversationId(resData.conversationId ?? null);
                        if (resData.canAskNextHint !== null && resData.canAskNextHint !== undefined) {
                            setCanAskNextHint(resData.canAskNextHint);
                        }
                        if (resData.quickActions && resData.quickActions.length > 0) {
                            setServerQuickActions(resData.quickActions);
                        }

                        fullResponseText = resData.answer || "";
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === tempAiMsgId ? { ...m, content: fullResponseText } : m
                            )
                        );
                        setIsLoading(false);
                        isLoadingRef.current = false;
                        return;
                    }
                } catch (err: any) {
                    console.warn("Synchronous chat failed.", err);

                    if (err?.response?.status === 429) {
                        const retryAfterHeader = err.response.headers?.["retry-after"] || err.response.headers?.["Retry-After"];
                        const seconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
                        const retrySec = isNaN(seconds) ? 60 : seconds;

                        setRateLimitCountdown(retrySec);
                        toast.error(`Bạn đang thao tác quá nhanh. AI cần nghỉ ngơi một chút. Vui lòng thử lại sau ${retrySec} giây.`);
                        setMessages((prev) => prev.filter((m) => m.id !== tempAiMsgId));
                        setIsLoading(false);
                        isLoadingRef.current = false;
                        return;
                    }

                    if (err && err.response?.data?.errorCode === "NO_MORE_HINTS") {
                        toast.error("Bạn đã hết lượt xin gợi ý cho bài tập này!");
                        setCanAskNextHint(false);
                        setMessages((prev) => prev.filter((m) => m.id !== tempAiMsgId));
                        setIsLoading(false);
                        isLoadingRef.current = false;
                        return;
                    }
                }
            }

            setIsLoading(false);
            isLoadingRef.current = false;
        },
        [isLoading, context, conversationId, selectedMode, canAskNextHint, isSocratic]
    );

    // Handle external ask events from inline buttons
    useEffect(() => {
        const handleExternalAsk = (e: Event) => {
            const customEvent = e as CustomEvent<{ message: string; mode?: string }>;
            if (customEvent.detail && customEvent.detail.message) {
                const { message, mode } = customEvent.detail;
                if (mode) {
                    setSelectedMode(mode);
                }
                sendMessage(message, mode);
            }
        };

        window.addEventListener("ai-tutor-ask", handleExternalAsk);
        return () => {
            window.removeEventListener("ai-tutor-ask", handleExternalAsk);
        };
    }, [sendMessage]);

    const handleSend = () => sendMessage(input);

    const handleQuickAction = (action: QuickAction) => {
        sendMessage(action.message, action.mode);
    };

    const handleClearChat = async () => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện và bắt đầu lại cuộc trò chuyện với Tutor?");
        if (!confirmed) return;

        setMessages([]);
        setConversationId(null);
        setCanAskNextHint(true);
        setServerQuickActions(null);
        localStorage.removeItem(getStorageKey(context.lessonSlug));
        localStorage.removeItem(`ai-conversation-id-${context.lessonSlug}`);

        await triggerBootstrap();
    };

    const quickActionsList = serverQuickActions || getQuickActions();

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none animate-pulse-slow" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none animate-pulse-slow" />

            {/* Header Component */}
            <ChatHeader
                lessonType={context.lessonType}
                lessonTitle={context.lessonTitle}
                roadmapName={context.roadmapName}
                onClearChat={handleClearChat}
                canAskNextHint={canAskNextHint}
            />

            {/* Interactive Socratic Switcher Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/5 z-1 shrink-0 relative text-xs">
                <div className="flex items-center gap-2">
                    <SlidersIcon className="size-3.5 text-primary" />
                    <span className="font-semibold text-foreground">Chế độ Gợi mở (Socratic)</span>
                </div>
                <button
                    onClick={() => setIsSocratic(!isSocratic)}
                    className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                        isSocratic ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                    title={isSocratic ? "Tắt chế độ gợi mở để AI trả lời trực tiếp" : "Bật chế độ gợi mở để AI hướng dẫn từng bước"}
                >
                    <span
                        className={cn(
                            "pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-md transition duration-200 ease-in-out",
                            isSocratic ? "translate-x-4" : "translate-x-0"
                        )}
                    />
                </button>
            </div>

            {/* Segmented Mode Selector Bar */}
            <div className="flex gap-1.5 px-4 py-2 border-b border-border/30 bg-muted/10 overflow-x-auto scrollbar-none shrink-0 z-1">
                {getAvailableModes().map((m) => {
                    const isActive = selectedMode === m.id;
                    const isHint = m.id === "HINT";
                    const isHintDisabled = isHint && !canAskNextHint;

                    return (
                        <button
                            key={m.id}
                            type="button"
                            disabled={isHintDisabled}
                            onClick={() => setSelectedMode(m.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all duration-200 shrink-0 cursor-pointer shadow-xs",
                                isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25 active:scale-95"
                                    : isHintDisabled
                                        ? "bg-muted/40 text-muted-foreground/30 border-border/20 cursor-not-allowed opacity-50"
                                        : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50 border-border/60 active:scale-95"
                            )}
                            title={isHintDisabled ? "Bạn đã hết lượt xin gợi ý cho bài tập này!" : m.tooltip}
                        >
                            <m.icon className="size-3" />
                            <span>{m.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Workspace Link/Status Component */}
            <WorkspaceStatus
                lessonType={context.lessonType}
                workspace={workspace}
                onDebugRequest={() => {
                    setSelectedMode("DEBUG");
                    sendMessage(
                        `Tôi đang chạy thử bài làm của mình trên Editor và gặp lỗi [${workspace?.verdict}]. Hãy phân tích lỗi này giúp tôi và hướng dẫn tôi các bước debug cụ thể.`,
                        "DEBUG"
                    );
                }}
            />

            {/* Chat Messages Panel */}
            <div className="flex-1 flex flex-col min-h-0 bg-background/50">
                {messages.length <= 1 ? (
                    <WelcomeDashboard
                        lessonTitle={context.lessonTitle}
                        canAskNextHint={canAskNextHint}
                        quickActions={quickActionsList}
                        onQuickAction={handleQuickAction}
                    />
                ) : (
                    <ChatMessagesList
                        messages={messages}
                        isLoading={isLoading}
                        ref={scrollRef}
                    />
                )}
            </div>

            {/* Rate limit warning banner */}
            {rateLimitCountdown !== null && rateLimitCountdown > 0 && (
                <div className="bg-destructive/15 border-y border-destructive/20 px-4 py-2.5 text-xs text-destructive font-semibold flex items-center gap-2 animate-in fade-in duration-200 shrink-0 z-1">
                    <span className="relative flex size-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-red-500" />
                    </span>
                    <span>
                        Bạn đang thao tác quá nhanh. AI cần nghỉ ngơi một chút. Thử lại sau {rateLimitCountdown} giây.
                    </span>
                </div>
            )}

            {/* Chat Input Component */}
            <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isLoading={isLoading || (rateLimitCountdown !== null && rateLimitCountdown > 0)}
                selectedMode={selectedMode}
                quickActions={quickActionsList}
                canAskNextHint={canAskNextHint}
                onQuickAction={handleQuickAction}
                hasMessages={messages.length > 1}
            />
        </div>
    );
}
