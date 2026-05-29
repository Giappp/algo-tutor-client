"use client";

import { useUser } from "@/hooks/use-user";
import { useCurrentLesson } from "@/hooks/use-current-lesson";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { MapIcon, UserIcon, ArrowRightIcon } from "lucide-react";

export function WelcomeSection() {
    const { user } = useUser();
    const { currentLesson, isLoading, isError } = useCurrentLesson();

    // Subtitle logic
    let subtitle: React.ReactNode;
    let ctaHref: string = "/roadmaps";
    let showContinue = false;

    if (isLoading) {
        subtitle = <Skeleton className="h-5 w-72 bg-muted/60" />;
    } else if (isError || !currentLesson) {
        subtitle =
            currentLesson === undefined && isError
                ? "Chào mừng bạn trở lại"
                : "Bắt đầu hành trình học thuật toán ngay hôm nay";
    } else {
        subtitle = `Tiếp tục hành trình trong ${currentLesson.roadmapName} - bạn đã hoàn thành ${currentLesson.completionPercentage}%`;
        ctaHref = `/learn/${currentLesson.roadmapSlug}/${currentLesson.lessonSlug}`;
        showContinue = true;
    }

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/15 shadow-sm">
            <div className="flex flex-col gap-1.5 max-w-xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                    Chào, {user?.username} 👋
                </h1>
                <div className="text-sm sm:text-base text-muted-foreground font-medium">
                    {subtitle}
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 shrink-0">
                {showContinue && (
                    <Link href={ctaHref}>
                        <Button size="default" className="gap-2 shadow-md shadow-primary/20 hover:shadow-lg active:scale-95 transition-all duration-200">
                            <span>Tiếp tục học</span>
                            <ArrowRightIcon className="size-4 animate-pulse" />
                        </Button>
                    </Link>
                )}
                
                <Link href="/roadmaps">
                    <Button variant="outline" size="default" className="gap-2 border-border/80 hover:bg-muted/80 active:scale-95 transition-all duration-200">
                        <MapIcon className="size-4 text-primary" />
                        <span>Xem lộ trình</span>
                    </Button>
                </Link>
                
                <Link href="/profile">
                    <Button variant="ghost" size="default" className="gap-2 hover:bg-muted/80 active:scale-95 transition-all duration-200 text-muted-foreground hover:text-foreground">
                        <UserIcon className="size-4" />
                        <span>Xem hồ sơ</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
}
