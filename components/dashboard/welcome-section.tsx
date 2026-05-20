"use client";

import {useUser} from "@/hooks/use-user";
import {useCurrentLesson} from "@/hooks/use-current-lesson";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import Link from "next/link";

export function WelcomeSection() {
    const {user} = useUser();
    const {currentLesson, isLoading, isError} = useCurrentLesson();

    // Subtitle logic
    let subtitle: React.ReactNode;
    let ctaHref: string = "/roadmaps";

    if (isLoading) {
        subtitle = <Skeleton className="h-5 w-72"/>;
    } else if (isError || !currentLesson) {
        subtitle =
            currentLesson === undefined && isError
                ? "Chào mừng bạn trở lại"
                : "Bắt đầu hành trình học thuật toán ngay hôm nay";
    } else {
        subtitle = `Tiếp tục hành trình trong ${currentLesson.roadmapName} - bạn đã hoàn thành ${currentLesson.completionPercentage}%`;
        ctaHref = `/learn/${currentLesson.roadmapSlug}/${currentLesson.lessonSlug}`;
    }

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Chào, {user?.username} 👋
            </h1>
            <span className="text-base text-muted-foreground">{subtitle}</span>
            <Link href={ctaHref}>
                <Button size="default" className="mt-3 w-fit gap-1.5">
                    Tiếp tục học
                </Button>
            </Link>
        </div>
    );
}
