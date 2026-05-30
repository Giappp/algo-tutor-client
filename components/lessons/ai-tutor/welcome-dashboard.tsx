"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    GraduationCapIcon,
    SparklesIcon,
    InfoIcon
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
    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 scrollbar-thin">
            {/* Glowing Welcome Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 p-4 shadow-sm"
            >
                <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />
                <div className="flex gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                        <GraduationCapIcon className="size-5 text-primary-foreground" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h4 className="font-bold text-sm text-foreground">AlgoTutor AI Co-pilot</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Xin chào! Mình là trợ lý học tập cá nhân của bạn cho bài học <strong className="text-foreground">{lessonTitle}</strong>.
                            Mình được thiết kế để giảng giải lý thuyết, gợi ý giải thuật và cùng bạn dò lỗi, giúp bạn phát triển tư duy lập trình tối đa!
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Main Action Grid */}
            <div className="flex flex-col gap-3">
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
                    ⚡ Bạn muốn trợ lý hỗ trợ gì ngay?
                </h5>

                <div className="grid grid-cols-1 gap-2.5">
                    {quickActions.map((action, idx) => {
                        const ActionIcon = action.icon || SparklesIcon;
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
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                                disabled={isHintDisabled}
                                onClick={() => onQuickAction(action)}
                                className={cn(
                                    "group text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden flex items-start gap-3 shadow-xs cursor-pointer",
                                    isHintDisabled
                                        ? "bg-muted/40 text-muted-foreground/30 border-border/20 cursor-not-allowed opacity-50"
                                        : "bg-card hover:bg-muted/40 hover:border-primary/30 border-border/60 hover:shadow-xs active:scale-[0.99]"
                                )}
                            >
                                <div className={cn(
                                    "size-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                                    isHintDisabled
                                        ? "bg-muted border-border/20 text-muted-foreground/20"
                                        : "bg-primary/5 group-hover:bg-primary/10 border-primary/10 text-primary"
                                )}>
                                    <ActionIcon className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                                            {cleanLabel}
                                        </span>
                                        {isHint && (
                                            <Badge variant="outline" className={cn("text-[10px] font-extrabold py-0 px-1 rounded-sm uppercase tracking-wide", canAskNextHint ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5")}>
                                                {canAskNextHint ? "Gợi ý khả dụng" : "Đã hết lượt"}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
                                        {action.message}
                                    </p>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Socratic Mode Note */}
            <div className="mt-auto p-3 rounded-xl border border-border/40 bg-muted/10 flex gap-2 items-start text-xs text-muted-foreground leading-relaxed">
                <InfoIcon className="size-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                    <strong className="text-foreground">Chế độ Gợi mở (Socratic) đang BẬT:</strong> AI Tutor sẽ gợi mở hướng giải và chỉ ra lỗi sai thay vì trực tiếp cho code giải, giúp bạn phát triển tư duy thuật toán vững chắc.
                </div>
            </div>
        </div>
    );
}
