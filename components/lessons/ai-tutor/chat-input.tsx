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
            {/* Quick Actions Dynamically Positioned Above Input */}
            {quickActions && quickActions.length > 0 && !isLoading && hasMessages && (
                <div className="px-4 py-2.5 flex flex-wrap gap-2 border-t border-border/30 bg-muted/10 shrink-0 max-h-32 overflow-y-auto scrollbar-none">
                    {quickActions.map((action, idx) => {
                        const isHint = action.mode === "HINT";
                        const isHintDisabled = isHint && !canAskNextHint;

                        // Clean up emoji prefix from label if present
                        const cleanLabel = action.label.startsWith("💡 ") || 
                                           action.label.startsWith("📖 ") || 
                                           action.label.startsWith("🛠️ ") || 
                                           action.label.startsWith("📝 ") || 
                                           action.label.startsWith("⚡ ") || 
                                           action.label.startsWith("🎯 ") || 
                                           action.label.startsWith("❓ ") || 
                                           action.label.startsWith("📈 ") || 
                                           action.label.startsWith("🌍 ")
                                           ? action.label.substring(2)
                                           : action.label;

                        return (
                            <button
                                key={idx}
                                disabled={isHintDisabled}
                                onClick={() => onQuickAction(action)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shadow-xs",
                                    isHintDisabled
                                        ? "bg-muted/50 text-muted-foreground/30 border-border/20 cursor-not-allowed opacity-50"
                                        : "bg-background text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/30 border-border/60 active:scale-95"
                                )}
                                title={isHintDisabled ? "Bạn đã hết lượt xin gợi ý cho bài tập này!" : undefined}
                            >
                                <SparklesIcon className={cn("size-3", isHintDisabled ? "text-muted-foreground/30" : "text-amber-500")} />
                                <span>{cleanLabel}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-border/40 bg-muted/30">
                <div className="flex gap-2">
                    <Input
                        placeholder={getPlaceholderText()}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-background shadow-inner text-sm rounded-xl h-10 border-border/60 focus:border-primary/50 transition-all"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={onSend}
                        disabled={!input.trim() || isLoading}
                        size="icon"
                        className="shrink-0 bg-primary hover:bg-primary/95 text-primary-foreground shadow active:scale-90 transition-all rounded-xl h-10 w-10 cursor-pointer"
                    >
                        <SendIcon className="size-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center leading-normal">
                    AI trả lời mang tính gợi mở. Hãy tự thử thách tư duy giải thuật nhé!
                </p>
            </div>
        </div>
    );
}
