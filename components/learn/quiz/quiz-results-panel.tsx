"use client";

import { motion } from "framer-motion";
import type { Quiz, QuizAttemptResponse } from "@/lib/types/lesson";
import { Button } from "@/components/ui/button";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import {
    ArrowRightIcon,
    CheckCircleIcon,
    RefreshCwIcon,
    TrophyIcon,
    XCircleIcon,
} from "lucide-react";

interface QuizResultsPanelProps {
    quiz: Quiz;
    attemptResult: QuizAttemptResponse;
    onRetry: () => void;
    onContinue: () => void;
    onBackToOverview?: () => void;
}

export function QuizResultsPanel({
    quiz,
    attemptResult,
    onRetry,
    onContinue,
    onBackToOverview,
}: QuizResultsPanelProps) {
    const { score, passed, correctCount, totalQuestions, questionResults } = attemptResult;

    return (
        <div className="max-w-4xl mx-auto px-6 py-8 sm:py-12 bg-background/30 rounded-2xl border border-border/40 mt-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Result Header & Progress Score */}
                <div className="md:col-span-6 space-y-6 text-center md:text-left">
                    <div className="space-y-4">
                        <div
                            className={cn(
                                "size-16 rounded-2xl flex items-center justify-center mx-auto md:mx-0",
                                passed
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            )}
                        >
                            {passed ? <TrophyIcon className="size-8" /> : <RefreshCwIcon className="size-8 animate-spin" style={{ animationDuration: '3s' }} />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {passed ? "Well Done!" : "Keep Practicing!"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">{quiz.title}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-sm">
                        <div className="text-5xl font-extrabold text-foreground tabular-nums">{score}%</div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                                Bạn đã trả lời đúng{" "}
                                <span className={cn("font-bold", passed ? "text-emerald-500" : "text-rose-500")}>
                                    {correctCount}
                                </span>{" "}
                                trên tổng số{" "}
                                <span className="font-bold text-foreground">{totalQuestions}</span> câu hỏi.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Điểm tối thiểu đạt: {quiz.passingScore}%
                            </p>
                        </div>
                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                            <motion.div
                                className={cn(
                                    "h-full rounded-full",
                                    passed ? "bg-emerald-500" : "bg-[var(--lesson-accent)]"
                                )}
                                initial={{ width: "0%" }}
                                animate={{ width: `${score}%` }}
                                transition={springs.gentle}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        {onBackToOverview && (
                            <Button variant="ghost" onClick={onBackToOverview} className="flex-1 gap-1.5 text-xs text-muted-foreground h-10 rounded-xl">
                                Quay lại
                            </Button>
                        )}
                        <Button variant="outline" onClick={onRetry} className="flex-1 gap-1.5 text-xs h-10 rounded-xl">
                            <RefreshCwIcon className="size-3.5" />
                            Làm lại
                        </Button>
                        {passed && (
                            <Button onClick={onContinue} className="flex-1 gap-1.5 text-xs h-10 rounded-xl shadow-md">
                                Tiếp tục
                                <ArrowRightIcon className="size-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right Column: Question Breakdown */}
                <div className="md:col-span-6 space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">
                            Chi tiết kết quả
                        </h3>
                        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                            {quiz.questions.map((q, i) => {
                                const result = questionResults.find((r) => r.questionId === q.id);
                                const isCorrect = result?.isCorrect ?? false;

                                return (
                                    <div 
                                        key={q.id} 
                                        className={cn(
                                            "flex items-center gap-3 text-xs p-3 rounded-xl border transition-colors",
                                            isCorrect 
                                                ? "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10" 
                                                : "bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10"
                                        )}
                                    >
                                        {isCorrect ? (
                                            <CheckCircleIcon className="size-4.5 text-emerald-500 shrink-0" />
                                        ) : (
                                            <XCircleIcon className="size-4.5 text-rose-500 shrink-0" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-foreground">Câu {i + 1}</span>
                                                <span className={cn(
                                                    "text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase",
                                                    isCorrect ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                                )}>
                                                    {isCorrect ? "Đúng" : "Sai"}
                                                </span>
                                            </div>
                                            <p className="text-muted-foreground truncate mt-0.5">
                                                {q.text}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
