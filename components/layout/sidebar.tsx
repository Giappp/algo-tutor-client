"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    BookOpenIcon,
    BracesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FlameIcon,
    HomeIcon,
    MessageSquareIcon,
    SettingsIcon,
    TrophyIcon,
    GraduationCapIcon,
} from "lucide-react";
import {useState} from "react";
import UserProfileCard from "@/components/layout/UserProfileCard";
import {useUser} from "@/hooks/use-user";

const navItems = [
    {href: "/home", label: "Trang chủ", icon: HomeIcon},
    {href: "/roadmaps", label: "Lộ trình", icon: BookOpenIcon},
    {href: "/my-roadmaps", label: "Khóa học của tôi", icon: GraduationCapIcon},
    {href: "/ai-tutor", label: "AI Tutor", icon: MessageSquareIcon},
    {href: "/leaderboard", label: "Bảng xếp hạng", icon: TrophyIcon},
    {href: "/settings", label: "Cài đặt", icon: SettingsIcon},
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const {user} = useUser();
    const currentStreak = user?.currentStreak ?? 0;
    const visibleStreakDays = Math.max(1, Math.min(currentStreak, 7));

    return (
        <aside
            className={cn(
                "flex flex-col h-screen border-r border-sidebar-border/50 bg-sidebar transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo Header */}
            <div className="flex items-center h-14 px-4 border-b border-sidebar-border/50 shrink-0">
                <Link href="/home" className="flex items-center gap-2.5 group/logo">
                    <div
                        className="size-9 rounded-xl bg-primary flex items-center justify-center shrink-0 group-hover/logo:scale-105 transition-transform">
                        <BracesIcon className="size-4.5 text-primary-foreground"/>
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold tracking-tight">
                            Algo<span className="text-primary">Tutor</span>
                        </span>
                    )}
                </Link>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-1.5">
                    {/* User Profile Card */}
                    {!collapsed && (
                        <UserProfileCard/>
                    )}
                    {/* Core Navigation */}
                    {!collapsed && (
                        <span
                            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5 mb-2 block">
                            Điều hướng
                        </span>
                    )}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.href || pathname.startsWith(item.href + "/");
                            const NavIcon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                        collapsed && "justify-center px-0",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <NavIcon className={cn("size-[18px] shrink-0", isActive && "text-primary")}/>
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Streak Card */}
                    {!collapsed && (
                        <div
                            className="rounded-xl bg-gradient-to-br from-[oklch(0.65_0.2_145)] via-[oklch(0.65_0.18_85)] to-[oklch(0.65_0.15_340)] p-3.5 mt-4 text-primary-foreground">
                            <div className="flex items-center gap-2 mb-1.5">
                                <FlameIcon className="size-4.5"/>
                                <span className="text-sm font-semibold">
                                    {currentStreak > 0
                                        ? `Chuỗi ${currentStreak.toLocaleString("vi-VN")} ngày`
                                        : "Chưa có chuỗi ngày"}
                                </span>
                            </div>
                            <p className="text-xs opacity-85">
                                {currentStreak > 0
                                    ? "Tiếp tục học để giữ nhịp hiện tại"
                                    : "Hoàn thành một bài học để bắt đầu chuỗi"}
                            </p>
                            <div className="mt-2.5 flex gap-1">
                                {Array.from({length: visibleStreakDays}).map((_, day) => (
                                    <div
                                        key={day}
                                        className="h-2 flex-1 rounded-full bg-primary-foreground/30"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Collapse Toggle */}
            <div className="p-3 border-t border-sidebar-border/50 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn("w-full h-9", collapsed && "px-2")}
                >
                    {collapsed ? (
                        <ChevronRightIcon className="size-4"/>
                    ) : (
                        <>
                            <ChevronLeftIcon className="size-4 mr-2"/>
                            <span className="text-sm">Thu gọn</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
