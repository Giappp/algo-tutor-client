"use client";

import { useCallback, useState } from "react";
import type { Quiz, QuizQuestion } from "@/lib/types/lesson";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    RefreshCwIcon,
    TrophyIcon,
    XCircleIcon,
} from "lucide-react";

interface QuizContentProps {
    quiz: Quiz;
    onComplete: () => void;
    onMarkComplete?: () => void;
    isCompleted: boolean;
}

type QuizView = "questions" | "results";

interface AnswerMap {
    [questionId: number]: string[];
}

function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    selectedIds,
    showResult,
    onAnswer,
}: {
    question: QuizQuestion;
    questionNumber: number;
    totalQuestions: number;
    selectedIds: string[];
    showResult: boolean;
    onAnswer: (ids: string[]) => void;
}) {
    const correctSet = new Set(question.correctOptionIds);
    const selectedSet = new Set(selectedIds);
    const isCorrect =
        question.type === "MULTIPLE_CHOICE"
            ? question.correctOptionIds.length === selectedIds.length &&
              question.correctOptionIds.every((id) => selectedSet.has(id))
            : selectedIds.length === 1 && correctSet.has(selectedIds[0]);

    const handleSingleSelect = (optionId: string) => {
        if (!showResult) onAnswer([optionId]);
    };

    const handleMultiSelect = (optionId: string, checked: boolean) => {
        if (!showResult) {
            if (checked) {
                onAnswer([...selectedIds, optionId]);
            } else {
                onAnswer(selectedIds.filter((id) => id !== optionId));
            }
        }
    };

    const OptionComponent = question.type === "SINGLE_CHOICE" ? RadioGroup : "div";

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        Question {questionNumber}/{totalQuestions}
                    </Badge>
                    <Badge
                        variant="secondary"
                        className={cn(
                            "text-xs",
                            question.type === "MULTIPLE_CHOICE" && "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        )}
                    >
                        {question.type === "MULTIPLE_CHOICE" ? "Select all that apply" : "Select one"}
                    </Badge>
                </div>
                <h2 className="text-lg font-semibold text-foreground leading-snug">
                    {question.text}
                </h2>
            </div>

            <OptionComponent
                value={selectedIds[0] ?? ""}
                onValueChange={question.type === "SINGLE_CHOICE" ? handleSingleSelect : undefined}
                className="space-y-3"
            >
                {question.options.map((option) => {
                    const isSelected = selectedSet.has(option.id);
                    const isCorrectOption = correctSet.has(option.id);
                    const showCorrectBadge = showResult && isCorrectOption;
                    const showWrongBadge = showResult && isSelected && !isCorrectOption;

                    let optionClass =
                        "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all text-sm";
                    if (showResult) {
                        if (showCorrectBadge) {
                            optionClass += " border-emerald-500 bg-emerald-500/5";
                        } else if (showWrongBadge) {
                            optionClass += " border-rose-500 bg-rose-500/5";
                        } else {
                            optionClass += " border-border opacity-60";
                        }
                    } else if (isSelected) {
                        optionClass += " border-primary bg-primary/5 text-primary";
                    } else {
                        optionClass += " border-border hover:border-primary/40 hover:bg-muted/50";
                    }

                    return (
                        <Label
                            key={option.id}
                            htmlFor={
                                question.type === "SINGLE_CHOICE"
                                    ? `q${question.id}-option-${option.id}`
                                    : `q${question.id}-checkbox-${option.id}`
                            }
                            className={cn(optionClass, !showResult && "cursor-pointer")}
                        >
                            <div className="flex items-start gap-3 w-full">
                                <div className="pt-0.5">
                                    {question.type === "SINGLE_CHOICE" ? (
                                        <RadioGroupItem
                                            value={option.id}
                                            id={`q${question.id}-option-${option.id}`}
                                            className="mt-0.5"
                                        />
                                    ) : (
                                        <Checkbox
                                            id={`q${question.id}-checkbox-${option.id}`}
                                            checked={isSelected}
                                            onCheckedChange={(checked) =>
                                                handleMultiSelect(option.id, !!checked)
                                            }
                                            className="mt-0.5"
                                        />
                                    )}
                                </div>
                                <span className="flex-1 leading-relaxed">{option.text}</span>
                                {showCorrectBadge && (
                                    <CheckCircleIcon className="size-5 text-emerald-500 shrink-0" />
                                )}
                                {showWrongBadge && (
                                    <XCircleIcon className="size-5 text-rose-500 shrink-0" />
                                )}
                            </div>
                        </Label>
                    );
                })}
            </OptionComponent>

            {showResult && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <div
                            className={cn(
                                "size-6 rounded-full flex items-center justify-center",
                                isCorrect ? "bg-emerald-500/15" : "bg-rose-500/15"
                            )}
                        >
                            {isCorrect ? (
                                <CheckCircleIcon className="size-4 text-emerald-500" />
                            ) : (
                                <XCircleIcon className="size-4 text-rose-500" />
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-sm font-semibold",
                                isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}
                        >
                            {isCorrect ? "Correct!" : "Incorrect"}
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {question.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}

function QuizResultsPanel({
    quiz,
    answers,
    onRetry,
    onContinue,
}: {
    quiz: Quiz;
    answers: AnswerMap;
    onRetry: () => void;
    onContinue: () => void;
}) {
    const totalQuestions = quiz.questions.length;
    const correctCount = quiz.questions.filter((q) => {
        const selected = new Set(answers[q.id] ?? []);
        return (
            q.correctOptionIds.length === selected.size &&
            q.correctOptionIds.every((id) => selected.has(id))
        );
    }).length;

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

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
                    {passed ? (
                        <TrophyIcon className="size-10" />
                    ) : (
                        <RefreshCwIcon className="size-10" />
                    )}
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
                        <span className="font-semibold text-foreground">{totalQuestions}</span> questions correct.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Passing score: {quiz.passingScore}%
                    </p>
                </div>
                <Progress value={score} className="h-3" />
            </div>

            <div className="text-left rounded-xl border border-border bg-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Question Breakdown</h3>
                <div className="space-y-2">
                    {quiz.questions.map((q, i) => {
                        const selected = new Set(answers[q.id] ?? []);
                        const isCorrect =
                            q.correctOptionIds.length === selected.size &&
                            q.correctOptionIds.every((id) => selected.has(id));

                        return (
                            <div key={q.id} className="flex items-center gap-3 text-sm">
                                {isCorrect ? (
                                    <CheckCircleIcon className="size-4 text-emerald-500 shrink-0" />
                                ) : (
                                    <XCircleIcon className="size-4 text-rose-500 shrink-0" />
                                )}
                                <span className="text-muted-foreground">Q{i + 1}:</span>
                                <span className="text-foreground font-medium truncate">{q.text.slice(0, 50)}...</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
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

export function QuizContent({ quiz, onComplete, onMarkComplete, isCompleted }: QuizContentProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [quizView, setQuizView] = useState<QuizView>("questions");
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleAnswer = useCallback((ids: string[]) => {
        setAnswers((prev) => ({ ...prev, [quiz.questions[currentIndex].id]: ids }));
    }, [quiz, currentIndex]);

    const handleNext = () => {
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex((i) => i + 1);
        } else {
            setHasSubmitted(true);
            setQuizView("results");
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((i) => i - 1);
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setCurrentIndex(0);
        setQuizView("questions");
        setHasSubmitted(false);
    };

    const handleContinue = () => {
        // Only mark complete if user passed the quiz
        const totalQuestions = quiz.questions.length;
        const correctCount = quiz.questions.filter((q) => {
            const selected = new Set(answers[q.id] ?? []);
            return (
                q.correctOptionIds.length === selected.size &&
                q.correctOptionIds.every((id) => selected.has(id))
            );
        }).length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        if (score >= quiz.passingScore) {
            // Trigger PATCH COMPLETED on the server + update local state
            if (onMarkComplete) {
                onMarkComplete();
            }
            onComplete();
        }
    };

    if (quizView === "results") {
        const totalQuestions = quiz.questions.length;
        const correctCount = quiz.questions.filter((q) => {
            const selected = new Set(answers[q.id] ?? []);
            return (
                q.correctOptionIds.length === selected.size &&
                q.correctOptionIds.every((id) => selected.has(id))
            );
        }).length;
        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= quiz.passingScore;

        return (
            <div className="flex-1 overflow-y-auto">
                <QuizResultsPanel
                    quiz={quiz}
                    answers={answers}
                    onRetry={handleRetry}
                    onContinue={handleContinue}
                />
                {passed && !isCompleted && (
                    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-10">
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 shadow-lg">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircleIcon className="size-4" />
                                <span className="text-sm font-medium">Quiz passed! Lesson marked as complete.</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const totalQuestions = quiz.questions.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;
    const currentQuestion = quiz.questions[currentIndex];
    const hasAnswered = (answers[currentQuestion.id] ?? []).length > 0;

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{quiz.title}</span>
                        <span>
                            {currentIndex + 1} / {totalQuestions}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                    <QuestionCard
                        question={currentQuestion}
                        questionNumber={currentIndex + 1}
                        totalQuestions={totalQuestions}
                        selectedIds={answers[currentQuestion.id] ?? []}
                        showResult={false}
                        onAnswer={handleAnswer}
                    />
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
                        disabled={!hasAnswered}
                        className="gap-1.5"
                    >
                        {currentIndex === totalQuestions - 1 ? "Submit Quiz" : "Next Question"}
                        <ArrowRightIcon className="size-3.5" />
                    </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {quiz.questions.map((q, i) => {
                        const answered = (answers[q.id] ?? []).length > 0;
                        const isCurrent = i === currentIndex;

                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(i)}
                                className={cn(
                                    "size-2 rounded-full transition-all",
                                    isCurrent
                                        ? "bg-primary w-4"
                                        : answered
                                        ? "bg-primary/60"
                                        : "bg-muted"
                                )}
                                title={`Question ${i + 1}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
