"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon, SparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
    label: string;
    intent?: string;
    mode: string;
    message: string;
    icon?: React.ElementType;
}

interface ChatInputProps {
    input: string;
    setInput: (v: string) => void;
    onSend: () => void;
    isLoading: boolean;
    selectedMode: string;
    quickActions: QuickAction[] | null;
    canAskNextHint: boolean;
    onQuickAction: (action: QuickAction) => void;
    hasMessages: boolean;
}

export function ChatInput({
    input,
    setInput,
    onSend,
    isLoading,
    selectedMode,
    quickActions,
    canAskNextHint,
    onQuickAction,
    hasMessages,
}: ChatInputProps) {
    const stripEmojiPrefix = (label: string) =>
        label.replace(/^[^\p{L}\p{N}]+/u, "").trim();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            onSend();
        }
    };

    const getPlaceholderText = () => {
        if (selectedMode === "HINT") return "Xin gợi ý hướng làm bài tập...";
        if (selectedMode === "DEBUG") return "Hỏi cách sửa lỗi hoặc dò lỗi mã nguồn...";
        return "Đặt câu hỏi học tập cho AI Tutor...";
    };

    return (
        <div className="flex flex-col shrink-0 z-1 relative">
            {quickActions && quickActions.length > 0 && !isLoading && hasMessages && (
                <div className="scrollbar-none flex max-h-32 shrink-0 flex-wrap gap-2 overflow-y-auto border-t border-border/30 bg-muted/10 px-4 py-2.5">
                    {quickActions.map((action, idx) => {
                        const ActionIcon = action.icon || SparklesIcon;
                        const isHint = action.mode === "HINT";
                        const isHintDisabled = isHint && !canAskNextHint;
                        const cleanLabel = stripEmojiPrefix(action.label);

                        return (
                            <button
                                key={idx}
                                disabled={isHintDisabled}
                                onClick={() => onQuickAction(action)}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    isHintDisabled
                                        ? "bg-muted/50 text-muted-foreground/30 border-border/20 cursor-not-allowed opacity-50"
                                        : "border-border/60 bg-background text-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary active:scale-95"
                                )}
                                title={isHintDisabled ? "Bạn đã hết lượt xin gợi ý cho bài tập này" : undefined}
                            >
                                <ActionIcon className={cn("size-3", isHintDisabled ? "text-muted-foreground/30" : "text-primary")} aria-hidden="true" />
                                <span>{cleanLabel}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            <div className="border-t border-border/40 bg-muted/25 p-4">
                <div className="flex gap-2">
                    <Input
                        placeholder={getPlaceholderText()}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="h-10 flex-1 rounded-lg border-border/60 bg-background text-sm shadow-inner transition-all focus:border-primary/50"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={onSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="size-10 shrink-0 rounded-lg shadow transition-all active:scale-90"
                    >
                        <SendIcon />
                    </Button>
                </div>
                <p className="mt-2 text-center text-xs leading-normal text-muted-foreground">
                    AI trả lời theo hướng gợi mở. Hãy tự kiểm chứng bằng cách chạy lại bài làm.
                </p>
            </div>
        </div>
    );
}
