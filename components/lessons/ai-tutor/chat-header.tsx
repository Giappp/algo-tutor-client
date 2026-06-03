"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BotIcon, CircleIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
    lessonType: string;
    lessonTitle: string;
    roadmapName: string;
    onClearChat: () => void;
    canAskNextHint: boolean;
}

const LESSON_TYPE_LABELS: Record<string, string> = {
    THEORY: "Lý thuyết",
    QUIZ: "Trắc nghiệm",
    CODING: "Coding",
};

export function ChatHeader({
    lessonType,
    lessonTitle,
    roadmapName,
    onClearChat,
    canAskNextHint,
}: ChatHeaderProps) {
    return (
        <div className="relative z-1 flex shrink-0 flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur-md">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-muted/45 text-foreground shadow-xs">
                        <BotIcon data-icon="inline-start" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                            AI Tutor
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CircleIcon className="fill-primary text-primary" />
                            <span className="truncate">Sẵn sàng gợi mở theo bài học</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Badge
                        variant="secondary"
                        className="rounded-md border border-border/70 px-2 py-0.5 text-xs font-semibold"
                    >
                        {LESSON_TYPE_LABELS[lessonType] || lessonType}
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-95"
                        onClick={onClearChat}
                        title="Xóa cuộc trò chuyện và bắt đầu lại"
                    >
                        <TrashIcon />
                    </Button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-border/30 bg-muted/20 px-4 py-2.5 text-sm">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-semibold text-foreground">{lessonTitle}</span>
                    <span className="text-xs text-muted-foreground truncate">{roadmapName}</span>
                </div>
                {lessonType === "CODING" && (
                    <Badge
                        variant="outline"
                        className={cn(
                            "shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold",
                            canAskNextHint
                                ? "border-primary/25 bg-primary/5 text-primary"
                                : "border-border/70 bg-muted/60 text-muted-foreground"
                        )}
                    >
                        {canAskNextHint ? "Gợi ý khả dụng" : "Đã hết gợi ý"}
                    </Badge>
                )}
            </div>
        </div>
    );
}
