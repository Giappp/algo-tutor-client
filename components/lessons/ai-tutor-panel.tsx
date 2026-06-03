"use client";

import { cn } from "@/lib/utils";
import type { LessonContext } from "@/lib/types/lesson";
import { ShieldCheckIcon } from "lucide-react";

import { ChatHeader } from "./ai-tutor/chat-header";
import { WorkspaceStatus } from "./ai-tutor/workspace-status";
import { WelcomeDashboard } from "./ai-tutor/welcome-dashboard";
import { ChatMessagesList } from "./ai-tutor/chat-messages-list";
import { ChatInput } from "./ai-tutor/chat-input";
import { useAITutor } from "@/hooks/use-ai-tutor"

export function AITutorPanel({ context }: { context: LessonContext }) {
    const {
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
    } = useAITutor(context);

    return (
        <section className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-muted/35 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(var(--foreground)_1px,transparent_1px)] [background-size:18px_18px]" />

            <div className="relative z-10 shrink-0 border-b border-border/50 bg-background/95 backdrop-blur-xl">
                <ChatHeader
                    lessonType={context.lessonType}
                    lessonTitle={context.lessonTitle}
                    roadmapName={context.roadmapName}
                    onClearChat={handleClearChat}
                    canAskNextHint={canAskNextHint}
                />

                <div className="flex flex-col gap-2 px-3 pb-3">
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/70 px-3 py-2 shadow-xs">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <ShieldCheckIcon className="size-3.5" aria-hidden="true" />
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-xs font-semibold text-foreground">
                                    Tutor gợi mở
                                </p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                    Hỏi dẫn dắt trước khi đưa đáp án
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsSocratic((prev) => !prev)}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95",
                                isSocratic ? "bg-primary" : "bg-muted-foreground/30"
                            )}
                            aria-pressed={isSocratic}
                            title={
                                isSocratic
                                    ? "Tắt chế độ gợi mở để AI trả lời trực tiếp hơn"
                                    : "Bật chế độ gợi mở để AI hướng dẫn từng bước"
                            }
                        >
                            <span
                                className={cn(
                                    "pointer-events-none inline-block size-5 translate-y-[1px] rounded-full bg-background shadow-md transition-transform",
                                    isSocratic ? "translate-x-5" : "translate-x-[1px]"
                                )}
                            />
                        </button>
                    </div>

                    <div className="flex gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/35 p-1 scrollbar-none">
                        {availableModes.map((mode) => {
                            const Icon = mode.icon;
                            const isActive = selectedMode === mode.id;
                            const isHintDisabled = mode.id === "HINT" && !canAskNextHint;

                            return (
                                <button
                                    key={mode.id}
                                    type="button"
                                    disabled={isHintDisabled}
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={cn(
                                        "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95",
                                        isActive
                                            ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                                            : isHintDisabled
                                                ? "cursor-not-allowed text-muted-foreground/40"
                                                : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                                    )}
                                    title={
                                        isHintDisabled
                                            ? "Bạn đã hết lượt xin gợi ý cho bài tập này"
                                            : mode.tooltip
                                    }
                                >
                                    <Icon
                                        className={cn(
                                            "size-3.5",
                                            isActive && "text-primary"
                                        )}
                                    />
                                    <span>{mode.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="relative z-10 shrink-0">
                <WorkspaceStatus
                    lessonType={context.lessonType}
                    workspace={workspace}
                    onDebugRequest={handleDebugRequest}
                />
            </div>

            <div className="relative z-0 flex min-h-0 flex-1 flex-col bg-muted/[0.18]">
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

            {isRateLimited && (
                <div className="relative z-10 shrink-0 border-y border-destructive/20 bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive">
                    <div className="flex items-start gap-2">
                        <span className="mt-1 inline-flex size-2 shrink-0 rounded-full bg-destructive" />

                        <span>
                            Bạn đang thao tác quá nhanh. Thử lại sau{" "}
                            <span className="font-mono">{rateLimitCountdown}</span> giây.
                        </span>
                    </div>
                </div>
            )}

            <div className="relative z-10 shrink-0 border-t border-border/50 bg-background/95 backdrop-blur-xl">
                <ChatInput
                    input={input}
                    setInput={setInput}
                    onSend={handleSend}
                    isLoading={isLoading || isRateLimited}
                    selectedMode={selectedMode}
                    quickActions={quickActionsList}
                    canAskNextHint={canAskNextHint}
                    onQuickAction={handleQuickAction}
                    hasMessages={hasRealMessages}
                />
            </div>
        </section>
    );
}
