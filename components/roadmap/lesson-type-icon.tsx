import { cn } from "@/lib/utils";
import type { LessonType } from "@/lib/types";
import { BookOpenIcon, HelpCircleIcon, Code2Icon, PlaySquareIcon } from "lucide-react";

interface LessonTypeIconProps {
    type: LessonType;
    showLabel?: boolean;
    className?: string;
}

const lessonTypeConfig: Record<
    LessonType,
    {
        icon: typeof BookOpenIcon;
        label: string;
        pillClass: string;
        iconClass: string;
    }
> = {
    THEORY: {
        icon: BookOpenIcon,
        label: "Theory",
        pillClass:
            "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25",
        iconClass: "text-blue-500 dark:text-blue-400",
    },
    QUIZ: {
        icon: HelpCircleIcon,
        label: "Quiz",
        pillClass:
            "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25",
        iconClass: "text-amber-500 dark:text-amber-400",
    },
    CODING: {
        icon: Code2Icon,
        label: "Coding",
        pillClass:
            "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
        iconClass: "text-emerald-500 dark:text-emerald-400",
    },
    VIDEO: {
        icon: PlaySquareIcon,
        label: "Video",
        pillClass:
            "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/25",
        iconClass: "text-rose-500 dark:text-rose-400",
    },
};

export function LessonTypeIcon({
    type,
    showLabel = true,
    className,
}: LessonTypeIconProps) {
    const config = lessonTypeConfig[type];
    const Icon = config.icon;

    if (!showLabel) {
        return (
            <div className={cn("flex items-center justify-center", className)}>
                <Icon className={cn("size-4 shrink-0", config.iconClass)} strokeWidth={1.75} />
            </div>
        );
    }

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold",
                config.pillClass,
                className
            )}
        >
            <Icon className={cn("size-3.5 shrink-0", config.iconClass)} strokeWidth={1.75} />
            <span>{config.label}</span>
        </div>
    );
}
