"use client";

import {useApiData} from "@/hooks";
import {Card, CardContent} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {getIcon} from "@/lib/lucide-icons";
import {Skeleton} from "@/components/ui/skeleton";
import type {Feature} from "@/lib/types/landing";
import {MOCK_FEATURES} from "@/lib/mock/landing-data";

export function FeaturesSection() {
    const {data: features, isLoading, error} = useApiData<Feature[]>("/landing/features");
    const visibleFeatures = MOCK_FEATURES;

    return (
        <section id="features" className="py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-14 max-w-3xl space-y-4 reveal-up">
                    <p className="text-sm font-medium text-primary">Một vòng học khép kín</p>
                    <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                        Bớt đoán mò. Biết mình đang học gì và vì sao.
                    </h2>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        AlgoTutor kết nối lý thuyết, bài tập, phản hồi và trợ giảng AI trong cùng một trải nghiệm.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                    {isLoading
                        ? Array.from({length: 4}).map((_, i) => (
                            <Card key={i} className="border-border/50 lg:col-span-6">
                                <CardContent className="p-6 space-y-4">
                                    <Skeleton className="size-12 rounded-xl"/>
                                    <Skeleton className="h-5 w-32"/>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full"/>
                                        <Skeleton className="h-4 w-3/4"/>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                        : visibleFeatures.map((feature, i) => {
                            const Icon = getIcon(feature.iconKey);
                            return (
                                <Card
                                    key={feature.id}
                                    className={cn(
                                        "group overflow-hidden border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 reveal-up",
                                        i === 0 || i === 3 ? "lg:col-span-7" : "lg:col-span-5",
                                        i > 3 && "hidden md:block lg:col-span-6"
                                    )}
                                    style={{transitionDelay: `${i * 80}ms`}}
                                >
                                    <CardContent className="relative space-y-5 p-7">
                                        <span className="absolute right-5 top-3 font-mono text-5xl font-semibold text-muted/70">
                                            0{i + 1}
                                        </span>
                                        <div
                                            className={cn("size-12 rounded-xl flex items-center justify-center", feature.bgToken)}>
                                            <Icon className={cn("size-6", feature.colorToken)}/>
                                        </div>
                                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                                        <p className="text-[0.9rem] text-muted-foreground leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    {error && !features?.length && (
                        <p className="col-span-full text-sm text-muted-foreground">
                            Đang hiển thị nội dung giới thiệu trong khi kết nối dữ liệu nền tảng.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
