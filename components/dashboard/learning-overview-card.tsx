"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenCheckIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  TargetIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentLesson } from "@/hooks/use-current-lesson";
import { useEnrollments } from "@/hooks/use-enrollments";

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function LearningOverviewCard() {
  const { currentLesson, isLoading: isCurrentLessonLoading } = useCurrentLesson();
  const { enrollments, isLoading: isEnrollmentsLoading, isError } = useEnrollments();

  const isLoading = isCurrentLessonLoading || isEnrollmentsLoading;
  const activeRoadmaps = enrollments.filter(
    (item) => item.completionPercentage < 100
  );
  const completedRoadmaps = enrollments.length - activeRoadmaps.length;
  const averageProgress = enrollments.length
    ? clampPercent(
        enrollments.reduce(
          (total, item) => total + item.completionPercentage,
          0
        ) / enrollments.length
      )
    : 0;

  const nextHref = currentLesson
    ? `/learn/${currentLesson.roadmapSlug}/${currentLesson.lessonSlug}`
    : "/roadmaps";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-5">
          <Skeleton className="h-20 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
          <Skeleton className="h-9 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b bg-muted/15 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <TargetIcon className="size-4 text-primary" />
          Tiêu điểm học tập
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {isError ? (
          <p className="text-sm text-muted-foreground">
            Chưa tải được tiến độ học tập từ máy chủ.
          </p>
        ) : currentLesson ? (
          <div className="rounded-xl border bg-background/70 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CircleDotIcon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Bài nên học tiếp
                </p>
                <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
                  {currentLesson.lessonTitle}
                </h3>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {currentLesson.roadmapName}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Tiến độ lộ trình</span>
                <span className="font-semibold tabular-nums">
                  {currentLesson.completionPercentage}%
                </span>
              </div>
              <Progress value={currentLesson.completionPercentage} />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <BookOpenCheckIcon className="size-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Chưa có bài đang học</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Chọn một lộ trình để dashboard có thể gợi ý bài tiếp theo.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border bg-background/70 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleDotIcon className="size-3.5" />
              Đang học
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {activeRoadmaps.length}
            </p>
          </div>
          <div className="rounded-xl border bg-background/70 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2Icon className="size-3.5" />
              Hoàn thành
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {completedRoadmaps}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tiến độ trung bình</span>
            <span className="font-semibold tabular-nums">{averageProgress}%</span>
          </div>
          <Progress value={averageProgress} />
        </div>

        <Button asChild className="w-full gap-2">
          <Link href={nextHref}>
            {currentLesson ? "Vào bài học tiếp theo" : "Khám phá lộ trình"}
            <ArrowRightIcon className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
