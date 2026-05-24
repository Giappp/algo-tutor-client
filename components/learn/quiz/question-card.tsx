"use client";

import type { QuizQuestion } from "@/lib/types/lesson";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { motion } from "framer-motion";
import { scalePop } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface QuestionCardProps {
    question: QuizQuestion;
    questionNumber: number;
    totalQuestions: number;
    selectedIds: string[];
    showResult: boolean;
    correctOptionIds?: string[];
    onAnswer: (ids: string[]) => void;
}

export function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    selectedIds,
    showResult,
    correctOptionIds,
    onAnswer,
}: QuestionCardProps) {
    const reducedMotion = useReducedMotion();
    const correctSet = new Set(correctOptionIds ?? question.correctOptionIds);
    const selectedSet = new Set(selectedIds);
    const isCorrect =
        correctSet.size === selectedIds.length &&
        selectedIds.every((id) => correctSet.has(id));

    const handleSingleSelect = (optionId: string) => {
        if (!showResult) onAnswer([optionId]);
    };

    const handleMultiSelect = (optionId: string, checked: boolean) => {
        if (showResult) return;
        if (checked) {
            onAnswer([...selectedIds, optionId]);
        } else {
            onAnswer(selectedIds.filter((id) => id !== optionId));
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
                            question.type === "MULTIPLE_CHOICE" &&
                                "bg-amber-500/15 text-amber-600 dark:text-amber-400"
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
                        if (showCorrectBadge) optionClass += " border-emerald-500 bg-emerald-500/5";
                        else if (showWrongBadge) optionClass += " border-rose-500 bg-rose-500/5";
                        else optionClass += " border-border opacity-60";
                    } else if (isSelected) {
                        optionClass += " border-primary bg-primary/5 text-primary";
                    } else {
                        optionClass += " border-border hover:border-primary/40 hover:bg-muted/50";
                    }

                    const labelContent = (
                        <Label
                            key={option.id}
                            htmlFor={`q${question.id}-${question.type === "SINGLE_CHOICE" ? "option" : "checkbox"}-${option.id}`}
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

                    if (reducedMotion) {
                        return <div key={option.id}>{labelContent}</div>;
                    }

                    return (
                        <motion.div
                            key={option.id}
                            variants={scalePop}
                            animate={isSelected ? "selected" : "idle"}
                        >
                            {labelContent}
                        </motion.div>
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
                                isCorrect
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
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
