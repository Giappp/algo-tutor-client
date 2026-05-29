"use client";

import { cn } from "@/lib/utils";

interface DifficultyStat {
    solved: number;
    total: number;
}

interface StatsRadialChartsProps {
    solvedStats: {
        total: number;
        solved: number;
        easy: DifficultyStat;
        medium: DifficultyStat;
        hard: DifficultyStat;
    };
}

export function StatsRadialCharts({ solvedStats }: StatsRadialChartsProps) {
    const totalPercentage = Math.min(
        100,
        Math.round((solvedStats.solved / solvedStats.total) * 100)
    );

    const categories = [
        {
            key: "easy",
            title: "Dễ (Easy)",
            data: solvedStats.easy,
            color: "text-emerald-500",
            stroke: "#10b981",
            bgStroke: "var(--border)",
        },
        {
            key: "medium",
            title: "Trung bình (Medium)",
            data: solvedStats.medium,
            color: "text-yellow-500",
            stroke: "#eab308",
            bgStroke: "var(--border)",
        },
        {
            key: "hard",
            title: "Khó (Hard)",
            data: solvedStats.hard,
            color: "text-red-500",
            stroke: "#ef4444",
            bgStroke: "var(--border)",
        },
    ];

    // SVG parameters
    const size = 100;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2; // 46
    const circumference = 2 * Math.PI * radius; // 289.02

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            {/* Header / Solved Count */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Tổng quan tiến độ
                </h3>
                <div className="text-right flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-foreground tracking-tight">
                        {solvedStats.solved}/{solvedStats.total}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                        Bài đã giải ({totalPercentage}%)
                    </span>
                </div>
            </div>

            {/* Radial Charts Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                {categories.map((cat) => {
                    const percentage = Math.min(
                        100,
                        Math.round((cat.data.solved / cat.data.total) * 100)
                    );
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;

                    return (
                        <div key={cat.key} className="flex flex-col items-center text-center space-y-3">
                            <div className="relative size-[100px]">
                                <svg className="size-full -rotate-90">
                                    {/* Clean Flat Background Track Circle */}
                                    <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke="var(--muted)"
                                        strokeWidth={strokeWidth}
                                    />

                                    {/* Clean Flat Foreground Progress Circle */}
                                    <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke={cat.stroke}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>

                                {/* Center text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-foreground tracking-tight">
                                        {percentage}%
                                    </span>
                                    <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                                        Đã giải
                                    </span>
                                </div>
                            </div>

                            {/* Label Description */}
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-semibold text-foreground">{cat.title}</h4>
                                <p className="text-xs text-muted-foreground font-semibold">
                                    {cat.data.solved} / {cat.data.total} bài
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
