"use client";

import { cn } from "@/lib/utils";
import type { Difficulty, Level } from "@/lib/types";

interface DifficultyBadgeProps {
    difficulty: Difficulty | Level;
    className?: string;
}

const difficultyConfig: Record<
    string,
    { label: string; variant: "easy" | "medium" | "hard" }
> = {
    EASY: { label: "Dễ", variant: "easy" },
    MEDIUM: { label: "Vừa", variant: "medium" },
    HARD: { label: "Khó", variant: "hard" },
    BEGINNER: { label: "Nhập môn", variant: "easy" },
    INTERMEDIATE: { label: "Trung cấp", variant: "medium" },
    ADVANCED: { label: "Nâng cao", variant: "hard" },
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
    const config = difficultyConfig[difficulty] ?? difficultyConfig.MEDIUM;

    return (
        <span
            className={cn(
                "inline-flex h-6 min-w-[60px] items-center justify-center rounded-md border px-2.5 text-[11px] font-semibold",
                config.variant === "easy" &&
                    "border-[oklch(0.72_0.18_145/0.5)] bg-[oklch(0.72_0.18_145/0.2)] text-[oklch(0.72_0.18_145)] dark:border-[oklch(0.72_0.18_145/0.6)] dark:bg-[oklch(0.72_0.18_145/0.25)] dark:text-[oklch(0.72_0.18_145)]",
                config.variant === "medium" &&
                    "border-[oklch(0.75_0.16_80/0.5)] bg-[oklch(0.75_0.16_80/0.2)] text-[oklch(0.75_0.16_80)] dark:border-[oklch(0.75_0.16_80/0.6)] dark:bg-[oklch(0.75_0.16_80/0.25)] dark:text-[oklch(0.75_0.16_80)]",
                config.variant === "hard" &&
                    "border-[oklch(0.65_0.2_25/0.5)] bg-[oklch(0.65_0.2_25/0.2)] text-[oklch(0.65_0.2_25)] dark:border-[oklch(0.65_0.2_25/0.6)] dark:bg-[oklch(0.65_0.2_25/0.25)] dark:text-[oklch(0.65_0.2_25)]",
                className
            )}
        >
            {config.label}
        </span>
    );
}
