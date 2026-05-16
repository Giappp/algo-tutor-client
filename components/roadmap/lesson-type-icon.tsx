import { cn } from "@/lib/utils";
import type { LessonType } from "@/lib/types";
import { BookOpenIcon, HelpCircleIcon, Code2Icon } from "lucide-react";

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
        colorClass: string;
    }
> = {
    THEORY: {
        icon: BookOpenIcon,
        label: "Theory",
        colorClass: "bg-blue-500/15 text-blue-500 border-blue-500/25",
    },
    QUIZ: {
        icon: HelpCircleIcon,
        label: "Quiz",
        colorClass: "bg-amber-500/15 text-amber-500 border-amber-500/25",
    },
    CODING: {
        icon: Code2Icon,
        label: "Coding",
        colorClass: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
    },
};

export function LessonTypeIcon({
    type,
    showLabel = true,
    className,
}: LessonTypeIconProps) {
    const config = lessonTypeConfig[type];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium",
                config.colorClass,
                className
            )}
        >
            <Icon className="size-3.5 shrink-0" />
            {showLabel && <span>{config.label}</span>}
        </div>
    );
}
