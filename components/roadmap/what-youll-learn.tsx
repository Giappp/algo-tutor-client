"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface WhatYoullLearnProps {
    skills: string[];
    className?: string;
}

export function WhatYoullLearn({ skills, className }: WhatYoullLearnProps) {
    if (!skills.length) return null;

    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-3 rounded-xl border border-border/70 bg-card/70 p-5 shadow-sm shadow-foreground/5 sm:grid-cols-2",
                className
            )}
        >
            <h3 className="col-span-full mb-1 text-sm font-semibold text-foreground">
                Bạn sẽ học được gì
            </h3>
            {skills.map((skill, i) => (
                <div
                    key={i}
                    className="flex items-start gap-2.5"
                >
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 ring-1 ring-emerald-500/20">
                        <CheckIcon className="size-3 text-emerald-500" />
                    </div>
                    <span className="text-sm text-muted-foreground leading-relaxed">
                        {skill}
                    </span>
                </div>
            ))}
        </div>
    );
}
