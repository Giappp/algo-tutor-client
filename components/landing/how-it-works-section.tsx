"use client";

import {Badge} from "@/components/ui/badge";
import {getIcon} from "@/lib/lucide-icons";
import type {HowItWorksStep} from "@/lib/types/landing";

export const MOCK_HOW_IT_WORKS: HowItWorksStep[] = [
    {
        id: "step-1",
        stepNumber: "01",
        title: "Learn the Theory",
        description:
            "Start with clear, visual explanations and pseudocode. Build mental models before writing a single line of code.",
        iconKey: "BookOpen",
    },
    {
        id: "step-2",
        stepNumber: "02",
        title: "Solve the Problem",
        description:
            "Tackle auto-graded coding exercises scoped strictly to the current topic. No spoilers, no advanced tricks.",
        iconKey: "Code2",
    },
    {
        id: "step-3",
        stepNumber: "03",
        title: "Get AI Hints",
        description:
            "Stuck? The AI tutor analyzes your code and gives contextual hints — nudging you forward without handing you the answer.",
        iconKey: "Lightbulb",
    },
];

export function HowItWorksSection() {
    // const {data: steps, isLoading} = useLandingData<HowItWorksStep[]>("/landing/how-it-works");

    return (
        <section id="how-it-works" className="py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-16 reveal-up">
                    <Badge variant="secondary" className="text-xs mb-3">
                        How It Works
                    </Badge>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                        Learn, practice, improve — repeat
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        A proven learning loop that takes you from confused to confident, one topic at a time.
                    </p>
                </div>

                <div className="relative">
                    <div
                        className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-transparent via-border to-transparent"/>

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {MOCK_HOW_IT_WORKS.map((step, i) => {
                            const Icon = getIcon(step.iconKey);
                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center text-center reveal-up"
                                    style={{transitionDelay: `${i * 120}ms`}}
                                >
                                    <div className="relative mb-6">
                                        <div
                                            className="size-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <Icon className="size-7 text-primary"/>
                                        </div>
                                        <div
                                            className="absolute -top-2 -right-2 size-6 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold flex items-center justify-center">
                                            {step.stepNumber}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
