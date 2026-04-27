"use client";

import {useLandingData} from "@/hooks";
import {Badge} from "@/components/ui/badge";
import {getIcon} from "@/lib/lucide-icons";
import {Skeleton} from "@/components/ui/skeleton";
import type {HowItWorksStep} from "@/lib/types/landing";

export function HowItWorksSection() {
    const {data: steps, isLoading} = useLandingData<HowItWorksStep[]>("/landing/how-it-works");

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
                        {isLoading
                            ? Array.from({length: 3}).map((_, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-4">
                                    <Skeleton className="size-16 rounded-2xl"/>
                                    <Skeleton className="h-6 w-40"/>
                                    <Skeleton className="h-4 w-64"/>
                                </div>
                            ))
                            : steps?.map((step, i) => {
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
