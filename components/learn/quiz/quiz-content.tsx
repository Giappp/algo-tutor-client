"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Quiz, QuizAttemptResponse } from "@/lib/types/lesson";
import { lessonApi } from "@/api/lesson";
import { useTimer } from "@/components/learn/coding/use-timer";
import { Button } from "@/components/ui/button";
import { springs, slideVariants } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    Loader2Icon,
} from "lucide-react";
import {
    QuestionCard,
    QuizResultsPanel,
    QuizProgressDots,
    QuizAttemptsHistory,
    QuizOverview,
} from './index';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizContentProps {
    quiz: Quiz;
    roadmapSlug: string;
    lessonSlug: string;
    onComplete: () => void;
    onMarkComplete?: () => void;
    isCompleted: boolean;
}

type QuizView = "overview" | "questions" | "results";

interface AnswerMap {
    [questionId: number]: string[];
}

// ─── QuizContent ─────────────────────────────────────────────────────────────

export function QuizContent({
    quiz,
    roadmapSlug,
    lessonSlug,
    onComplete,
    onMarkComplete,
    isCompleted,
}: QuizContentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [quizView, setQuizView] = useState<QuizView>("overview");
    const [attemptResult, setAttemptResult] = useState<QuizAttemptResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const reducedMotion = useReducedMotion();

    // Timer starts paused — only begins when user answers the first question
    const timer = useTimer({ startPaused: true });
    const hasStartedRef = useRef(false);
    const startedAtRef = useRef<string>("");

    const handleStartQuiz = () => {
        setQuizView("questions");
    };

    const handleAnswer = useCallback(
        (ids: string[]) => {
            // Start timer on first interaction
            if (!hasStartedRef.current) {
                hasStartedRef.current = true;
                startedAtRef.current = new Date().toISOString();
                timer.start();
            }
            setAnswers((prev) => ({ ...prev, [quiz.questions[currentIndex].id]: ids }));
        },
        [quiz, currentIndex, timer]
    );

    const handleSubmit = async () => {
        timer.stop();
        setIsSubmitting(true);

        const completedAt = new Date().toISOString();

        try {
            const attemptAnswers = quiz.questions.map((q) => ({
                questionId: q.id,
                selectedOptionIds: answers[q.id] ?? [],
            }));

            const result = await lessonApi.submitQuizAttempt(lessonSlug, {
                answers: attemptAnswers,
                startedAt: startedAtRef.current,
                completedAt,
                timeSpentSeconds: timer.seconds,
            });

            setAttemptResult(result);
            setQuizView("results");

            if (result.passed && result.lessonProgressUpdated) {
                onMarkComplete?.();
            }
        } catch {
            // API error handled by interceptor — fallback to local scoring
            const correctCount = quiz.questions.filter((q) => {
                const selected = new Set(answers[q.id] ?? []);
                return (
                    q.correctOptionIds.length === selected.size &&
                    q.correctOptionIds.every((id) => selected.has(id))
                );
            }).length;
            const score = Math.round((correctCount / quiz.questions.length) * 100);

            setAttemptResult({
                id: "local",
                score,
                passed: score >= quiz.passingScore,
                correctCount,
                totalQuestions: quiz.questions.length,
                attemptNumber: 1,
                completedAt,
                questionResults: quiz.questions.map((q) => {
                    const selected = new Set(answers[q.id] ?? []);
                    return {
                        questionId: q.id,
                        isCorrect:
                            q.correctOptionIds.length === selected.size &&
                            q.correctOptionIds.every((id) => selected.has(id)),
                        correctOptionIds: q.correctOptionIds,
                    };
                }),
                lessonProgressUpdated: false,
            });
            setQuizView("results");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < quiz.questions.length - 1) {
            setDirection(1);
            setCurrentIndex((i) => i + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex((i) => i - 1);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setCurrentIndex(0);
        setQuizView("questions");
        setAttemptResult(null);
        hasStartedRef.current = false;
        startedAtRef.current = "";
        timer.reset();
    };

    const handleNavigate = (targetIndex: number) => {
        setDirection(targetIndex > currentIndex ? 1 : -1);
        setCurrentIndex(targetIndex);
    };

    const handleBackToOverview = () => {
        setAnswers({});
        setCurrentIndex(0);
        setQuizView("overview");
        setAttemptResult(null);
        hasStartedRef.current = false;
        startedAtRef.current = "";
        timer.reset();
    };

    const handleContinue = () => {
        if (attemptResult?.passed) {
            if (!attemptResult.lessonProgressUpdated) {
                onMarkComplete?.();
            }
            onComplete();
        }
    };

    // ─── Overview View ───────────────────────────────────────────────────────

    if (quizView === "overview") {
        return (
            <QuizOverview
                quiz={quiz}
                roadmapSlug={roadmapSlug}
                lessonSlug={lessonSlug}
                onStart={handleStartQuiz}
            />
        );
    }

    // ─── Results View ────────────────────────────────────────────────────────

    if (quizView === "results" && attemptResult) {
        return (
            <div className="flex-1 overflow-y-auto">
                <QuizResultsPanel
                    quiz={quiz}
                    attemptResult={attemptResult}
                    onRetry={handleRetry}
                    onContinue={handleContinue}
                    onBackToOverview={handleBackToOverview}
                />

                {/* History section after results */}
                <div className="max-w-xl mx-auto px-6 pb-12">
                    <QuizAttemptsHistory
                        roadmapSlug={roadmapSlug}
                        lessonSlug={lessonSlug}
                        passingScore={quiz.passingScore}
                    />
                </div>

                {attemptResult.passed && !isCompleted && (
                    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-10">
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 shadow-lg">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircleIcon className="size-4" />
                                <span className="text-sm font-medium">
                                    Quiz passed! Lesson marked as complete.
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Questions View ──────────────────────────────────────────────────────

    const totalQuestions = quiz.questions.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;
    const currentQuestion = quiz.questions[currentIndex];
    const hasAnswered = (answers[currentQuestion.id] ?? []).length > 0;

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-sans">{quiz.title}</span>
                        <span className="flex items-center gap-2">
                            {hasStartedRef.current && (
                                <span className="font-mono">{timer.formatted}</span>
                            )}
                            <span>
                                {currentIndex + 1} / {totalQuestions}
                            </span>
                        </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-[var(--lesson-accent)]"
                            animate={{ width: `${progress}%` }}
                            transition={springs.gentle}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    {reducedMotion ? (
                        <QuestionCard
                            question={currentQuestion}
                            questionNumber={currentIndex + 1}
                            totalQuestions={totalQuestions}
                            selectedIds={answers[currentQuestion.id] ?? []}
                            showResult={false}
                            onAnswer={handleAnswer}
                        />
                    ) : (
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={springs.snappy}
                            >
                                <QuestionCard
                                    question={currentQuestion}
                                    questionNumber={currentIndex + 1}
                                    totalQuestions={totalQuestions}
                                    selectedIds={answers[currentQuestion.id] ?? []}
                                    showResult={false}
                                    onAnswer={handleAnswer}
                                />
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="gap-1.5"
                    >
                        <ArrowLeftIcon className="size-3.5" />
                        Previous
                    </Button>

                    <div className="flex-1" />

                    <Button
                        size="sm"
                        onClick={handleNext}
                        disabled={!hasAnswered || isSubmitting}
                        className="gap-1.5"
                    >
                        {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
                        {currentIndex === totalQuestions - 1 ? "Submit Quiz" : "Next Question"}
                        {!isSubmitting && <ArrowRightIcon className="size-3.5" />}
                    </Button>
                </div>

                <QuizProgressDots
                    questions={quiz.questions}
                    answers={answers}
                    currentIndex={currentIndex}
                    onNavigate={handleNavigate}
                />
            </div>
        </div>
    );
}
