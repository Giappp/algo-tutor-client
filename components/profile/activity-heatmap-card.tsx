"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ActivityHeatmapCardProps {
    contributions: Record<string, number>;
    totalContributions: number;
    maxStreak: number;
    currentStreak: number;
}

export function ActivityHeatmapCard({
    contributions,
    totalContributions,
    maxStreak,
    currentStreak,
}: ActivityHeatmapCardProps) {
    const today = new Date();
    const startDate = useMemo(() => {
        const date = new Date(today);
        date.setDate(today.getDate() - 364); // 52 weeks ago
        return date;
    }, []);

    // Generate grid items programmatically
    const gridItems = useMemo(() => {
        const items = [];
        const startDayOfWeek = startDate.getDay();

        for (let i = 0; i < 365; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            // Date key in YYYY-MM-DD
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, "0");
            const day = String(currentDate.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;

            const count = contributions[dateStr] || 0;

            const weekIndex = Math.floor((i + startDayOfWeek) / 7);
            const dayOfWeek = currentDate.getDay();

            items.push({
                dateStr,
                weekIndex,
                dayOfWeek,
                count,
            });
        }
        return items;
    }, [startDate, contributions]);

    // Color definitions based on contribution count matching GitHub's exactly
    const getSquareClass = (count: number) => {
        if (count === 0) return "fill-[#ebedf0] dark:fill-[#161b22]";
        if (count === 1) return "fill-[#9be9a8] dark:fill-[#0e4429]";
        if (count === 2) return "fill-[#40c463] dark:fill-[#006d32]";
        if (count === 3) return "fill-[#30a14e] dark:fill-[#26a641]";
        return "fill-[#216e39] dark:fill-[#39d353]";
    };

    // Label coordinates matching GitHub exactly
    const dayLabels = [
        { label: "Mon", yIndex: 1 },
        { label: "Wed", yIndex: 3 },
        { label: "Fri", yIndex: 5 },
    ];
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Group weeks by month for labels
    const monthLabels = useMemo(() => {
        const labels = [];
        let prevMonth = -1;

        for (let i = 0; i < 365; i += 7) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const currentMonth = date.getMonth();

            if (currentMonth !== prevMonth) {
                labels.push({
                    name: monthNames[currentMonth],
                    weekIndex: Math.floor(i / 7),
                });
                prevMonth = currentMonth;
            }
        }
        return labels;
    }, [startDate]);

    const rectSize = 10;
    const rectGap = 2;
    const paddingLeft = 32;
    const paddingTop = 20;

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
            {/* Header matching GitHub style */}
            <div className="flex items-baseline justify-between border-b border-border pb-3">
                <h3 className="text-sm font-semibold text-foreground">
                    Lịch sử đóng góp
                </h3>
                <span className="text-xs font-medium text-muted-foreground">
                    {totalContributions} đóng góp trong năm qua
                </span>
            </div>

            {/* Heatmap Responsive SVG Container */}
            <div className="overflow-x-auto pb-2 scrollbar-none">
                <div className="min-w-[650px]">
                    <svg viewBox="0 0 670 120" className="w-full">
                        {/* Month Labels */}
                        {monthLabels.map((lbl, idx) => (
                            <text
                                key={idx}
                                x={paddingLeft + lbl.weekIndex * (rectSize + rectGap)}
                                y={12}
                                className="text-[9px] fill-muted-foreground font-semibold"
                            >
                                {lbl.name}
                            </text>
                        ))}

                        {/* Alternate Day Labels */}
                        {dayLabels.map((item, idx) => (
                            <text
                                key={idx}
                                x={4}
                                y={paddingTop + item.yIndex * (rectSize + rectGap) + 8}
                                className="text-[9px] fill-muted-foreground font-semibold"
                            >
                                {item.label}
                            </text>
                        ))}

                        {/* Daily Squares */}
                        {gridItems.map((item, idx) => {
                            const x = paddingLeft + item.weekIndex * (rectSize + rectGap);
                            const y = paddingTop + item.dayOfWeek * (rectSize + rectGap);
                            const fillClass = getSquareClass(item.count);

                            return (
                                <g key={idx} className="group/day">
                                    <rect
                                        x={x}
                                        y={y}
                                        width={rectSize}
                                        height={rectSize}
                                        rx={1.5}
                                        className={cn("transition-colors duration-200 hover:stroke-zinc-400 dark:hover:stroke-zinc-500 hover:stroke-[1px]", fillClass)}
                                    />
                                    {/* SVG dynamic tooltip */}
                                    <title>
                                        {item.dateStr}: {item.count} đóng góp
                                    </title>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>

            {/* Footer details & color ramp matching GitHub exactly */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold pt-1 border-t border-border/40">
                <div className="flex items-center gap-4">
                    <span>Chuỗi đóng góp hiện tại: <strong className="text-foreground">{currentStreak} ngày</strong></span>
                    <span>Chuỗi lớn nhất: <strong className="text-foreground">{maxStreak} ngày</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <div className="flex gap-0.5">
                        <div className="size-2.5 rounded-xs bg-[#ebedf0] dark:bg-[#161b22] border border-border/10" />
                        <div className="size-2.5 rounded-xs bg-[#9be9a8] dark:bg-[#0e4429] border border-border/10" />
                        <div className="size-2.5 rounded-xs bg-[#40c463] dark:bg-[#006d32] border border-border/10" />
                        <div className="size-2.5 rounded-xs bg-[#30a14e] dark:bg-[#26a641] border border-border/10" />
                        <div className="size-2.5 rounded-xs bg-[#216e39] dark:bg-[#39d353] border border-border/10" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
