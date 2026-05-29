"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/api/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatMessage, LessonContext } from "@/lib/types/lesson";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
    BotIcon,
    CheckIcon,
    CopyIcon,
    LightbulbIcon,
    Loader2Icon,
    MessageSquareIcon,
    SendIcon,
    SparklesIcon,
    TrashIcon,
    TrendingUpIcon,
    UserIcon,
    ZapIcon,
    SlidersIcon,
    TerminalIcon,
    GraduationCapIcon,
    InfoIcon,
    ArrowRightIcon,
    Code2Icon,
    AlertCircleIcon,
    PlayIcon,
} from "lucide-react";

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
    const [copiedId, setCopiedId] = useState<string | null>(null);
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
                    errorMessage = parsed.compilationError || parsed.results?.find((r: any) => !r.passed)?.error || "";
                    if (parsed.results && Array.isArray(parsed.results)) {
                        totalCount = parsed.results.length;
                        failedCount = parsed.results.filter((r: any) => !r.passed).length;
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
        // Check sessionStorage periodically for edits/submits
        const interval = setInterval(updateWorkspaceState, 1500);
        return () => clearInterval(interval);
    }, [context.lessonSlug]);

    // Bootstrap chat session from server API or setup clean fallback welcome message
    const triggerBootstrap = useCallback(async (activeRef?: { current: boolean }) => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<any>(
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

                // Set dynamic quick actions from server
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

        // Fallback to a clean default welcome message when bootstrap API fails
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
        // QUIZ
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

    // Available chat modes depending on lesson type
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

    // Initialize or load chat context
    useEffect(() => {
        const stored = loadChatHistory(context.lessonSlug);
        setSelectedMode(context.lessonType === "CODING" ? "HINT" : "EXPLAIN");

        if (stored.length > 0) {
            setMessages(stored);
            setServerQuickActions(null);

            // Try loading stored conversationId if any
            const lastMsg = stored[stored.length - 1];
            if (lastMsg && typeof window !== "undefined") {
                const cachedConvId = localStorage.getItem(`ai-conversation-id-${context.lessonSlug}`);
                if (cachedConvId) setConversationId(cachedConvId);
            }
        } else {
            setMessages([]);
            const active = { current: true };
            triggerBootstrap(active);
            return () => {
                active.current = false;
            };
        }
    }, [context.lessonSlug, context.lessonType, triggerBootstrap]);

    // Persist messages & conversationId to localStorage
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
            isLoadingRef.current = true;

            const modeToSend = overrideMode || selectedMode;

            // 1. Check Hints Limits on Front-End
            if (modeToSend === "HINT" && !canAskNextHint) {
                toast.error("Bạn đã hết lượt xin gợi ý cho bài tập này! Hãy thử sức tự giải quyết nhé.");
                isLoadingRef.current = false;
                return;
            }

            // Apply Socratic prompt suffix to strictly guide user instead of spoiling solutions
            let finalPromptText = text;
            if (isSocratic && (modeToSend === "HINT" || modeToSend === "DEBUG" || modeToSend === "EXPLAIN")) {
                finalPromptText = `${text}\n\n[System Directive: Please reply as an expert Socratic Coding Tutor. DO NOT output completed code solutions or complete rewrites. Instead, analyze the student's code, point out the logical error conceptually, provide progressive tips, and ask guided questions to help them code the solution themselves.]`;
            }

            // 2. Add User Message
            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                content: text,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setIsLoading(true);

            // 3. Add Placeholder assistant message for streaming
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

            // 4. Retrieve Active Workspace from sessionStorage
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
                    errorMessage = parsed.compilationError || parsed.results?.find((r: any) => !r.passed)?.error || "";
                    failedTestCases = parsed.results
                        ?.map((r: any, i: number) => (!r.passed ? `test_case_${i + 1}` : null))
                        .filter((v: any): v is string => v !== null) || [];
                }
            } catch (e) {
                console.error("Error reading judge result", e);
            }

            // 5. Structure payload
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

            // 6. Attempt Streaming SSE Chat
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

            // 7. Fallback: Synchronous API
            if (!streamSuccess) {
                try {
                    const response = await apiClient.post<any>("/ai/chat", requestBody);
                    const resData = response.data?.data;
                    if (resData) {
                        setConversationId(resData.conversationId);
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
                } catch (err) {
                    console.warn("Synchronous chat failed.", err);

                    if (err && (err as any).response?.data?.errorCode === "NO_MORE_HINTS") {
                        toast.error("Bạn đã hết lượt xin gợi ý cho bài tập này!");
                        setCanAskNextHint(false);
                        setMessages((prev) => prev.filter((m) => m.id !== tempAiMsgId));
                        setIsLoading(false);
                        isLoadingRef.current = false;
                        return;
                    }
                }

                toast.error("Không thể kết nối với máy chủ AI. Vui lòng kiểm tra lại kết nối mạng!");
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === tempAiMsgId
                            ? {
                                ...m,
                                content: "⚠️ **Lỗi kết nối:** Không thể kết nối tới máy chủ trợ lý AI. Vui lòng thử lại sau ít phút hoặc kiểm tra lại kết nối mạng của bạn!",
                            }
                            : m
                    )
                );
            }

            setIsLoading(false);
            isLoadingRef.current = false;
        },
        [isLoading, context, conversationId, selectedMode, canAskNextHint, isSocratic]
    );

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

        // Re-bootstrap chat session
        await triggerBootstrap();
    };

    const handleCopyMessage = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const quickActions = serverQuickActions || getQuickActions();

    const typeColors: Record<string, string> = {
        THEORY: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        QUIZ: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        CODING: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    };

    // Render active workspace widget
    const renderWorkspaceStatus = () => {
        if (context.lessonType !== "CODING" || !workspace) return null;

        const hasCode = workspace.code.trim().length > 0;
        const hasVerdict = !!workspace.verdict;

        return (
            <div className="mx-4 mt-3 p-3 rounded-xl border border-border/40 bg-muted/15 backdrop-blur-xs flex flex-col gap-2 shrink-0 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <TerminalIcon className="size-3.5 text-primary" />
                        <span className="font-bold">Trình biên dịch:</span>
                        <Badge variant="outline" className="text-[9px] px-1 rounded-sm bg-background border-border/40 font-mono font-extrabold text-foreground">
                            {workspace.language}
                        </Badge>
                    </div>
                    {hasCode ? (
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đã liên kết code ({workspace.code.length} ký tự)
                        </span>
                    ) : (
                        <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Chưa viết code
                        </span>
                    )}
                </div>

                {hasVerdict && (
                    <div className="flex items-center justify-between border-t border-border/20 pt-2 text-[11px] mt-1">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-muted-foreground">Kết quả:</span>
                            {workspace.verdict === "ACCEPTED" ? (
                                <Badge className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-extrabold uppercase rounded px-1 py-0">
                                    SUCCESS (AC)
                                </Badge>
                            ) : (
                                <Badge className="text-[8px] bg-destructive/10 text-destructive border-destructive/20 font-extrabold uppercase rounded px-1 py-0">
                                    {workspace.verdict} ({workspace.failedCount}/{workspace.totalCount} lỗi)
                                </Badge>
                            )}
                        </div>

                        {workspace.verdict !== "ACCEPTED" && (
                            <button
                                onClick={() => {
                                    setSelectedMode("DEBUG");
                                    sendMessage(
                                        `Tôi đang chạy thử bài làm của mình trên Editor và gặp lỗi [${workspace.verdict}]. Hãy phân tích lỗi này giúp tôi và hướng dẫn tôi các bước debug cụ thể.`,
                                        "DEBUG"
                                    );
                                }}
                                className="text-[10px] font-extrabold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer underline underline-offset-2"
                            >
                                <SparklesIcon className="size-3 text-amber-500 animate-pulse" />
                                Nhờ AI sửa lỗi
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Render interactive blank state / dashboard
    const renderWelcomeDashboard = () => {
        const localQuickActions = getQuickActions();
        
        return (
            <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 scrollbar-thin">
                {/* Glowing Welcome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 p-4 shadow-sm"
                >
                    <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
                    <div className="flex gap-3">
                        <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                            <GraduationCapIcon className="size-5 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="font-bold text-sm text-foreground">AlgoTutor AI Co-pilot</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Xin chào! Mình là trợ lý học tập cá nhân của bạn cho bài học <strong className="text-foreground">{context.lessonTitle}</strong>. 
                                Mình được thiết kế để giảng giải lý thuyết, gợi ý giải thuật và cùng bạn dò lỗi, giúp bạn phát triển tư duy lập trình tối đa!
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Main Action Grid */}
                <div className="flex flex-col gap-3">
                    <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground px-1">
                        ⚡ Bạn muốn trợ lý hỗ trợ gì ngay?
                    </h5>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                        {localQuickActions.map((action, idx) => {
                            const ActionIcon = action.icon || SparklesIcon;
                            const isHint = action.mode === "HINT";
                            const isHintDisabled = isHint && !canAskNextHint;

                            return (
                                <motion.button
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    disabled={isHintDisabled}
                                    onClick={() => handleQuickAction(action)}
                                    className={cn(
                                        "group text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden flex items-start gap-3 shadow-xs cursor-pointer",
                                        isHintDisabled
                                            ? "bg-muted/40 text-muted-foreground/30 border-border/20 cursor-not-allowed opacity-50"
                                            : "bg-card hover:bg-muted/40 hover:border-primary/30 border-border/60 hover:shadow-xs active:scale-[0.99]"
                                    )}
                                >
                                    <div className={cn(
                                        "size-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                        isHintDisabled 
                                            ? "bg-muted border-border/20 text-muted-foreground/20" 
                                            : "bg-primary/5 group-hover:bg-primary/10 border-primary/10 text-primary"
                                    )}>
                                        <ActionIcon className="size-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                                                {action.label.substring(2)}
                                            </span>
                                            {isHint && (
                                                <Badge variant="outline" className={cn("text-[8px] font-extrabold py-0 px-1 rounded-sm uppercase tracking-wide", canAskNextHint ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5")}>
                                                    {canAskNextHint ? "Gợi ý khả dụng" : "Đã hết lượt"}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">
                                            {action.message}
                                        </p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Socratic Mode Note */}
                <div className="mt-auto p-3 rounded-xl border border-border/40 bg-muted/10 flex gap-2 items-start text-[10px] text-muted-foreground leading-relaxed">
                    <InfoIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
                    <div>
                        <strong className="text-foreground">Chế độ Gợi mở (Socratic) đang BẬT:</strong> AI Tutor sẽ gợi mở hướng giải và chỉ ra lỗi sai thay vì trực tiếp cho code giải, giúp bạn phát triển tư duy thuật toán vững chắc.
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none animate-pulse-slow" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl pointer-events-none animate-pulse-slow" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-md z-1 shrink-0 relative">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-purple-600 opacity-60 blur-xs animate-pulse" />
                        <div className="relative size-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-md">
                            <SparklesIcon className="size-4 text-primary-foreground fill-primary-foreground/10" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">AI Tutor</h3>
                        <div className="flex items-center gap-1">
                            <span className="relative flex size-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                            </span>
                            <p className="text-[10px] font-medium text-muted-foreground">Trợ lý đang trực tuyến</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Badge variant="secondary" className={cn("text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 shadow-xs rounded-md border", typeColors[context.lessonType])}>
                        {context.lessonType}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all duration-200 cursor-pointer"
                        onClick={handleClearChat}
                        title="Xóa cuộc trò chuyện và bắt đầu lại"
                    >
                        <TrashIcon className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Context Banner */}
            <div className="px-4 py-2 bg-muted/20 border-b border-border/30 z-1 shrink-0 relative flex items-center justify-between text-xs">
                <div className="flex flex-col gap-0.5 min-w-0 max-w-[80%]">
                    <span className="font-bold text-foreground truncate">{context.lessonTitle}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{context.roadmapName}</span>
                </div>
                {context.lessonType === "CODING" && (
                    <Badge variant="outline" className={cn("text-[9px] font-bold py-0.5 rounded px-1.5 shadow-2xs bg-background border", canAskNextHint ? "text-emerald-500 border-emerald-500/20" : "text-amber-500 border-amber-500/20")}>
                        {canAskNextHint ? "Gợi ý khả dụng" : "Đã hết gợi ý"}
                    </Badge>
                )}
            </div>

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
                                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all duration-200 shrink-0 cursor-pointer shadow-xs",
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

            {/* Live editor workspace status */}
            {renderWorkspaceStatus()}

            {/* Chat Content Panel */}
            <div className="flex-1 flex flex-col min-h-0 bg-background/50">
                {messages.length <= 1 ? (
                    renderWelcomeDashboard()
                ) : (
                    <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-5 pb-4">
                            <AnimatePresence initial={false}>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        transition={{ duration: 0.3 }}
                                        className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
                                    >
                                        <div
                                            className={cn(
                                                "size-8 rounded-full flex items-center justify-center shrink-0 shadow-xs border",
                                                message.role === "assistant"
                                                    ? "bg-primary/10 text-primary border-primary/10"
                                                    : "bg-muted text-muted-foreground border-border/50"
                                            )}
                                        >
                                            {message.role === "assistant" ? (
                                                <BotIcon className="size-4" />
                                            ) : (
                                                <UserIcon className="size-4" />
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1.5 max-w-[85%] relative group/bubble">
                                            <div
                                                className={cn(
                                                    "rounded-2xl px-4 py-3 text-base shadow-xs leading-relaxed overflow-hidden relative border",
                                                    message.role === "assistant"
                                                        ? "bg-card text-foreground rounded-tl-xs border-border/30 backdrop-blur-xs"
                                                        : "bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-tr-xs border-primary/20"
                                                )}
                                            >
                                                {/* Left Accent Bar for assistant message */}
                                                {message.role === "assistant" && (
                                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-600" />
                                                )}
                                                
                                                {message.role === "assistant" ? (
                                                    <div className="whitespace-pre-wrap prose dark:prose-invert max-w-none break-words leading-relaxed pl-1 text-[16px]">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                code({ node, inline, className, children, ...props }: any) {
                                                                    const match = /language-(\w+)/.exec(className || '');
                                                                    return !inline && match ? (
                                                                        <div className="relative my-3 rounded-lg overflow-hidden border border-border bg-zinc-950 shadow-md">
                                                                            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] font-mono text-zinc-400">
                                                                                <span>{match[1].toUpperCase()}</span>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="size-5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-foreground active:scale-90"
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                                                        toast.success("Đã sao chép mã nguồn!");
                                                                                    }}
                                                                                >
                                                                                    <CopyIcon className="size-3" />
                                                                                </Button>
                                                                            </div>
                                                                            <pre className="p-3 overflow-x-auto text-[13px] font-mono bg-transparent scrollbar-thin text-zinc-100">
                                                                                <code className={className} {...props}>
                                                                                    {children}
                                                                                </code>
                                                                            </pre>
                                                                        </div>
                                                                    ) : (
                                                                        <code className={cn("px-1.5 py-0.5 rounded bg-muted/60 font-mono text-sm font-semibold text-primary", className)} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                                                )}
                                            </div>
                                            <div
                                                className={cn(
                                                    "flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground px-1",
                                                    message.role === "user" && "justify-end"
                                                )}
                                            >
                                                <span>
                                                    {message.timestamp.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                                {message.role === "assistant" && message.id !== "intro" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-4 rounded-sm text-muted-foreground/60 hover:text-foreground hover:bg-muted active:scale-90 transition-all opacity-0 group-hover/bubble:opacity-100"
                                                        onClick={() => handleCopyMessage(message.content, message.id)}
                                                        title="Sao chép câu trả lời"
                                                    >
                                                        {copiedId === message.id ? (
                                                            <CheckIcon className="size-2.5 text-emerald-500" />
                                                        ) : (
                                                            <CopyIcon className="size-2.5" />
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* AI Loading State */}
                                {isLoading && messages[messages.length - 1]?.content === "" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 animate-pulse"
                                    >
                                        <div className="relative size-8 shrink-0">
                                            <div className="absolute -inset-1 rounded-full bg-primary/20 blur-xs animate-ping" />
                                            <div className="relative size-8 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                                                <BotIcon className="size-4 animate-bounce" />
                                            </div>
                                        </div>
                                        <div className="rounded-2xl rounded-tl-xs px-4 py-3 bg-card border border-border/30 shadow-xs max-w-[85%]">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Loader2Icon className="size-3.5 animate-spin text-primary" />
                                                <span className="text-xs font-semibold">Tutor đang phân tích bài làm...</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions Dynamically Positioned Above Input */}
            {quickActions && quickActions.length > 0 && !isLoading && messages.length > 1 && (
                <div className="px-4 py-2.5 flex flex-wrap gap-2 border-t border-border/30 bg-muted/10 shrink-0 max-h-32 overflow-y-auto scrollbar-none z-1 relative">
                    {quickActions.map((action, idx) => {
                        const isHint = action.mode === "HINT";
                        const isHintDisabled = isHint && !canAskNextHint;
                        return (
                            <button
                                key={idx}
                                disabled={isHintDisabled}
                                onClick={() => handleQuickAction(action)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all duration-200 cursor-pointer shadow-xs",
                                    isHintDisabled
                                        ? "bg-muted/50 text-muted-foreground/30 border-border/20 cursor-not-allowed opacity-50"
                                        : "bg-background text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30 border-border/60 active:scale-95"
                                )}
                                title={isHintDisabled ? "Bạn đã hết lượt xin gợi ý cho bài tập này!" : undefined}
                            >
                                <SparklesIcon className={cn("size-3", isHintDisabled ? "text-muted-foreground/30" : "text-amber-500")} />
                                <span>{action.label.startsWith("💡 ") || action.label.startsWith("📖 ") || action.label.startsWith("🛠️ ") || action.label.startsWith("📈 ") ? action.label.substring(2) : action.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Chat Input Container */}
            <div className="p-4 border-t border-border/40 bg-muted/30 z-1 shrink-0 relative">
                <div className="flex gap-2">
                    <Input
                        placeholder={
                            selectedMode === "HINT"
                                ? "Xin gợi ý hướng làm bài tập..."
                                : selectedMode === "DEBUG"
                                    ? "Hỏi cách sửa lỗi hoặc dò lỗi mã nguồn..."
                                    : "Đặt câu hỏi học tập cho AI Tutor..."
                        }
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        className="flex-1 bg-background shadow-inner text-xs md:text-sm rounded-xl h-10 border-border/60 focus:border-primary/50 transition-all"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground shadow active:scale-90 transition-all rounded-xl h-10 w-10 cursor-pointer"
                    >
                        <SendIcon className="size-4" />
                    </Button>
                </div>
                <p className="text-[9px] text-muted-foreground mt-2 text-center leading-normal">
                    AI trả lời mang tính gợi mở. Hãy tự thử thách tư duy giải thuật nhé!
                </p>
            </div>
        </div>
    );
}
