"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatMessage, LessonContext } from "@/lib/types/lesson";
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
} from "lucide-react";

const STORAGE_KEY_PREFIX = "ai-tutor-chat-";

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

// buildSystemPrompt is reserved for future AI API integration

function buildContextIntro(context: LessonContext): string {
    const typeLabel = {
        THEORY: "Theory Lesson",
        QUIZ: "Quiz Lesson",
        CODING: "Coding Problem",
    }[context.lessonType];

    return `Hello! I'm your AI Tutor for **${context.lessonTitle}**.

We're in the **${context.roadmapName}** learning path, working through a ${typeLabel}.

I can help you with:
- Understanding the key concepts
- Breaking down problems step by step
- Debugging your code
- Explaining why quiz answers are correct
- Guiding you toward the solution without giving it away

What would you like help with today?`;
}

function generateMockResponse(
    userMessage: string,
    context: LessonContext,
    _history: ChatMessage[]
): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes("explain") || lower.includes("what is") || lower.includes("how does")) {
        if (context.lessonType === "CODING") {
            return `Great question! Let me break this down:\n\n**Understanding the Problem**\n\n1. **Read the problem statement carefully** — identify what the input and output should be.\n2. **Look at the examples** — they show expected behavior for specific cases.\n3. **Identify constraints** — these tell you about input size limits.\n\nFor this coding problem, I'd recommend:\n- First, make sure you understand what each test case expects\n- Think about edge cases (empty input, single element, duplicates)\n- Consider the time and space complexity requirements\n\nWould you like me to walk you through a specific part?`;
        }
        if (context.lessonType === "THEORY") {
            return `Let me explain this concept in a way that makes sense:\n\n**Key Concept Breakdown**\n\nThe idea behind "${context.lessonTitle}" is fundamental to how we structure and process data efficiently.\n\n**Core Principles:**\n1. Elements are stored in **contiguous memory** — this enables fast random access\n2. Each element has a **numeric index** starting from 0\n3. Accessing any element is **O(1)** — constant time, regardless of array size\n\n**Why it matters:**\nUnderstanding this lets you choose the right data structure for different problems. Arrays shine when you need fast lookups; other structures (like linked lists) excel at insertions.\n\nShall I elaborate on any part?`;
        }
        return `Let me explain this concept clearly:\n\n**Core Idea**\n\nThis lesson covers important fundamentals that build toward more advanced topics.\n\n**Key Takeaways:**\n- Understanding the underlying mechanism is crucial\n- Practice makes the concept intuitive\n- Connect this to what you've already learned\n\nWould you like me to dive deeper into any specific aspect?`;
    }

    if (lower.includes("hint") || lower.includes("stuck") || lower.includes("help")) {
        if (context.lessonType === "CODING") {
            return `Here's a hint to guide you:\n\n**Approach Hint**\n\nThink about what information you need to know at each step, and whether you can store that information to avoid recomputation.\n\n**Questions to ask yourself:**\n1. What am I looking for in this problem?\n2. Can I find it by checking each element once?\n3. Is there a way to remember what I've seen so far?\n\nThis is a classic pattern that appears in many variations. You're on the right track!\n\nNeed another hint or want to discuss the approach?`;
        }
        return `Here are some questions to guide your thinking:\n\n**Reflective Questions:**\n1. What is the core concept being demonstrated here?\n2. Can you think of a real-world analogy?\n3. How does this connect to what you learned previously?\n\nTake your time — understanding is more important than speed!`;
    }

    if (lower.includes("approach") || lower.includes("how to solve") || lower.includes("algorithm")) {
        return `Here's a strategic approach:\n\n**Problem-Solving Framework**\n\n**Step 1: Understand**\n- Restate the problem in your own words\n- Identify inputs, outputs, and constraints\n\n**Step 2: Plan**\n- Is this similar to any problem you've seen before?\n- What data structure would help?\n- What's the brute force approach? (Start there!)\n\n**Step 3: Optimize**\n- Can you trade space for time?\n- Can you eliminate unnecessary work?\n- Do you need multiple passes?\n\n**Step 4: Implement**\n- Write clean, readable code\n- Handle edge cases explicitly\n\n**Step 5: Verify**\n- Test with examples, including edge cases\n\nWould you like me to elaborate on any of these steps?`;
    }

    if (lower.includes("debug") || lower.includes("error") || lower.includes("wrong")) {
        return `Let's debug this together:\n\n**Debugging Checklist:**\n\n1. **Print your inputs** — make sure you're reading the data correctly\n2. **Check your indices** — off-by-one errors are the most common bug\n3. **Verify your logic** — walk through a simple example by hand\n4. **Check edge cases** — empty input, single element, duplicates\n\n**Common Pitfalls:**\n- Array indices starting at 0 (not 1!)\n- Forgetting to return the correct type\n- Modifying the wrong variable\n- Infinite loops (check your loop boundaries)\n\nShare your code or describe what's going wrong, and let's work through it!`;
    }

    if (lower.includes("answer") || lower.includes("solution") || lower.includes("correct")) {
        return `I understand you're looking for the answer, but let's work through it together instead!\n\n**Why discovering it yourself is better:**\n- You build stronger mental models\n- You remember the pattern for next time\n- Real learning happens through struggle\n\n**Let's try this approach:**\n1. Walk me through your current thinking\n2. Tell me what you've tried\n3. I'll nudge you in the right direction\n\nRemember: every expert was once a beginner who kept trying!`;
    }

    return `That's a thoughtful question! Let me help you work through this:\n\nBased on what you're asking, I think you might benefit from:\n- Reviewing the lesson content one more time\n- Trying a concrete example by hand\n- Breaking the problem into smaller parts\n\nCan you tell me more about what's confusing you? The more specific your question, the better I can help!`;
}

function QuickActionButton({
    icon: Icon,
    label,
    prompt,
    onClick,
}: {
    icon: React.ElementType;
    label: string;
    prompt: string;
    onClick: (prompt: string) => void;
}) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => onClick(prompt)}
            className="h-auto py-2 px-3 text-xs justify-start"
        >
            <Icon className="size-3.5 mr-2 shrink-0" />
            {label}
        </Button>
    );
}

export function AITutorPanel({ context }: { context: LessonContext }) {
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const stored = loadChatHistory(context.lessonSlug);
        if (stored.length > 0) return stored;
        return [
            {
                id: "intro",
                role: "assistant" as const,
                content: buildContextIntro(context),
                timestamp: new Date(),
            },
        ];
    });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Persist to localStorage
    useEffect(() => {
        saveChatHistory(context.lessonSlug, messages);
    }, [messages, context.lessonSlug]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;

            const userMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "user",
                content: text,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, userMsg]);
            setInput("");
            setIsLoading(true);

            // Simulate AI response delay
            await new Promise((resolve) => setTimeout(resolve, 1200));

            const responseText = generateMockResponse(text, context, messages);

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseText,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMsg]);
            setIsLoading(false);
        },
        [isLoading, context, messages]
    );

    const handleSend = () => sendMessage(input);

    const handleQuickAction = (prompt: string) => {
        setInput(prompt);
    };

    const handleClearChat = () => {
        const intro: ChatMessage = {
            id: "intro",
            role: "assistant",
            content: buildContextIntro(context),
            timestamp: new Date(),
        };
        setMessages([intro]);
        localStorage.removeItem(getStorageKey(context.lessonSlug));
    };

    const handleCopyMessage = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const quickActions = [
        {
            label: "Explain This",
            icon: LightbulbIcon,
            prompt: `Can you explain the key concepts in this ${context.lessonType.toLowerCase()} lesson?`,
        },
        {
            label: "Give Me a Hint",
            icon: ZapIcon,
            prompt: "I'm stuck. Can you give me a hint?",
        },
        {
            label: "Show Approach",
            icon: TrendingUpIcon,
            prompt: "What's the best approach to solve this problem?",
        },
        {
            label: "Help Me Debug",
            icon: MessageSquareIcon,
            prompt: "I have an error in my code. Can you help me debug it?",
        },
    ];

    const typeColors: Record<string, string> = {
        THEORY: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        QUIZ: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        CODING: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                        <SparklesIcon className="size-4 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">AI Tutor</h3>
                        <p className="text-xs text-muted-foreground">Context-aware helper</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Badge variant="secondary" className={cn("text-xs", typeColors[context.lessonType])}>
                        {context.lessonType}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={handleClearChat}
                        title="Clear chat"
                    >
                        <TrashIcon className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Context Banner */}
            <div className="px-4 py-2.5 border-b border-border/50 bg-muted/20">
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-foreground truncate">{context.lessonTitle}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{context.roadmapName}</span>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
                        >
                            <div
                                className={cn(
                                    "size-8 rounded-full flex items-center justify-center shrink-0",
                                    message.role === "assistant"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {message.role === "assistant" ? (
                                    <BotIcon className="size-4" />
                                ) : (
                                    <UserIcon className="size-4" />
                                )}
                            </div>
                            <div className="flex flex-col gap-1 max-w-[85%]">
                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-3 text-sm",
                                        message.role === "assistant"
                                            ? "bg-muted text-foreground rounded-tl-sm"
                                            : "bg-primary text-primary-foreground rounded-tr-sm"
                                    )}
                                >
                                    <div className="whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                        {message.content}
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        "flex items-center gap-1 text-[10px] text-muted-foreground px-1",
                                        message.role === "user" && "justify-end"
                                    )}
                                >
                                    <span>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                    {message.role === "assistant" && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-5"
                                            onClick={() => handleCopyMessage(message.content, message.id)}
                                        >
                                            {copiedId === message.id ? (
                                                <CheckIcon className="size-3" />
                                            ) : (
                                                <CopyIcon className="size-3" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <BotIcon className="size-4" />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2Icon className="size-4 animate-spin" />
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Quick Actions (only when few messages) */}
                {messages.length <= 2 && !isLoading && (
                    <div className="mt-6 space-y-3">
                        <p className="text-xs text-muted-foreground font-medium">Quick actions:</p>
                        <div className="grid grid-cols-2 gap-2">
                            {quickActions.map((action) => (
                                <QuickActionButton
                                    key={action.label}
                                    {...action}
                                    onClick={handleQuickAction}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-muted/30">
                <div className="flex gap-2">
                    <Input
                        placeholder="Ask the AI tutor..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                        className="flex-1"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="shrink-0"
                    >
                        <SendIcon className="size-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    AI responses are for guidance. Always verify your solutions.
                </p>
            </div>
        </div>
    );
}
