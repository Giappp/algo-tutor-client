"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Progress} from "@/components/ui/progress";
import {Separator} from "@/components/ui/separator";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
    BookOpenIcon,
    BracesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    FlameIcon,
    GitBranchIcon,
    HashIcon,
    HomeIcon,
    MessageSquareIcon,
    NetworkIcon,
    SettingsIcon,
    TrophyIcon,
    TypeIcon,
    ZapIcon,
} from "lucide-react";
import {useState} from "react";

const roadmapTopics = [
    {label: "Arrays", icon: HashIcon, href: "/topics/arrays", color: "oklch(0.6 0.18 180)"},
    {label: "Strings", icon: TypeIcon, href: "/topics/strings", color: "oklch(0.55 0.2 250)"},
    {label: "Linked Lists", icon: GitBranchIcon, href: "/topics/linked-lists", color: "oklch(0.65 0.15 340)"},
    {label: "Trees", icon: NetworkIcon, href: "/topics/trees", color: "oklch(0.65 0.2 145)"},
    {label: "Graphs", icon: NetworkIcon, href: "/topics/graphs", color: "oklch(0.7 0.18 85)"},
    {label: "Dynamic Programming", icon: ZapIcon, href: "/topics/dp", color: "oklch(0.55 0.15 280)"},
];

const navItems = [
    {href: "/home", label: "Home", icon: HomeIcon},
    {href: "/problems", label: "Problems", icon: BookOpenIcon},
    {href: "/ai-tutor", label: "AI Tutor", icon: MessageSquareIcon},
    {href: "/leaderboard", label: "Leaderboard", icon: TrophyIcon},
    {href: "/settings", label: "Settings", icon: SettingsIcon},
];

const AVATAR_GRADIENTS = [
    "from-primary to-[oklch(0.65_0.15_340)]",
    "from-[oklch(0.7_0.18_85)] to-[oklch(0.65_0.15_340)]",
    "from-[oklch(0.6_0.18_180)] to-primary",
    "from-[oklch(0.65_0.15_340)] to-[oklch(0.7_0.18_250)]",
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [activeTopic, setActiveTopic] = useState("Arrays");

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
                        <span className="font-bold text-base tracking-tight">
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
                        <div
                            className="rounded-xl bg-gradient-to-br from-sidebar-accent to-sidebar p-3 ring-1 ring-sidebar-border mb-3">
                            <div className="flex items-center gap-2.5 mb-2">
                                <Avatar size="sm" className="shrink-0">
                                    <AvatarImage src="" alt="User avatar"/>
                                    <AvatarFallback
                                        className={cn("bg-gradient-to-br text-primary-foreground text-xs font-semibold", AVATAR_GRADIENTS[0])}>
                                        U
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold truncate text-sidebar-foreground">Username</p>
                                    <p className="text-[10px] text-muted-foreground truncate">Level 5 &middot; 1,250
                                        XP</p>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span>Progress</span>
                                    <span className="font-medium text-sidebar-foreground">42%</span>
                                </div>
                                <Progress value={42} className="h-1.5"/>
                            </div>
                        </div>
                    )}

                    {/* Roadmap Topics */}
                    {!collapsed && (
                        <div className="flex items-center justify-between px-2 mb-1.5">
                            <span
                                className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Roadmap</span>
                            <Link href="/roadmaps" className="text-[10px] font-medium text-primary hover:underline">
                                View all
                            </Link>
                        </div>
                    )}
                    <nav className="space-y-0.5">
                        {roadmapTopics.map((topic) => {
                            const isActive = activeTopic === topic.label;
                            const TopicIcon = topic.icon;
                            return (
                                <button
                                    key={topic.href}
                                    onClick={() => setActiveTopic(topic.label)}
                                    className={cn(
                                        "w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200",
                                        collapsed && "justify-center px-0",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                    )}
                                    title={collapsed ? topic.label : undefined}
                                >
                                    <div
                                        className={cn(
                                            "size-5 rounded-md flex items-center justify-center shrink-0 transition-colors",
                                            isActive ? "bg-primary/15" : "bg-sidebar-accent"
                                        )}
                                        style={{color: isActive ? topic.color : undefined}}
                                    >
                                        <TopicIcon className="size-3"/>
                                    </div>
                                    {!collapsed && <span className="truncate">{topic.label}</span>}
                                    {!collapsed && isActive && (
                                        <div className="ml-auto size-1.5 rounded-full bg-primary shrink-0"/>
                                    )}
                                </button>
                            );
                        })}
                    </nav>

                    <Separator className="my-2"/>

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
