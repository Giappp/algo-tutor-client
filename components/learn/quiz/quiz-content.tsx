"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Quiz, QuizAttemptResponse } from "@/lib/types/lesson";
import { lessonApi } from "@/api/lesson";
import { useTimer } from "@/components/learn/coding/use-timer";
import { Button } from "@/components/ui/button";
import { springs, slideVariants } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    Loader2Icon,
    SparklesIcon,
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
    const [hasStarted, setHasStarted] = useState(false);
    const startedAtRef = useRef<string>("");

    const handleStartQuiz = () => {
        setQuizView("questions");
    };

    const handleAnswer = useCallback(
        (ids: string[]) => {
            // Start timer on first interaction
            if (!hasStarted) {
                setHasStarted(true);
                startedAtRef.current = new Date().toISOString();
                timer.start();
            }
            setAnswers((prev) => ({ ...prev, [quiz.questions[currentIndex].id]: ids }));
        },
        [quiz, currentIndex, timer, hasStarted]
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
        setHasStarted(false);
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
        setHasStarted(false);
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
        <div className="flex-1 overflow-y-auto bg-muted/[0.16]">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
                    
                    {/* Left Column: Active Question Card & Navigation */}
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        
                        {/* Mobile Header / Progress Bar */}
                        <div className="flex flex-col gap-2 lg:hidden">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-sans truncate max-w-[200px]">{quiz.title}</span>
                                <span className="flex items-center gap-2">
                                    {hasStarted && (
                                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px]">{timer.formatted}</span>
                                    )}
                                    <span className="font-medium">
                                        {currentIndex + 1} / {totalQuestions}
                                    </span>
                                </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <motion.div
                                    className="h-full rounded-full bg-[var(--lesson-accent)]"
                                    animate={{ width: `${progress}%` }}
                                    transition={springs.gentle}
                                />
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="relative rounded-2xl border border-border/60 bg-card/75 p-5 shadow-sm sm:p-6">
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

                        {/* Navigation Buttons */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="gap-1.5 h-10 px-4 rounded-xl text-xs font-semibold"
                            >
                                <ArrowLeftIcon className="size-3.5" />
                                Quay lại
                            </Button>

                            <div className="flex-1" />

                            <Button
                                size="sm"
                                onClick={handleNext}
                                disabled={!hasAnswered || isSubmitting}
                                className="gap-1.5 h-10 px-5 rounded-xl text-xs font-semibold shadow-md shadow-primary/10"
                            >
                                {isSubmitting && <Loader2Icon className="size-3.5 animate-spin" />}
                                {currentIndex === totalQuestions - 1 ? "Nộp bài Quiz" : "Câu tiếp theo"}
                                {!isSubmitting && <ArrowRightIcon className="size-3.5" />}
                            </Button>
                        </div>

                        {/* Mobile Progress Dots */}
                        <div className="block lg:hidden pt-2">
                            <QuizProgressDots
                                questions={quiz.questions}
                                answers={answers}
                                currentIndex={currentIndex}
                                onNavigate={handleNavigate}
                            />
                        </div>
                    </div>

                    {/* Right Column: Sticky Quiz Progress, Navigation Grid & Timer */}
                    <div className="flex flex-col gap-6 lg:sticky lg:top-0 lg:col-span-4">
                        
                        {/* Timer Card */}
                        <div className="flex flex-col gap-3.5 rounded-2xl border border-border/60 bg-card/75 p-5 text-center shadow-sm">
                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Thời gian làm bài
                            </h4>
                            <div className="flex items-center justify-center gap-2 text-2xl font-bold font-mono tracking-tight text-foreground">
                                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                {hasStarted ? timer.formatted : "00:00"}
                            </div>
                        </div>

                        {/* Interactive Questions Navigator Grid */}
                        <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/75 p-5 shadow-sm">
                            <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    Bản đồ câu hỏi
                                </h4>
                                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    Đã trả lời: {Object.keys(answers).filter(k => answers[Number(k)]?.length > 0).length}/{totalQuestions}
                                </span>
                            </div>

                            {/* Responsive Squares Grid */}
                            <div className="grid grid-cols-5 gap-2">
                                {quiz.questions.map((q, i) => {
                                    const isCurrent = i === currentIndex;
                                    const isAnswered = (answers[q.id] ?? []).length > 0;
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleNavigate(i)}
                                            className={cn(
                                                "flex size-9 items-center justify-center rounded-lg border font-mono text-xs font-bold transition-all",
                                                isCurrent
                                                    ? "border-[var(--lesson-accent)] bg-[var(--lesson-accent)]/10 text-[var(--lesson-accent)] shadow-sm scale-105"
                                                    : isAnswered
                                                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                                                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                            )}
                                        >
                                            {i + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Grid Legend */}
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground/80 pt-1 border-t border-border/40">
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded bg-emerald-500/10 border border-emerald-500/20" />
                                    <span>Đã làm</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded bg-[var(--lesson-accent)]/10 border border-[var(--lesson-accent)]" />
                                    <span>Đang xem</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="size-2 rounded bg-muted/20 border border-border" />
                                    <span>Chưa làm</span>
                                </div>
                            </div>
                        </div>

                        {/* Quiz Summary Requirement */}
                        <div className="flex flex-col gap-2.5 rounded-2xl border border-border/60 bg-card/75 p-4 text-xs leading-relaxed text-muted-foreground shadow-sm">
                            <p>
                                <strong>Mục tiêu:</strong> Trả lời chính xác ít nhất <strong>{quiz.passingScore}%</strong> ({Math.ceil(totalQuestions * quiz.passingScore / 100)}/{totalQuestions} câu) để được tính là hoàn thành.
                            </p>
                        </div>

                        {/* AI Tutor Quiz Guide */}
                        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--lesson-accent-border)] bg-card/75 p-4.5 shadow-sm animate-in fade-in duration-300">
                            <div className="flex gap-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--lesson-accent)] text-primary-foreground shadow-xs">
                                    <SparklesIcon className="size-4" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-xs text-foreground">Cần AI Tutor giảng giải?</h5>
                                    <p className="text-[10px] text-muted-foreground leading-normal">
                                        Hãy nhờ AI Tutor tóm tắt lý thuyết trọng tâm hoặc chia sẻ mẹo tránh bẫy khi làm các câu hỏi thuộc chủ đề này.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent("ai-tutor-open"));
                                        window.dispatchEvent(new CustomEvent("ai-tutor-ask", {
                                            detail: {
                                                message: `Tôi đang làm bài kiểm tra trắc nghiệm "${quiz.title}". Bạn có thể tóm tắt ngắn gọn các chủ điểm lý thuyết chính liên quan mật thiết đến bộ câu hỏi trắc nghiệm này để tôi làm bài tốt hơn không?`,
                                                mode: "EXPLAIN"
                                            }
                                        }));
                                    }}
                                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[var(--lesson-accent)] py-2 text-[10px] font-bold text-primary-foreground shadow-xs transition-all hover:opacity-95 active:scale-95"
                                >
                                    <SparklesIcon className="size-3.5" />
                                    Trọng tâm kiến thức bài thi
                                </button>
                                <button
                                    onClick={() => {
                                        window.dispatchEvent(new CustomEvent("ai-tutor-open"));
                                        window.dispatchEvent(new CustomEvent("ai-tutor-ask", {
                                            detail: {
                                                message: `Hãy chia sẻ cho tôi một vài mẹo hoặc lưu ý quan trọng để tránh bị bẫy khi làm các câu hỏi trắc nghiệm thuộc chủ đề của bài thi "${quiz.title}" này!`,
                                                mode: "EXPLAIN"
                                            }
                                        }));
                                    }}
                                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border/60 bg-background py-2 text-[10px] font-bold text-foreground transition-all hover:bg-muted active:scale-95"
                                >
                                    <CheckCircleIcon className="size-3.5 text-[var(--lesson-accent)]" />
                                    Mẹo tránh bẫy trắc nghiệm
                                </button>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
