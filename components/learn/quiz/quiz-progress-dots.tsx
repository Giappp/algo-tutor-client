"use client";

import type { QuizQuestion } from "@/lib/types/lesson";
import { cn } from "@/lib/utils";

interface AnswerMap {
    [questionId: number]: string[];
}

interface QuizProgressDotsProps {
    questions: QuizQuestion[];
    answers: AnswerMap;
    currentIndex: number;
    onNavigate: (index: number) => void;
}

export function QuizProgressDots({
    questions,
    answers,
    currentIndex,
    onNavigate,
}: QuizProgressDotsProps) {
    return (
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {questions.map((q, i) => {
                const answered = (answers[q.id] ?? []).length > 0;
                const isCurrent = i === currentIndex;

                return (
                    <button
                        key={q.id}
                        onClick={() => onNavigate(i)}
                        className={cn(
                            "size-2 rounded-full transition-all",
                            isCurrent ? "bg-primary w-4" : answered ? "bg-primary/60" : "bg-muted"
                        )}
                        title={`Question ${i + 1}`}
                    />
                );
            })}
        </div>
    );
}
