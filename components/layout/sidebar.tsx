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
} from "lucide-react";
import {useState} from "react";
import UserProfileCard from "@/components/layout/UserProfileCard";

const navItems = [
    {href: "/home", label: "Home", icon: HomeIcon},
    {href: "/roadmaps", label: "Roadmaps", icon: BookOpenIcon},
    {href: "/ai-tutor", label: "AI Tutor", icon: MessageSquareIcon},
    {href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon},
    {href: "/settings", label: "Settings", icon: SettingsIcon},
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "flex flex-col h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo Header */}
            <div className="flex items-center h-14 px-3 border-b border-sidebar-border shrink-0">
                <Link href="/home" className="flex items-center gap-2.5 group/logo">
                    <div
                        className="size-8 rounded-lg bg-primary flex items-center justify-center shrink-0 group-hover/logo:scale-110 transition-transform">
                        <BracesIcon className="size-4 text-primary-foreground"/>
                    </div>
                    {!collapsed && (
                        <span className="font-bold tracking-tight">
                            Algo<span className="text-primary">Tutor</span>
                        </span>
                    )}
                </Link>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                    {/* User Profile Card */}
                    {!collapsed && (
                        <UserProfileCard/>
                    )}
                    {/* Core Navigation */}
                    {!collapsed && (
                        <span
                            className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1.5 block">Navigation</span>
                    )}
                    <nav className="space-y-0.5">
                        {navItems.map((item) => {
                            const isActive =
                                pathname === item.href || pathname.startsWith(item.href + "/");
                            const NavIcon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                                        collapsed && "justify-center px-0",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <NavIcon className={cn("size-4 shrink-0", isActive && "text-primary")}/>
                                    {!collapsed && <span className="truncate">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Streak Card */}
                    {!collapsed && (
                        <div
                            className="rounded-xl bg-gradient-to-br from-[oklch(0.65_0.2_145)_0%] via-[oklch(0.65_0.18_85)_50%] to-[oklch(0.65_0.15_340)_100%] p-3 mt-3 text-primary-foreground">
                            <div className="flex items-center gap-2 mb-1">
                                <FlameIcon className="size-4"/>
                                <span className="text-xs font-semibold">5 Day Streak!</span>
                            </div>
                            <p className="text-[10px] opacity-80">Keep solving to build your streak</p>
                            <div className="mt-2 flex gap-1">
                                {[1, 2, 3, 4, 5].map((day) => (
                                    <div
                                        key={day}
                                        className="h-1.5 flex-1 rounded-full bg-primary-foreground/30"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Collapse Toggle */}
            <div className="p-3 border-t border-sidebar-border shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn("w-full", collapsed && "px-2")}
                >
                    {collapsed ? (
                        <ChevronRightIcon className="size-4"/>
                    ) : (
                        <>
                            <ChevronLeftIcon className="size-4 mr-2"/>
                            <span className="text-xs">Collapse</span>
                        </>
                    )}
                </Button>
            </div>
        </aside>
    );
}
