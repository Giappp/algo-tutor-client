"use client";

import { cn } from "@/lib/utils";
import type { Submission } from "@/lib/types/lesson";
import {
    CheckCircleIcon,
    XCircleIcon,
    AlertTriangleIcon,
    ZapIcon,
    BugIcon,
    Loader2 as Loader2Icon,
} from "lucide-react";

export type Verdict = Submission["status"];

interface VerdictConfig {
    label: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
    borderColor: string;
}

const VERDICT_CONFIG: Record<Verdict, VerdictConfig> = {
    PENDING: {
        label: "Evaluating...",
        icon: Loader2Icon,
        color: "text-zinc-400 animate-spin",
        bgColor: "bg-zinc-800/20 dark:bg-zinc-100/5",
        borderColor: "border-zinc-500/20",
    },
    ACCEPTED: {
        label: "Accepted",
        icon: CheckCircleIcon,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
    },
    WRONG_ANSWER: {
        label: "Wrong Answer",
        icon: XCircleIcon,
        color: "text-rose-500",
        bgColor: "bg-rose-500/10",
        borderColor: "border-rose-500/30",
    },
    RUNTIME_ERROR: {
        label: "Runtime Error",
        icon: BugIcon,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
    },
    TIME_LIMIT_EXCEEDED: {
        label: "Time Limit Exceeded",
        icon: AlertTriangleIcon,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/30",
    },
    COMPILATION_ERROR: {
        label: "Compilation Error",
        icon: ZapIcon,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
    },
};

interface VerdictBannerProps {
    verdict: Verdict;
    passed: number;
    total: number;
    totalTimeMs?: number;
    maxMemoryKb?: number;
    className?: string;
}

export function VerdictBanner({
    verdict,
    passed,
    total,
    totalTimeMs,
    maxMemoryKb,
    className,
}: VerdictBannerProps) {
    const config = VERDICT_CONFIG[verdict];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "rounded-lg border p-3 flex items-center justify-between",
                config.bgColor,
                config.borderColor,
                className
            )}
        >
            <div className="flex items-center gap-2.5">
                <Icon className={cn("size-5", config.color)} />
                <div>
                    <span className={cn("text-sm font-bold", config.color)}>
                        {config.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                        {passed}/{total} test cases passed
                    </span>
                </div>
            </div>
            {(totalTimeMs !== undefined || maxMemoryKb !== undefined) && (
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    {totalTimeMs !== undefined && (
                        <span className="font-mono">{totalTimeMs}ms</span>
                    )}
                    {maxMemoryKb !== undefined && (
                        <span className="font-mono">
                            {maxMemoryKb >= 1024
                                ? `${(maxMemoryKb / 1024).toFixed(1)}MB`
                                : `${maxMemoryKb}KB`}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export { VERDICT_CONFIG };
