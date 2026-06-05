"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { LucideIcon } from "lucide-react";
import {
    ArrowRightIcon,
    BookOpenIcon,
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
    XIcon,
    ZapIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    ChatMessage,
    RoadmapRecommendation,
    useGeneralAIChat,
} from "@/hooks/use-general-ai-chat";

interface QuickAction {
    label: string;
    icon: LucideIcon;
    prompt: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    {
        label: "Tư vấn lộ trình",
        icon: TrendingUpIcon,
        prompt: "Bạn hãy tư vấn giúp tôi lộ trình học cấu trúc dữ liệu và giải thuật từ con số 0.",
    },
    {
        label: "Giải thích thuật toán",
        icon: LightbulbIcon,
        prompt: "Giải thuật là gì và tại sao lập trình viên lại cần học giải thuật?",
    },
    {
        label: "Luyện phỏng vấn",
        icon: ZapIcon,
        prompt: "Cho tôi một vài câu hỏi phỏng vấn thuật toán thường gặp ở các công ty công nghệ lớn.",
    },
    {
        label: "Mẹo học tập",
        icon: MessageSquareIcon,
        prompt: "Làm thế nào để học thuật toán hiệu quả và không bị nản?",
    },
];

function normalizeText(content: string) {
    return content
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function normalizeAssistantContent(content: string) {
    const normalized = normalizeText(content);

    // Defensive cleanup only. Backend should still guarantee one final answer per assistant message.
    const repeatedGreetingBlocks = normalized
        .split(/\n(?=(?:Chào bạn|Xin chào)[!,]?\s)/g)
        .map((part) => part.trim())
        .filter(Boolean);

    if (repeatedGreetingBlocks.length <= 1) {
        return normalized;
    }

    return repeatedGreetingBlocks[repeatedGreetingBlocks.length - 1];
}

function isPoorDescription(description?: string | null) {
    if (!description) return true;

    const value = description.trim();

    return value.length < 12 || /^(\d+|test|demo|abc|123)+$/i.test(value);
}

function getRoadmapDescription(roadmap: RoadmapRecommendation) {
    if (isPoorDescription(roadmap.description)) {
        return "Lộ trình phù hợp với mục tiêu học tập hiện tại của bạn.";
    }

    return roadmap.description;
}

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        messages,
        input,
        setInput,
        isLoading,
        sendMessage,
        clearChat,
        handleCopy,
        rateLimitCountdown,
    } = useGeneralAIChat(isOpen);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, isLoading]);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleOpenChat = (event: Event) => {
            const customEvent = event as CustomEvent<{ prompt?: string }>;
            const prompt = customEvent.detail?.prompt;

            setIsOpen(true);

            if (prompt) {
                window.setTimeout(() => {
                    sendMessage(prompt);
                }, 150);
            }
        };

        window.addEventListener("open-ai-chat", handleOpenChat);

        return () => {
            window.removeEventListener("open-ai-chat", handleOpenChat);
        };
    }, [sendMessage]);

    const handleSend = () => {
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        sendMessage(trimmedInput);
    };

    const handleQuickAction = (prompt: string) => {
        if (isLoading) return;

        sendMessage(prompt);
    };

    const handleClearChat = () => {
        const confirmed = window.confirm("Bạn có chắc muốn xóa lịch sử trò chuyện?");
        if (!confirmed) return;

        clearChat();
    };

    const triggerCopy = async (content: string, id: string) => {
        await handleCopy(normalizeAssistantContent(content));

        setCopiedId(id);

        if (copyTimeoutRef.current) {
            clearTimeout(copyTimeoutRef.current);
        }

        copyTimeoutRef.current = setTimeout(() => {
            setCopiedId(null);
        }, 2000);
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end sm:bottom-6 sm:right-6">
            {isOpen && (
                <ChatPanel
                    messages={messages}
                    input={input}
                    copiedId={copiedId}
                    isLoading={isLoading}
                    scrollRef={scrollRef}
                    bottomRef={bottomRef}
                    onInputChange={setInput}
                    onSend={handleSend}
                    onCopy={triggerCopy}
                    onClearChat={handleClearChat}
                    onClose={() => setIsOpen(false)}
                    onQuickAction={handleQuickAction}
                    rateLimitCountdown={rateLimitCountdown}
                />
            )}

            <ChatFloatingButton
                isOpen={isOpen}
                onClick={() => setIsOpen((prev) => !prev)}
            />
        </div>
    );
}

interface ChatPanelProps {
    messages: ChatMessage[];
    input: string;
    copiedId: string | null;
    isLoading: boolean;
    scrollRef: React.RefObject<HTMLDivElement | null>;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    onInputChange: (value: string) => void;
    onSend: () => void;
    onCopy: (content: string, id: string) => void;
    onClearChat: () => void;
    onClose: () => void;
    onQuickAction: (prompt: string) => void;
    rateLimitCountdown: number | null;
}

function ChatPanel({
    messages,
    input,
    copiedId,
    isLoading,
    scrollRef,
    bottomRef,
    onInputChange,
    onSend,
    onCopy,
    onClearChat,
    onClose,
    onQuickAction,
    rateLimitCountdown,
}: ChatPanelProps) {
    const shouldShowQuickActions = messages.length <= 1 && !isLoading;

    return (
        <section
            role="dialog"
            aria-label="AI Assistant"
            className="mb-3 flex h-[min(560px,calc(100dvh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-border/70 bg-background shadow-[0_18px_60px_hsl(var(--foreground)/0.16)] backdrop-blur-md animate-in slide-in-from-bottom-3 duration-300 sm:w-[408px]"
        >
            <ChatHeader onClearChat={onClearChat} onClose={onClose} />

            <RateLimitBanner rateLimitCountdown={rateLimitCountdown} />

            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-muted/[0.16] p-4">
                <ChatMessages
                    messages={messages}
                    copiedId={copiedId}
                    isLoading={isLoading}
                    bottomRef={bottomRef}
                    onCopy={onCopy}
                />

                {shouldShowQuickActions && (
                    <QuickActions onSelect={onQuickAction} />
                )}
            </div>

            <ChatComposer
                input={input}
                isLoading={isLoading}
                onInputChange={onInputChange}
                onSend={onSend}
                rateLimitCountdown={rateLimitCountdown}
            />
        </section>
    );
}

function RateLimitBanner({ rateLimitCountdown }: { rateLimitCountdown: number | null }) {
    if (rateLimitCountdown === null || rateLimitCountdown <= 0) {
        return null;
    }

    return (
        <div className="flex shrink-0 items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive animate-in fade-in duration-200">
            <span className="inline-flex size-2 shrink-0 rounded-full bg-destructive" />
            <span>Bạn thao tác quá nhanh. Hãy thử lại sau {rateLimitCountdown}s.</span>
        </div>
    );
}

interface ChatHeaderProps {
    onClearChat: () => void;
    onClose: () => void;
}

function ChatHeader({ onClearChat, onClose }: ChatHeaderProps) {
    return (
        <header className="flex items-center justify-between border-b border-border/50 bg-background/95 px-4 py-3">
            <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary shadow-xs">
                    <BotIcon className="size-4" />
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
                    <div className="flex items-center gap-1">
                        <span className="inline-flex size-1.5 rounded-full bg-emerald-500" />
                        <p className="text-[10px] font-medium text-muted-foreground">
                            Sẵn sàng hỗ trợ học tập
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Xóa lịch sử trò chuyện"
                    title="Xóa lịch sử"
                    className="size-8 rounded-md text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95"
                    onClick={onClearChat}
                >
                    <TrashIcon className="size-4" />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Đóng AI Assistant"
                    title="Đóng"
                    className="size-8 rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
                    onClick={onClose}
                >
                    <XIcon className="size-4" />
                </Button>
            </div>
        </header>
    );
}

interface ChatMessagesProps {
    messages: ChatMessage[];
    copiedId: string | null;
    isLoading: boolean;
    bottomRef: React.RefObject<HTMLDivElement | null>;
    onCopy: (content: string, id: string) => void;
}

function ChatMessages({
    messages,
    copiedId,
    isLoading,
    bottomRef,
    onCopy,
}: ChatMessagesProps) {
    const lastMessage = messages[messages.length - 1];

    const shouldShowThinking =
        isLoading &&
        lastMessage?.role === "assistant" &&
        lastMessage.content.trim() === "";

    const isAssistantStreaming =
        isLoading &&
        lastMessage?.role === "assistant" &&
        lastMessage.content.trim() !== "";

    return (
        <div className="space-y-4 pb-2">
            {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                const isLastAndStreaming =
                    isLast &&
                    isAssistantStreaming &&
                    message.role === "assistant";

                return (
                    <ChatMessageBubble
                        key={message.id}
                        message={message}
                        copiedId={copiedId}
                        onCopy={onCopy}
                        isStreaming={isLastAndStreaming}
                    />
                );
            })}

            {shouldShowThinking && <ThinkingIndicator />}

            <div ref={bottomRef} />
        </div>
    );
}

interface ChatMessageBubbleProps {
    message: ChatMessage;
    copiedId: string | null;
    onCopy: (content: string, id: string) => void;
    isStreaming?: boolean;
}

const ChatMessageBubble = memo(function ChatMessageBubble({
    message,
    copiedId,
    onCopy,
    isStreaming,
}: ChatMessageBubbleProps) {
    const isAssistant = message.role === "assistant";
    const hasRoadmaps = isAssistant && Boolean(message.roadmaps?.length);
    const normalizedContent = isAssistant
        ? normalizeAssistantContent(message.content)
        : normalizeText(message.content);
    const canCopy = isAssistant && Boolean(normalizedContent);

    return (
        <article
            className={cn(
                "flex gap-2.5 animate-in fade-in duration-300",
                !isAssistant && "flex-row-reverse"
            )}
        >
            <MessageAvatar role={message.role} />

            <div
                className={cn(
                    "flex flex-col gap-1.5",
                    isAssistant ? "max-w-[88%]" : "max-w-[80%]"
                )}
            >
                {normalizedContent && (
                    <div
                        className={cn(
                            "overflow-hidden rounded-xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs",
                            isAssistant
                                ? "rounded-tl-sm border border-border/30 bg-background text-foreground"
                                : "rounded-tr-sm bg-primary text-primary-foreground"
                        )}
                    >
                        {isAssistant ? (
                            <MarkdownContent
                                content={normalizedContent}
                                isStreaming={isStreaming}
                            />
                        ) : (
                            <div className="whitespace-pre-wrap break-words">
                                {normalizedContent}
                            </div>
                        )}
                    </div>
                )}

                {hasRoadmaps && (
                    <RoadmapRecommendations roadmaps={message.roadmaps ?? []} />
                )}

                <MessageMeta
                    message={message}
                    copiedId={copiedId}
                    canCopy={canCopy}
                    onCopy={onCopy}
                />
            </div>
        </article>
    );
});

function MessageAvatar({ role }: { role: ChatMessage["role"] }) {
    const isAssistant = role === "assistant";

    return (
        <div
            className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md border text-xs shadow-sm",
                isAssistant
                    ? "border-primary/10 bg-primary/10 text-primary"
                    : "border-border/50 bg-muted text-muted-foreground"
            )}
        >
            {isAssistant ? (
                <BotIcon className="size-3.5" />
            ) : (
                <UserIcon className="size-3.5" />
            )}
        </div>
    );
}

function MarkdownContent({
    content,
    isStreaming,
}: {
    content: string;
    isStreaming?: boolean;
}) {
    const normalizedContent = useMemo(() => normalizeAssistantContent(content), [content]);

    if (!normalizedContent) {
        return null;
    }

    return (
        <div
            className={cn(
                "prose prose-sm max-w-none break-words leading-relaxed dark:prose-invert",
                "prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5",
                "prose-pre:my-2 prose-code:break-words",
                isStreaming &&
                "after:ml-0.5 after:inline-block after:h-4 after:w-1.5 after:animate-pulse after:rounded-sm after:bg-primary/70"
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => (
                        <p className="my-1.5 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="my-1.5 list-disc pl-4 last:mb-0">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-1.5 list-decimal pl-4 last:mb-0">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="my-0.5 pl-0.5">{children}</li>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline underline-offset-2"
                        >
                            {children}
                        </a>
                    ),
                    code: ({ className, children }) => (
                        <code
                            className={cn(
                                "rounded bg-background px-1.5 py-0.5 text-[12px]",
                                className
                            )}
                        >
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className="my-2 overflow-x-auto rounded-lg bg-background p-2.5 text-[12px] leading-relaxed">
                            {children}
                        </pre>
                    ),
                    table: ({ children }) => (
                        <div className="my-2 overflow-x-auto">
                            <table className="w-full border-collapse text-[11px]">
                                {children}
                            </table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="border border-border px-2 py-1 text-left font-semibold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border border-border px-2 py-1">
                            {children}
                        </td>
                    ),
                }}
            >
                {normalizedContent}
            </ReactMarkdown>
        </div>
    );
}

interface RoadmapRecommendationsProps {
    roadmaps: RoadmapRecommendation[];
}

function RoadmapRecommendations({ roadmaps }: RoadmapRecommendationsProps) {
    if (!roadmaps.length) {
        return null;
    }

    return (
        <div className="mt-2.5 space-y-2.5">
            <p className="flex items-center gap-1 px-1 text-[10px] font-semibold text-muted-foreground">
                <SparklesIcon className="size-3 text-primary" />
                Lộ trình đề xuất riêng cho bạn
            </p>

            <div className="flex flex-col gap-2">
                {roadmaps.map((roadmap) => (
                    <RoadmapAdvisoryCard key={roadmap.slug} roadmap={roadmap} />
                ))}
            </div>
        </div>
    );
}

interface MessageMetaProps {
    message: ChatMessage;
    copiedId: string | null;
    canCopy: boolean;
    onCopy: (content: string, id: string) => void;
}

function MessageMeta({ message, copiedId, canCopy, onCopy }: MessageMetaProps) {
    const isUser = message.role === "user";

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 px-1 text-[9px] font-medium text-muted-foreground",
                isUser && "justify-end"
            )}
        >
            <span>
                {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })}
            </span>

            {canCopy && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Sao chép câu trả lời"
                    title="Sao chép"
                    className="size-4 rounded text-muted-foreground/60 transition-all hover:bg-muted hover:text-foreground active:scale-90"
                    onClick={() => onCopy(message.content, message.id)}
                >
                    {copiedId === message.id ? (
                        <CheckIcon className="size-2.5 text-emerald-500" />
                    ) : (
                        <CopyIcon className="size-2.5" />
                    )}
                </Button>
            )}
        </div>
    );
}

function ThinkingIndicator() {
    return (
        <div className="flex gap-2.5 animate-in fade-in duration-200">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/10 bg-primary/10 text-primary">
                <BotIcon className="size-3.5" />
            </div>

            <div className="rounded-xl rounded-tl-sm border border-border/30 bg-background px-3.5 py-2.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2Icon className="size-3.5 animate-spin text-primary" />
                    <span className="text-[10px] font-semibold">
                        AI đang suy nghĩ...
                    </span>
                </div>
            </div>
        </div>
    );
}

interface QuickActionsProps {
    onSelect: (prompt: string) => void;
}

function QuickActions({ onSelect }: QuickActionsProps) {
    return (
        <div className="mt-6 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                <SparklesIcon className="size-3 fill-amber-500 text-amber-500" />
                Gợi ý chủ đề nhanh
            </p>

            <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                    <Button
                        key={action.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-auto justify-start rounded-lg border-border/60 px-2 py-1.5 text-left text-xs leading-normal transition-all duration-200 hover:bg-background hover:text-primary active:scale-95"
                        onClick={() => onSelect(action.prompt)}
                    >
                        <action.icon className="mr-1.5 size-3 shrink-0 text-muted-foreground" />
                        {action.label}
                    </Button>
                ))}
            </div>
        </div>
    );
}

interface ChatComposerProps {
    input: string;
    isLoading: boolean;
    onInputChange: (value: string) => void;
    onSend: () => void;
    rateLimitCountdown: number | null;
}

function ChatComposer({
    input,
    isLoading,
    onInputChange,
    onSend,
    rateLimitCountdown,
}: ChatComposerProps) {
    const isRateLimited = rateLimitCountdown !== null && rateLimitCountdown > 0;
    const isComposerDisabled = isLoading || isRateLimited;

    return (
        <footer className="relative z-10 shrink-0 border-t border-border/40 bg-background/95 p-3">
            <div className="flex gap-1.5">
                <Input
                    placeholder={isRateLimited ? "Vui lòng chờ đếm ngược..." : "Hỏi AI bất cứ điều gì..."}
                    value={input}
                    disabled={isComposerDisabled}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            onSend();
                        }
                    }}
                    className="h-9 flex-1 rounded-lg border-border/60 bg-muted/25 text-xs shadow-inner transition-all focus:border-primary/50"
                />

                <Button
                    type="button"
                    size="icon"
                    aria-label="Gửi tin nhắn"
                    disabled={!input.trim() || isComposerDisabled}
                    onClick={onSend}
                    className="size-9 shrink-0 cursor-pointer rounded-lg bg-primary text-primary-foreground shadow transition-all hover:bg-primary/95 active:scale-90"
                >
                    {isLoading ? (
                        <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                        <SendIcon className="size-3.5" />
                    )}
                </Button>
            </div>
        </footer>
    );
}

interface ChatFloatingButtonProps {
    isOpen: boolean;
    onClick: () => void;
}

function ChatFloatingButton({ isOpen, onClick }: ChatFloatingButtonProps) {
    return (
        <button
            type="button"
            aria-label={isOpen ? "Đóng AI Assistant" : "Mở AI Assistant"}
            onClick={onClick}
            className={cn(
                "group relative flex size-14 cursor-pointer items-center justify-center rounded-xl border border-primary/25 bg-primary text-primary-foreground shadow-[0_12px_36px_hsl(var(--primary)/0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/95 active:scale-95",
                isOpen &&
                "rotate-90 border-destructive/25 bg-destructive text-destructive-foreground shadow-[0_12px_36px_hsl(var(--destructive)/0.22)] hover:bg-destructive/90"
            )}
        >
            <span className="relative z-10 flex items-center justify-center">
                {isOpen ? (
                    <XIcon className="size-6 transition-transform duration-300" />
                ) : (
                    <MessageSquareIcon className="size-6" />
                )}
            </span>
        </button>
    );
}

const RoadmapAdvisoryCard = memo(function RoadmapAdvisoryCard({
    roadmap,
}: {
    roadmap: RoadmapRecommendation;
}) {
    const levelColors: Record<string, string> = {
        BEGINNER: "border-blue-500/20 bg-blue-500/10 text-blue-500",
        INTERMEDIATE: "border-amber-500/20 bg-amber-500/10 text-amber-500",
        ADVANCED: "border-red-500/20 bg-red-500/10 text-red-500",
    };

    const description = getRoadmapDescription(roadmap);

    return (
        <div className="group relative flex flex-col gap-2 overflow-hidden rounded-lg border border-border/50 bg-background p-3 shadow-xs transition-all duration-300 animate-in fade-in hover:border-primary/30 hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
                <h4 className="line-clamp-1 text-xs font-bold text-foreground transition-colors group-hover:text-primary">
                    {roadmap.name || "Lộ trình học tập"}
                </h4>

                <Badge
                    variant="outline"
                    className={cn(
                        "shrink-0 rounded border px-1 py-0.5 text-[8px] font-bold uppercase",
                        levelColors[roadmap.level] ??
                        "border-border/30 bg-muted text-muted-foreground"
                    )}
                >
                    {roadmap.level || "TỔNG HỢP"}
                </Badge>
            </div>

            <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {description}
            </p>

            <div className="flex items-center justify-between border-t border-border/30 pt-2 text-xs text-muted-foreground">
                <div className="flex min-w-0 items-center gap-1">
                    <BookOpenIcon className="size-3 shrink-0 text-primary" />
                    <span className="truncate">
                        {roadmap.lessonCount} bài ({roadmap.topicCount} chủ đề)
                    </span>
                </div>

                {roadmap.isPremium && (
                    <Badge className="origin-right scale-90 shrink-0 rounded bg-amber-500 px-1 text-[7px] font-extrabold text-white hover:bg-amber-600">
                        PRO
                    </Badge>
                )}
            </div>

            <Link href={`/roadmaps/${roadmap.slug}`} className="block w-full">
                <Button className="flex h-7 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-primary text-[9px] font-bold text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/95 active:scale-95">
                    <span>Học ngay</span>
                    <ArrowRightIcon className="size-2.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
            </Link>
        </div>
    );
});
