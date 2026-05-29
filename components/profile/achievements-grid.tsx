"use client";

import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string; // Lucide icon name
    color: string; // Tailwind color theme
    unlockedAt: string;
}

interface AchievementsGridProps {
    achievements: Achievement[];
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
    const totalBadges = achievements.length;

    // Helper to resolve dynamic Lucide icons
    const renderIcon = (iconName: string, className: string) => {
        const IconComponent = (LucideIcons as any)[iconName];
        if (!IconComponent) return <LucideIcons.AwardIcon className={className} />;
        return <IconComponent className={className} />;
    };

    const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
        emerald: {
            bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
            text: "text-emerald-500",
            border: "border-emerald-500/20",
        },
        pink: {
            bg: "bg-pink-500/10 dark:bg-pink-500/15",
            text: "text-pink-500",
            border: "border-pink-500/20",
        },
        blue: {
            bg: "bg-blue-500/10 dark:bg-blue-500/15",
            text: "text-blue-500",
            border: "border-blue-500/20",
        },
        amber: {
            bg: "bg-amber-500/10 dark:bg-amber-500/15",
            text: "text-amber-500",
            border: "border-amber-500/20",
        },
        purple: {
            bg: "bg-purple-500/10 dark:bg-purple-500/15",
            text: "text-purple-500",
            border: "border-purple-500/20",
        },
        cyan: {
            bg: "bg-cyan-500/10 dark:bg-cyan-500/15",
            text: "text-cyan-500",
            border: "border-cyan-500/20",
        },
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Huy hiệu danh hiệu
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                    Tổng số: {totalBadges}
                </span>
            </div>

            {/* Badges Layout Grid - Simplified Flat Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((badge) => {
                    const theme = colorClasses[badge.color] || colorClasses.blue;

                    return (
                        <div
                            key={badge.id}
                            className="flex items-start gap-3.5 p-4 rounded-xl border border-border bg-card hover:bg-muted/10 transition-colors duration-200 cursor-default group"
                        >
                            {/* Icon frame container */}
                            <div
                                className={cn(
                                    "size-10 rounded-lg flex items-center justify-center border shrink-0",
                                    theme.bg,
                                    theme.text,
                                    theme.border
                                )}
                            >
                                {renderIcon(badge.icon, "size-5")}
                            </div>

                            {/* Badge details */}
                            <div className="space-y-1 overflow-hidden">
                                <h4 className="text-sm font-bold text-foreground truncate">
                                    {badge.name}
                                </h4>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                    {badge.description}
                                </p>
                                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider pt-0.5">
                                    Đạt ngày: {new Date(badge.unlockedAt).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
