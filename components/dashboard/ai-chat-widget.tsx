"use client";

import { memo, useEffect, useRef, useState } from "react";
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
        const handleOpenChat = (e: Event) => {
            const customEvent = e as CustomEvent<{ prompt?: string }>;
            setIsOpen(true);
            const prompt = customEvent.detail?.prompt;
            if (prompt) {
                setTimeout(() => {
                    sendMessage(prompt);
                }, 150);
            }
        };
        window.addEventListener("open-ai-chat", handleOpenChat);
        return () => window.removeEventListener("open-ai-chat", handleOpenChat);
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
        await handleCopy(content);

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
}: ChatPanelProps) {
    const shouldShowQuickActions = messages.length <= 1 && !isLoading;

    return (
        <section
            role="dialog"
            aria-label="AI Assistant"
            className="mb-4 flex h-[min(540px,calc(100vh-7rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 sm:w-[380px]"
        >
            <ChatHeader onClearChat={onClearChat} onClose={onClose} />

            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-background/40 p-4">
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
            />
        </section>
    );
}

interface ChatHeaderProps {
    onClearChat: () => void;
    onClose: () => void;
}

function ChatHeader({ onClearChat, onClose }: ChatHeaderProps) {
    return (
        <header className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2.5">
                <div className="relative">
                    <div className="absolute -inset-0.5 animate-pulse rounded-full bg-gradient-to-br from-primary to-indigo-500 opacity-50 blur-xs" />
                    <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 shadow-md">
                        <SparklesIcon className="size-4 text-primary-foreground" />
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-foreground">AI Assistant</h3>
                    <div className="flex items-center gap-1">
                        <span className="relative flex size-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                        </span>
                        <p className="text-[10px] font-medium text-muted-foreground">
                            Hỗ trợ học tập 24/7
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
                    className="size-8 rounded-lg text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95"
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
                    className="size-8 rounded-lg text-muted-foreground transition-all hover:text-foreground active:scale-95"
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
        isLoading && lastMessage?.role === "assistant" && lastMessage.content === "";

    return (
        <div className="space-y-4 pb-2">
            {messages.map((message) => (
                <ChatMessageBubble
                    key={message.id}
                    message={message}
                    copiedId={copiedId}
                    onCopy={onCopy}
                />
            ))}

            {shouldShowThinking && <ThinkingIndicator />}

            {isLoading && !shouldShowThinking && (
                <p className="px-1 text-[10px] font-medium text-muted-foreground">
                    AI đang trả lời...
                </p>
            )}

            <div ref={bottomRef} />
        </div>
    );
}

interface ChatMessageBubbleProps {
    message: ChatMessage;
    copiedId: string | null;
    onCopy: (content: string, id: string) => void;
}

const ChatMessageBubble = memo(function ChatMessageBubble({
    message,
    copiedId,
    onCopy,
}: ChatMessageBubbleProps) {
    const isAssistant = message.role === "assistant";
    const hasRoadmaps = isAssistant && Boolean(message.roadmaps?.length);
    const canCopy = isAssistant && Boolean(message.content.trim());

    return (
        <article
            className={cn(
                "flex gap-2.5 animate-in fade-in duration-300",
                !isAssistant && "flex-row-reverse"
            )}
        >
            <MessageAvatar role={message.role} />

            <div className="flex max-w-[80%] flex-col gap-1.5">
                <div
                    className={cn(
                        "overflow-hidden rounded-2xl px-3.5 py-2.5 text-base leading-relaxed shadow-xs",
                        isAssistant
                            ? "rounded-tl-sm border border-border/20 bg-muted text-foreground"
                            : "rounded-tr-sm bg-primary text-primary-foreground"
                    )}
                >
                    {isAssistant ? (
                        <MarkdownContent content={message.content} />
                    ) : (
                        <div className="whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                    )}
                </div>

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
                "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs shadow-sm",
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

function MarkdownContent({ content }: { content: string }) {
    return (
        <div className="prose max-w-none whitespace-pre-wrap break-words leading-relaxed dark:prose-invert text-[16px]">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="mb-1 last:mb-0">{children}</li>
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
                                "rounded bg-background px-1.5 py-0.5 text-[13px]",
                                className
                            )}
                        >
                            {children}
                        </code>
                    ),
                    pre: ({ children }) => (
                        <pre className="my-2 overflow-x-auto rounded-lg bg-background p-2.5 text-[13px]">
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
                {content}
            </ReactMarkdown>
        </div>
    );
}

interface RoadmapRecommendationsProps {
    roadmaps: RoadmapRecommendation[];
}

function RoadmapRecommendations({ roadmaps }: RoadmapRecommendationsProps) {
    return (
        <div className="mt-2.5 space-y-2.5">
            <p className="flex items-center gap-1 px-1 text-[10px] font-bold text-muted-foreground">
                <SparklesIcon className="size-3 animate-pulse fill-purple-500 text-purple-500" />
                Lộ trình đề xuất riêng cho bạn:
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
        <div className="flex gap-2.5 animate-pulse">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-primary">
                <BotIcon className="size-3.5 animate-bounce" />
            </div>

            <div className="rounded-2xl rounded-tl-sm border border-border/20 bg-muted px-3.5 py-2.5 shadow-xs">
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
            <p className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                <SparklesIcon className="size-3 fill-amber-500 text-amber-500" />
                Gợi ý chủ đề nhanh:
            </p>

            <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                    <Button
                        key={action.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-auto justify-start rounded-xl border-border/60 px-2 py-1.5 text-left text-[10px] leading-normal transition-all duration-200 hover:bg-muted/80 hover:text-primary active:scale-95"
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
}

function ChatComposer({
    input,
    isLoading,
    onInputChange,
    onSend,
}: ChatComposerProps) {
    return (
        <footer className="relative z-10 shrink-0 border-t border-border/40 bg-muted/20 p-3">
            <div className="flex gap-1.5">
                <Input
                    placeholder="Hỏi AI bất cứ điều gì..."
                    value={input}
                    disabled={isLoading}
                    onChange={(event) => onInputChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            onSend();
                        }
                    }}
                    className="h-9 flex-1 rounded-xl border-border/60 bg-background text-xs shadow-inner transition-all focus:border-primary/50"
                />

                <Button
                    type="button"
                    size="icon"
                    aria-label="Gửi tin nhắn"
                    disabled={!input.trim() || isLoading}
                    onClick={onSend}
                    className="size-9 shrink-0 cursor-pointer rounded-xl bg-primary text-primary-foreground shadow transition-all hover:bg-primary/95 active:scale-90"
                >
                    <SendIcon className="size-3.5" />
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
                "group relative flex size-14 cursor-pointer items-center justify-center rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/20 transition-all duration-300 hover:scale-105 hover:from-purple-700 hover:to-indigo-700 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-95",
                isOpen &&
                "rotate-90 border-red-500/30 from-red-500 to-rose-500 shadow-red-500/20 hover:bg-destructive/90"
            )}
        >
            {!isOpen && (
                <span className="absolute -inset-0.5 animate-ping rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-40 blur-md duration-1000 group-hover:opacity-75" />
            )}

            <span className="relative z-10 flex items-center justify-center">
                {isOpen ? (
                    <XIcon className="size-6 transition-transform duration-300" />
                ) : (
                    <SparklesIcon className="size-6 animate-pulse fill-current text-white" />
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

    return (
        <div className="group relative flex flex-col gap-1.5 overflow-hidden rounded-xl border border-border/50 bg-background/50 p-3 shadow-xs backdrop-blur-xs transition-all duration-300 animate-in fade-in hover:border-primary/30 hover:bg-background/80 hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
                <h4 className="line-clamp-1 text-[11px] font-bold text-foreground transition-colors group-hover:text-primary">
                    {roadmap.name}
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

            <p className="line-clamp-2 text-[10px] leading-relaxed text-muted-foreground">
                {roadmap.description}
            </p>

            <div className="mt-0.5 flex items-center justify-between border-t border-border/30 pt-1.5 text-[9px] text-muted-foreground">
                <div className="flex items-center gap-1">
                    <BookOpenIcon className="size-3 text-primary" />
                    <span>
                        {roadmap.lessonCount} bài ({roadmap.topicCount} chủ đề)
                    </span>
                </div>

                {roadmap.isPremium && (
                    <Badge className="origin-right scale-90 shrink-0 rounded bg-amber-500 px-1 text-[7px] font-extrabold text-white hover:bg-amber-600">
                        PRO
                    </Badge>
                )}
            </div>

            <Link href={`/roadmaps/${roadmap.slug}`} className="mt-1 block w-full">
                <Button className="flex h-7 w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-primary text-[9px] font-bold text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/95 active:scale-95">
                    <span>Học ngay</span>
                    <ArrowRightIcon className="size-2.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
            </Link>
        </div>
    );
});