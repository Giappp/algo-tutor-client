"use client";

import { Button } from "@/components/ui/button";
import {
    JudgeResultsPanel,
    type JudgeResult,
} from "@/components/learn/judge";
import {
    CheckCircleIcon,
    Loader2Icon,
    PlayIcon,
    SendIcon,
    TerminalIcon,
} from "lucide-react";

interface OutputPanelProps {
    judgeResult: JudgeResult | null;
    isSolved: boolean;
    isRunning: boolean;
    isSubmitting: boolean;
    onRun: () => void;
    onSubmit: () => void;
}

export function OutputPanel({
    judgeResult,
    isSolved,
    isRunning,
    isSubmitting,
    onRun,
    onSubmit,
}: OutputPanelProps) {
    return (
        <>
            {/* Results header + action buttons */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-[#252526] shrink-0">
                <div className="flex items-center gap-2 text-sm text-white/70">
                    <TerminalIcon className="size-3.5" />
                    <span className="font-medium">Output</span>
                    {judgeResult && (
                        <>
                            <span className="text-white/20">·</span>
                            <span
                                className={
                                    judgeResult.verdict === "ACCEPTED"
                                        ? "text-emerald-400"
                                        : "text-rose-400"
                                }
                            >
                                {judgeResult.passed}/{judgeResult.total} passed
                            </span>
                        </>
                    )}
                    {isSolved && (
                        <>
                            <span className="text-white/20">·</span>
                            <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircleIcon className="size-3" />
                                Solved
                            </span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRun}
                        disabled={isRunning || isSubmitting}
                        className="gap-1.5 h-7 text-sm border-white/20 text-white/80 hover:text-white hover:bg-white/10 bg-transparent"
                    >
                        {isRunning ? (
                            <Loader2Icon className="size-3 animate-spin" />
                        ) : (
                            <PlayIcon className="size-3" />
                        )}
                        Run
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSubmit}
                        disabled={isRunning || isSubmitting}
                        className="gap-1.5 h-7 text-sm bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {isSubmitting ? (
                            <Loader2Icon className="size-3 animate-spin" />
                        ) : (
                            <SendIcon className="size-3" />
                        )}
                        Submit
                    </Button>
                </div>
            </div>

            {/* Results content */}
            <div className="flex-1 min-h-0 overflow-hidden bg-background">
                <JudgeResultsPanel result={judgeResult} className="h-full" />
            </div>
        </>
    );
}
