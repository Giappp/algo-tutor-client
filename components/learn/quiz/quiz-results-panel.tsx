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
        <div className="max-w-xl mx-auto px-6 py-12 space-y-8 text-center">
            <div className="space-y-4">
                <div
                    className={cn(
                        "size-20 rounded-full flex items-center justify-center mx-auto",
                        passed
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    )}
                >
                    {passed ? <TrophyIcon className="size-10" /> : <RefreshCwIcon className="size-10" />}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        {passed ? "Well Done!" : "Keep Practicing!"}
                    </h2>
                    <p className="text-muted-foreground mt-1">{quiz.title}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
                <div className="text-5xl font-bold text-foreground">{score}%</div>
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                        You got{" "}
                        <span className={cn("font-semibold", passed ? "text-emerald-500" : "text-rose-500")}>
                            {correctCount}
                        </span>{" "}
                        out of{" "}
                        <span className="font-semibold text-foreground">{totalQuestions}</span> questions
                        correct.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Passing score: {quiz.passingScore}%
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

            <div className="text-left rounded-xl border border-border bg-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Question Breakdown</h3>
                <div className="space-y-2">
                    {quiz.questions.map((q, i) => {
                        const result = questionResults.find((r) => r.questionId === q.id);
                        const isCorrect = result?.isCorrect ?? false;

                        return (
                            <div key={q.id} className="flex items-center gap-3 text-sm">
                                {isCorrect ? (
                                    <CheckCircleIcon className="size-4 text-emerald-500 shrink-0" />
                                ) : (
                                    <XCircleIcon className="size-4 text-rose-500 shrink-0" />
                                )}
                                <span className="text-muted-foreground">Q{i + 1}:</span>
                                <span className="text-foreground font-medium truncate">
                                    {q.text.slice(0, 50)}...
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                {onBackToOverview && (
                    <Button variant="ghost" onClick={onBackToOverview} className="flex-1 gap-1.5 text-muted-foreground">
                        Quiz Overview
                    </Button>
                )}
                <Button variant="outline" onClick={onRetry} className="flex-1 gap-1.5">
                    <RefreshCwIcon className="size-4" />
                    Retry Quiz
                </Button>
                {passed && (
                    <Button onClick={onContinue} className="flex-1 gap-1.5">
                        Continue
                        <ArrowRightIcon className="size-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
