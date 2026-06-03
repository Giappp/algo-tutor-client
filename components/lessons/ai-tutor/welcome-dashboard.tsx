"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    GraduationCapIcon,
    SparklesIcon,
    InfoIcon,
    ArrowUpRightIcon,
} from "lucide-react";

interface QuickAction {
    label: string;
    intent?: string;
    mode: string;
    message: string;
    icon?: React.ElementType;
}

interface WelcomeDashboardProps {
    lessonTitle: string;
    canAskNextHint: boolean;
    quickActions: QuickAction[];
    onQuickAction: (action: QuickAction) => void;
}

export function WelcomeDashboard({
    lessonTitle,
    canAskNextHint,
    quickActions,
    onQuickAction,
}: WelcomeDashboardProps) {
    const stripEmojiPrefix = (label: string) =>
        label.replace(/^[^\p{L}\p{N}]+/u, "").trim();

    return (
        <div className="scrollbar-thin flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-lg border border-border/60 bg-card/80 p-4 shadow-xs"
            >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary/30" />
                <div className="flex gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                        <GraduationCapIcon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                        <h4 className="text-sm font-semibold text-foreground">AlgoTutor AI co-pilot</h4>
                        <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                            Xin chào! Mình là trợ lý học tập cá nhân của bạn cho bài học <strong className="text-foreground">{lessonTitle}</strong>.
                            Mình sẽ giảng giải lý thuyết, gợi ý giải thuật và cùng bạn dò lỗi theo từng bước.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="flex flex-col gap-3">
                <div className="flex items-end justify-between gap-3 px-1">
                    <div>
                        <h5 className="text-xs font-semibold text-foreground">
                            Bắt đầu bằng một hướng hỗ trợ
                        </h5>
                        <p className="text-[11px] text-muted-foreground">
                            Chọn điều bạn cần ngay lúc này.
                        </p>
                    </div>
                    <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[11px] font-medium">
                        {quickActions.length} lựa chọn
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-2">
                    {quickActions.map((action, idx) => {
                        const ActionIcon = action.icon || SparklesIcon;
                        const isHint = action.mode === "HINT";
                        const isHintDisabled = isHint && !canAskNextHint;
                        const cleanLabel = stripEmojiPrefix(action.label);

                        return (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                disabled={isHintDisabled}
                                onClick={() => onQuickAction(action)}
                                className={cn(
                                    "group relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-lg border p-3 text-left shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    isHintDisabled
                                        ? "bg-muted/40 text-muted-foreground/30 border-border/20 cursor-not-allowed opacity-50"
                                        : "border-border/60 bg-card/85 hover:border-primary/30 hover:bg-muted/35 active:scale-[0.99]"
                                )}
                            >
                                <div className={cn(
                                    "flex size-8 shrink-0 items-center justify-center rounded-md border transition-colors",
                                    isHintDisabled
                                        ? "bg-muted border-border/20 text-muted-foreground/20"
                                        : "bg-primary/5 group-hover:bg-primary/10 border-primary/10 text-primary"
                                )}>
                                    <ActionIcon className="size-4" aria-hidden="true" />
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-semibold text-foreground transition-colors group-hover:text-primary">
                                            {cleanLabel}
                                        </span>
                                        {isHint && (
                                            <Badge variant="outline" className={cn("rounded-sm px-1 py-0 text-[10px] font-semibold", canAskNextHint ? "border-primary/25 bg-primary/5 text-primary" : "border-border/60 bg-muted text-muted-foreground")}>
                                                {canAskNextHint ? "Gợi ý khả dụng" : "Đã hết lượt"}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                                        {action.message}
                                    </p>
                                </div>
                                <ArrowUpRightIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary" aria-hidden="true" />
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-auto flex items-start gap-2 rounded-lg border border-border/50 bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
                <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                    <strong className="text-foreground">Tutor gợi mở đang bật:</strong> AI sẽ ưu tiên câu hỏi dẫn dắt, chỉ ra điểm sai và giữ lại phần tự suy luận cho bạn.
                </div>
            </div>
        </div>
    );
}
