"use client";

import type { Submission } from "@/lib/types/lesson";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubmissionRow } from "@/components/learn/judge";
import { HistoryIcon } from "lucide-react";

interface SubmissionHistoryProps {
    submissions: Submission[];
}

export function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
                {submissions.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-muted-foreground">
                        <HistoryIcon className="size-8 mb-2 opacity-30" />
                        <p className="text-base">No submissions yet</p>
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <SubmissionRow key={sub.id} submission={sub} />
                    ))
                )}
            </div>
        </ScrollArea>
    );
}
