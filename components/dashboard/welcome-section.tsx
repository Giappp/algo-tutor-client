"use client";

import { useUser } from "@/hooks/use-user";
import { useCurrentLesson } from "@/hooks/use-current-lesson";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowRightIcon, MapIcon, UserIcon } from "lucide-react";

export function WelcomeSection() {
    const { user } = useUser();
    const { currentLesson, isLoading, isError } = useCurrentLesson();

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
        <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-card shadow-sm">
            <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,oklch(0.7_0.18_195_/_0.18),transparent_28rem)] md:block" />
            <div className="relative flex flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex max-w-2xl flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Dashboard cá nhân
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                    {user?.username ? (
                        <>Xin chào, {user.username}</>
                    ) : (
                        <Skeleton className="h-9 w-56 bg-muted/60" />
                    )}
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
                            <ArrowRightIcon className="size-4" />
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
        </section>
    );
}
