"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklesIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
    lessonType: string;
    lessonTitle: string;
    roadmapName: string;
    onClearChat: () => void;
    canAskNextHint: boolean;
}

const LESSON_TYPE_COLORS: Record<string, string> = {
    THEORY: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    QUIZ: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    CODING: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
};

export function ChatHeader({
    lessonType,
    lessonTitle,
    roadmapName,
    onClearChat,
    canAskNextHint,
}: ChatHeaderProps) {
    return (
        <div className="flex flex-col shrink-0 z-1 relative">
            {/* Header Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary to-purple-600 opacity-60 blur-xs animate-pulse" />
                        <div className="relative size-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-md">
                            <SparklesIcon className="size-4 text-primary-foreground fill-primary-foreground/10" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                            AI Tutor
                        </h3>
                        <div className="flex items-center gap-1">
                            <span className="relative flex size-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500"></span>
                            </span>
                            <p className="text-xs font-medium text-muted-foreground">Trợ lý đang trực tuyến</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Badge
                        variant="secondary"
                        className={cn(
                            "text-xs font-bold tracking-wide uppercase px-2 py-0.5 shadow-xs rounded-md border",
                            LESSON_TYPE_COLORS[lessonType] || "bg-muted text-muted-foreground border-border/50"
                        )}
                    >
                        {lessonType}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all duration-200 cursor-pointer"
                        onClick={onClearChat}
                        title="Xóa cuộc trò chuyện và bắt đầu lại"
                    >
                        <TrashIcon className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Context Banner */}
            <div className="px-4 py-2 bg-muted/20 border-b border-border/30 flex items-center justify-between text-sm">
                <div className="flex flex-col gap-0.5 min-w-0 max-w-[80%]">
                    <span className="font-bold text-foreground truncate">{lessonTitle}</span>
                    <span className="text-xs text-muted-foreground truncate">{roadmapName}</span>
                </div>
                {lessonType === "CODING" && (
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-xs font-bold py-0.5 rounded px-1.5 shadow-2xs bg-background border",
                            canAskNextHint
                                ? "text-emerald-500 border-emerald-500/20"
                                : "text-amber-500 border-amber-500/20"
                        )}
                    >
                        {canAskNextHint ? "Gợi ý khả dụng" : "Đã hết gợi ý"}
                    </Badge>
                )}
            </div>
        </div>
    );
}
