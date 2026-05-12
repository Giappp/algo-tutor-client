"use client";

import {Badge} from "@/components/ui/badge";
import type {FaqItem} from "@/lib/types/landing";

export const MOCK_FAQS: FaqItem[] = [
    {
        id: "faq-1",
        question: "Do I need prior coding experience?",
        answer:
            "Not at all. Our Arrays & Strings roadmap starts from absolute zero. We assume no prior knowledge of algorithms — just basic programming syntax.",
        order: 1,
    },
    {
        id: "faq-2",
        question: "How does the AI tutor work?",
        answer:
            "The AI tutor analyzes your submitted code using a vector database and an LLM. It understands the current lesson context and provides hints that are scoped to what you've already learned — never spoiling advanced solutions.",
        order: 2,
    },
    {
        id: "faq-3",
        question: "Is AlgoTutor free?",
        answer:
            "Yes! The core learning experience — all roadmaps, theory lessons, and coding problems — is completely free. A premium tier adds advanced analytics, mentorship, and personalized study plans.",
        order: 3,
    },
    {
        id: "faq-4",
        question: "How are problems graded?",
        answer:
            "Every problem is auto-graded against a suite of test cases covering edge cases, performance, and correctness. You'll see detailed feedback for each failing test case.",
        order: 4,
    },
    {
        id: "faq-5",
        question: "Can I track my progress?",
        answer:
            "Absolutely. Your (dashboard) shows completion rates per topic, streaks, difficulty distribution, and hints consumed — giving you a clear picture of your strengths and areas to improve.",
        order: 5,
    },
];

export function FaqSection() {
    return (
        <section id="pricing" className="py-24 lg:py-32 bg-muted/10">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 reveal-up">
                    <Badge variant="secondary" className="text-xs mb-3">
                        FAQ
                    </Badge>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                        Common questions
                    </h2>
                </div>

                <div className="space-y-1 reveal-up">
                    {MOCK_FAQS.map((faq) => (
                        <div
                            key={faq.id}
                            className="border border-border/50 rounded-xl overflow-hidden bg-card hover:border-primary/20 transition-colors"
                        >
                            <details className="group">
                                <summary
                                    className="flex items-center justify-between cursor-pointer p-5 list-none select-none">
                                    <span className="font-medium text-sm pr-4">{faq.question}</span>
                                    <svg
                                        className="size-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-90"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </summary>
                                <div className="px-5 pb-5">
                                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
