"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types/lesson";
import { toast } from "sonner";
import {
    BotIcon,
    UserIcon,
    CopyIcon,
    CheckIcon,
    Loader2Icon,
} from "lucide-react";

// Pre-processor to fix math formulas ($O(n)$) and clean excessive whitespace or double newlines (\n\n)
const formatMathAndSpace = (content: string) => {
    if (!content) return "";

    // 1. Clean double-escaped newlines (\\n) and raw slash-n (/n)
    let cleaned = content
        .replace(/\/n/g, "\n")
        .replace(/\\n/g, "\n")
        // Collapse 3 or more consecutive newlines down to 2 to prevent massive gaps
        .replace(/\n{3,}/g, "\n\n");

    // 2. Convert double dollar blocks $$formula$$ to a custom Markdown code block with language "math"
    cleaned = cleaned.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
        return `\n\`\`\`math\n${math.trim()}\n\`\`\`\n`;
    });

    // 3. Convert single dollar inline math $formula$ to inline code `formula`
    cleaned = cleaned.replace(/\$([^$]+?)\$/g, (_, math) => {
        return `\`${math.trim()}\``;
    });

    return cleaned;
};

interface ChatMessagesListProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export const ChatMessagesList = React.forwardRef<HTMLDivElement, ChatMessagesListProps>(
    ({ messages, isLoading }, ref) => {
        const [copiedId, setCopiedId] = useState<string | null>(null);

        const handleCopyMessage = (content: string, id: string) => {
            navigator.clipboard.writeText(content);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
            toast.success("Đã sao chép câu trả lời!");
        };

        return (
            <div
                ref={ref}
                className="flex-1 overflow-y-auto p-4"
            >
                <div className="flex flex-col gap-4 pb-4">
                    <AnimatePresence initial={false}>
                        {messages.map((message, index) => {
                            const isLast = index === messages.length - 1;
                            const isLastAndStreaming = isLast && isLoading && message.role === "assistant" && message.content !== "";

                            return (
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
                                            "flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs shadow-xs",
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
                                                "rounded-xl px-3.5 py-2.5 text-sm shadow-xs leading-relaxed overflow-hidden relative border",
                                                message.role === "assistant"
                                                    ? "bg-background text-foreground rounded-tl-xs border-border/30"
                                                    : "border-primary/20 bg-primary text-primary-foreground rounded-tr-xs"
                                            )}
                                        >
                                            {message.role === "assistant" && (
                                                <div className="absolute bottom-0 left-0 top-0 w-1 bg-primary/65" />
                                            )}

                                            {message.role === "assistant" ? (
                                                <div className={cn(
                                                    "prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed pl-1 text-sm",
                                                    isLastAndStreaming && "is-streaming"
                                                )}>
                                                    <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const isMath = match && match[1] === "math";

                                                            return !inline && match ? (
                                                                <div className={cn(
                                                                    "relative my-3 rounded-lg overflow-hidden border shadow-xs",
                                                                    isMath 
                                                                        ? "border-primary/20 bg-primary/5"
                                                                        : "border-border bg-zinc-950 shadow-md"
                                                                )}>
                                                                    <div className={cn(
                                                                        "flex items-center justify-between px-3 py-1.5 text-xs font-mono",
                                                                        isMath
                                                                            ? "bg-primary/10 border-b border-primary/20 text-primary font-semibold"
                                                                            : "bg-zinc-900 border-b border-zinc-800 text-zinc-400"
                                                                    )}>
                                                                        <span>{isMath ? "Công thức toán học" : match[1].toUpperCase()}</span>
                                                                        {!isMath && (
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
                                                                        )}
                                                                    </div>
                                                                    <pre className={cn(
                                                                        "p-3 overflow-x-auto text-xs font-mono bg-transparent scrollbar-thin",
                                                                        isMath ? "text-center text-sm font-semibold py-4 text-foreground" : "text-zinc-100"
                                                                    )}>
                                                                        <code className={className} {...props}>
                                                                            {children}
                                                                        </code>
                                                                    </pre>
                                                                </div>
                                                            ) : (
                                                                <code className={cn("px-1.5 py-0.5 rounded bg-muted/60 font-mono text-xs font-semibold text-primary", className)} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {formatMathAndSpace(message.content)}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap break-words text-sm">
                                                {formatMathAndSpace(message.content)}
                                            </div>
                                        )}
                                    </div>
                                    <div
                                        className={cn(
                                            "flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-1",
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
                            );
                        })}

                        {isLoading && messages[messages.length - 1]?.content === "" && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3"
                            >
                                <div className="relative size-8 shrink-0">
                                    <div className="relative flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                                        <BotIcon className="size-4" />
                                    </div>
                                </div>
                                <div className="max-w-[85%] rounded-xl rounded-tl-xs border border-border/30 bg-background px-3.5 py-2.5 shadow-xs">
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
        );
    }
);

ChatMessagesList.displayName = "ChatMessagesList";
