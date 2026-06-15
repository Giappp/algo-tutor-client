"use client";

import {useApiData} from "@/hooks";
import {Card, CardContent} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {cn} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";
import type {Testimonial} from "@/lib/types/landing";
import {MOCK_TESTIMONIALS} from "@/lib/mock/landing-data";

const AVATAR_GRADIENTS = [
    "from-primary to-[oklch(0.65_0.15_340)]",
    "from-[oklch(0.7_0.18_85)] to-[oklch(0.65_0.15_340)]",
    "from-[oklch(0.6_0.18_180)] to-primary",
    "from-[oklch(0.65_0.15_340)] to-[oklch(0.7_0.18_250)]",
];

export function TestimonialsSection() {
    const {data: testimonials, isLoading, error} = useApiData<Testimonial[]>("/landing/testimonials");
    const visibleTestimonials = testimonials?.length ? testimonials : MOCK_TESTIMONIALS;

    return (
        <section className="py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-14 max-w-2xl text-center reveal-up">
                    <p className="mb-3 text-sm font-medium text-primary">Từ người học</p>
                    <h2 className="mb-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                        Tiến bộ đến từ việc hiểu đúng, không phải giải thật nhiều.
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Những thay đổi nhỏ trong cách học tạo ra nền tảng giải thuật bền vững hơn.
                    </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {isLoading
                        ? Array.from({length: 4}).map((_, i) => (
                            <Card key={i} className="border-border/50">
                                <CardContent className="p-5 space-y-4">
                                    <Skeleton className="h-4 w-24"/>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-full"/>
                                        <Skeleton className="h-4 w-5/6"/>
                                    </div>
                                    <Separator/>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="size-8 rounded-full"/>
                                        <div className="space-y-1">
                                            <Skeleton className="h-4 w-24"/>
                                            <Skeleton className="h-3 w-32"/>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                        : visibleTestimonials.map((t, i) => (
                            <Card
                                key={t.id}
                                className={cn(
                                    "border-border/50 reveal-up transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                                    i % 2 === 1 && "lg:translate-y-8 lg:hover:translate-y-7"
                                )}
                                style={{transitionDelay: `${i * 80}ms`}}
                            >
                                <CardContent className="p-5 space-y-4">
                                    {/* Stars */}
                                    <div className="flex gap-0.5">
                                        {Array.from({length: t.starRating}).map((_, j) => (
                                            <svg key={j} className="size-3.5 text-[oklch(0.7_0.18_85)] fill-current"
                                                 viewBox="0 0 24 24">
                                                <path
                                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                            </svg>
                                        ))}
                                    </div>

                                    <p className="text-sm text-foreground leading-relaxed">&quot;{t.content}&quot;</p>

                                    <Separator/>

                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "size-8 rounded-full bg-gradient-to-br flex items-center justify-center text-xs font-bold text-primary-foreground",
                                                AVATAR_GRADIENTS[t.avatarColorIndex % AVATAR_GRADIENTS.length]
                                            )}
                                        >
                                            {t.avatarInitials}
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold">{t.name}</div>
                                            <div className="text-xs text-muted-foreground">{t.role}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                </div>
                {error && !testimonials?.length && (
                    <p className="mt-12 text-center text-sm text-muted-foreground">
                        Đang hiển thị phản hồi mẫu trong khi kết nối dữ liệu nền tảng.
                    </p>
                )}
            </div>
        </section>
    );
}
