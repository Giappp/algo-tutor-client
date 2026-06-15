"use client";

import {ArrowRight, BrainCircuit, CheckCircle2, PlayCircle, Zap} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {useApiData} from "@/hooks";
import {Skeleton} from "@/components/ui/skeleton";
import type {PlatformStats} from "@/lib/types/landing";
import Link from "next/link";
import {MOCK_STATS} from "@/lib/mock/landing-data";

function HeroBanner() {
    return (
        <div className="relative w-full max-w-2xl mx-auto hidden md:block" aria-hidden="true">
            <div className="absolute inset-0 bg-primary/20 orb-primary rounded-full blur-3xl"/>

            <div className="relative code-border rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/40">
                    <div className="flex gap-1.5">
                        <div className="size-3 rounded-full bg-[oklch(0.65_0.2_25)]"/>
                        <div className="size-3 rounded-full bg-[oklch(0.7_0.18_85)]"/>
                        <div className="size-3 rounded-full bg-[oklch(0.65_0.2_145)]"/>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 font-mono">two-sum.js</span>
                </div>

                <div className="grid grid-cols-2 divide-x divide-border/50">
                    <div className="p-4 font-mono text-xs leading-relaxed">
                        <div className="space-y-1">
                            <div>
                                <span className="text-[oklch(0.55_0.15_250)]">function</span>{" "}
                                <span className="text-[oklch(0.7_0.18_195)]">twoSum</span>
                                <span className="text-[oklch(0.9_0_0)]">(</span>
                                <span className="text-[oklch(0.6_0.12_280)]">nums</span>,
                                <span className="text-[oklch(0.9_0_0)]"> </span>
                                <span className="text-[oklch(0.6_0.12_280)]">target</span>
                                <span className="text-[oklch(0.9_0_0)]">) {"{"}</span>
                            </div>
                            <div className="pl-4">
                                <span className="text-[oklch(0.55_0.15_250)]">const</span>{" "}
                                <span className="text-[oklch(0.6_0.12_280)]">map</span>
                                <span className="text-[oklch(0.9_0_0)]"> = </span>
                                <span className="text-[oklch(0.55_0.15_250)]">new</span>{" "}
                                <span className="text-[oklch(0.7_0.18_195)]">Map</span>
                                <span className="text-[oklch(0.9_0_0)]">();</span>
                            </div>
                            <div className="pl-4">
                                <span className="text-[oklch(0.55_0.15_250)]">for</span>
                                <span className="text-[oklch(0.9_0_0)]">(</span>
                                <span className="text-[oklch(0.55_0.15_250)]">let</span>{" "}
                                <span className="text-[oklch(0.6_0.12_280)]">i</span>
                                <span className="text-[oklch(0.9_0_0)]"> = </span>
                                <span className="text-[oklch(0.8_0.1_30)]">0</span>
                                <span className="text-[oklch(0.9_0_0)]">; ...)</span>
                            </div>
                            <div className="pl-8">
                                <span className="text-[oklch(0.55_0.15_250)]">const</span>{" "}
                                <span className="text-[oklch(0.6_0.12_280)]">complement</span>
                                <span className="text-[oklch(0.9_0_0)]"> = </span>
                                <span className="text-[oklch(0.6_0.12_280)]">target</span>
                                <span className="text-[oklch(0.9_0_0)]"> - </span>
                                <span className="text-[oklch(0.6_0.12_280)]">nums</span>
                                <span className="text-[oklch(0.9_0_0)]">[</span>
                                <span className="text-[oklch(0.6_0.12_280)]">i</span>
                                <span className="text-[oklch(0.9_0_0)]">];</span>
                            </div>
                            <div className="pl-8">
                                <span className="text-[oklch(0.55_0.15_250)]">if</span>
                                <span className="text-[oklch(0.9_0_0)]">(</span>
                                <span className="text-[oklch(0.6_0.12_280)]">map</span>
                                <span className="text-[oklch(0.9_0_0)]">.</span>
                                <span className="text-[oklch(0.7_0.18_195)]">has</span>
                                <span className="text-[oklch(0.9_0_0)]">(</span>
                                <span className="text-[oklch(0.6_0.12_280)]">complement</span>
                                <span className="text-[oklch(0.9_0_0)]">)) ...</span>
                            </div>
                            <div className="pl-4 text-muted-foreground">
                                <span className="text-[oklch(0.6_0.12_280)]">map</span>
                                <span className="text-[oklch(0.9_0_0)]">.</span>
                                <span className="text-[oklch(0.7_0.18_195)]">set</span>
                                <span className="text-[oklch(0.9_0_0)]">(nums[i], i);</span>
                            </div>
                            <div className="text-[oklch(0.9_0_0)]">{"}"}</div>
                        </div>
                    </div>

                    <div className="p-4 bg-primary/[0.03]">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                                <BrainCircuit className="size-3.5 text-primary-foreground"/>
                            </div>
                            <span className="text-xs font-semibold text-primary">AI Tutor</span>
                        </div>
                        <div className="space-y-2">
                            <div className="bg-card rounded-lg p-3 border border-border/50 shadow-sm">
                                <p className="text-xs text-card-foreground leading-relaxed">
                                    <span className="text-primary font-medium">Gợi ý: </span>
                                    Hash map giúp tra cứu phần bù trong O(1). Với mỗi phần tử, bạn đang cần tìm giá trị nào?
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <svg className="size-3.5 text-[oklch(0.65_0.2_145)]" fill="currentColor"
                                     viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span className="text-xs text-muted-foreground">Gợi ý theo từng bước, không lộ đáp án</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute -top-6 -left-10 size-12 float-slow opacity-40">
                <svg viewBox="0 0 48 48" fill="none" className="text-primary">
                    <circle cx="24" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="36" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="36" cy="36" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="24" y1="18" x2="12" y2="30" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="24" y1="18" x2="36" y2="30" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
            </div>
            <div className="absolute -bottom-4 -right-8 size-10 float-medium opacity-30">
                <svg viewBox="0 0 40 40" fill="none" className="text-[oklch(0.7_0.18_85)]">
                    <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="16" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="28" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="4" y="16" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="16" y="16" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="28" y="16" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
            </div>
            <div className="absolute top-1/2 -right-16 size-8 float-fast opacity-25">
                <svg viewBox="0 0 32 32" fill="none" className="text-[oklch(0.65_0.15_340)]">
                    <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="6" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="26" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="6" cy="24" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="26" cy="24" r="3" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="16" y1="13" x2="6" y2="11" stroke="currentColor" strokeWidth="1"/>
                    <line x1="16" y1="13" x2="26" y2="11" stroke="currentColor" strokeWidth="1"/>
                    <line x1="16" y1="19" x2="6" y2="21" stroke="currentColor" strokeWidth="1"/>
                    <line x1="16" y1="19" x2="26" y2="21" stroke="currentColor" strokeWidth="1"/>
                </svg>
            </div>
        </div>
    );
}

export function HeroSection() {
    const {data: stats, isLoading} = useApiData<PlatformStats>("/landing/stats");

    const visibleStats = stats ?? MOCK_STATS;
    const studentCount = `${Math.floor(visibleStats.totalStudents / 1000)}K+`;
    const problemCount = `${visibleStats.totalProblems.toLocaleString("vi-VN")}+`;
    const topicCount = `${visibleStats.totalTopics}`;

    return (
        <section className="relative flex min-h-dvh items-center overflow-hidden pt-16">
            <div className="absolute inset-0 bg-dotgrid opacity-25"/>
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 orb-primary rounded-full blur-3xl"/>
            <div
                className="absolute bottom-20 right-1/4 w-72 h-72 bg-[oklch(0.65_0.15_340)]/10 orb-primary rounded-full blur-3xl"/>

            <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
                <div className="grid items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
                    {/* Left: Text content */}
                    <div className="space-y-7">
                        <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
                            <Zap className="size-3.5 text-primary"/>
                            Nền tảng học thuật toán thông minh
                        </Badge>

                        <h1 className="max-w-xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                            Học thuật toán theo một lộ trình{" "}
                            <span className="text-primary">thật sự rõ ràng.</span>
                        </h1>

                        <p className="max-w-xl text-pretty text-lg leading-8 text-muted-foreground">
                            Hiểu lý thuyết, luyện code ngay trong bài học và nhờ AI Tutor gợi ý đúng lúc, không đưa sẵn lời giải.
                        </p>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button size="lg" className="h-12 gap-2 px-6 text-base shadow-lg shadow-primary/20" asChild>
                                <Link href="/auth?tab=signup">
                                    Bắt đầu học miễn phí
                                    <ArrowRight className="size-4"/>
                                </Link>
                            </Button>
                            <Button variant="ghost" size="lg" className="h-12 justify-start gap-2 px-3 text-base" asChild>
                                <a href="#ai-tutor">
                                    <PlayCircle className="size-4"/>
                                    Xem cách AI Tutor hỗ trợ
                                </a>
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1 text-sm text-muted-foreground">
                            {["Không cần thẻ thanh toán", "Lưu tiến độ học", "Gợi ý theo ngữ cảnh"].map((item) => (
                                <span key={item} className="flex items-center gap-1.5">
                                    <CheckCircle2 className="size-4 text-difficulty-easy"/>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-5">
                        <HeroBanner/>
                        <div className="grid grid-cols-3 gap-3" aria-label="Thống kê nền tảng">
                            {[
                                {value: studentCount, label: "học viên"},
                                {value: problemCount, label: "bài tập"},
                                {value: topicCount, label: "chủ đề"},
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-xl border border-border/70 bg-card/70 px-3 py-3 text-center backdrop-blur-sm">
                                    {isLoading ? <Skeleton className="mx-auto mb-1 h-6 w-14"/> : <strong className="block font-mono text-lg">{stat.value}</strong>}
                                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-background to-transparent"/>
        </section>
    );
}
