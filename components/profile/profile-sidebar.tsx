"use client";

import { FlameIcon, CalendarIcon, AwardIcon } from "lucide-react";
import { UserProfile } from "@/lib/types";

interface ProfileSidebarProps {
    user: UserProfile;
}

export function ProfileSidebar({ user }: ProfileSidebarProps) {
    const xpPercentage = Math.min(
        100,
        Math.round((user.currentXp / user.nextLevelXp) * 100)
    );

    const formattedDate = new Date(user.joinedDate || "").toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="space-y-6">
            {/* User Identity Card - Simplified Clean Design */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Clean Avatar Frame */}
                    <div className="relative">
                        <div className="relative size-24 rounded-full border border-border overflow-hidden bg-muted flex items-center justify-center">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-muted-foreground bg-muted size-full flex items-center justify-center">
                                    {user.username.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        {/* Level badge */}
                        <div className="absolute -bottom-1 -right-1 bg-secondary text-secondary-foreground font-semibold text-xs px-2.5 py-0.5 rounded-full border border-border shadow-sm flex items-center gap-0.5">
                            <AwardIcon className="size-3 text-primary" />
                            <span>Lv.{user.level}</span>
                        </div>
                    </div>

                    {/* Name & Title */}
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold tracking-tight text-foreground">
                            {user.username}
                        </h2>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="w-full space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-medium text-muted-foreground">
                            <span>Kinh nghiệm (XP)</span>
                            <span>{user.currentXp.toLocaleString()} / {user.nextLevelXp.toLocaleString()} XP</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${xpPercentage}%` }}
                            />
                        </div>
                        <p className="text-[10px] text-muted-foreground text-right font-semibold">
                            {xpPercentage}% hoàn thành cấp độ
                        </p>
                    </div>

                    {/* Details Info */}
                    <div className="w-full border-t border-border pt-4 space-y-2.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2.5">
                            <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
                            <span>Tham gia từ: <strong>{formattedDate}</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Streak Card - Simplified & Balanced */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1 flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Học tập hàng ngày
                        </h3>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-foreground tracking-tight">
                                {user.streakCount}
                            </span>
                            <span className="text-sm font-semibold text-muted-foreground">Ngày liên tiếp</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-normal mt-1">
                            Còn <strong>{user.nextStreakGoal} ngày</strong> để đạt mốc khen thưởng kế tiếp!
                        </p>
                    </div>

                    {/* Clean Simple Fire emblem */}
                    <div className="shrink-0">
                        <div className="size-12 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 flex items-center justify-center border border-orange-500/20 shadow-xs">
                            <FlameIcon className="size-6 text-orange-500" />
                        </div>
                    </div>
                </div>

                {/* Micro-Progress Bar for Streak Goal */}
                <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden relative">
                    <div
                        className="h-full rounded-full bg-orange-500"
                        style={{ width: `${Math.min(100, Math.round((user.streakCount / (user.streakCount + user.nextStreakGoal)) * 100))}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
