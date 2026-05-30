"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { CalendarDaysIcon, FlameIcon, TrophyIcon } from "lucide-react";

import { fetcher } from "@/api/fetchers";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ActivityHeatmapData {
  year: number;
  data: ActivityDay[];
  totalLessons: number;
  currentStreak: number;
  longestStreak: number;
}

interface GridDay {
  date: string;
  count: number;
  isInYear: boolean;
  isFuture: boolean;
}

interface MonthLabel {
  month: number;
  weekIndex: number;
}

const DAYS_OF_WEEK = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MONTHS = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
];

const CELL_SIZE = 13;
const CELL_GAP = 3;

function getIntensityClass(count: number): string {
  if (count <= 0) {
    return "bg-muted";
  }

  if (count === 1) {
    return "bg-emerald-200 dark:bg-emerald-900";
  }

  if (count === 2) {
    return "bg-emerald-300 dark:bg-emerald-700";
  }

  if (count <= 4) {
    return "bg-emerald-500 dark:bg-emerald-500";
  }

  return "bg-emerald-700 dark:bg-emerald-400";
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function calculateStreaks(contributions: Record<string, number>) {
  const activeDates = Object.entries(contributions)
    .filter(([, count]) => Number(count) > 0)
    .map(([date]) => startOfLocalDay(new Date(`${date}T00:00:00`)))
    .sort((a, b) => a.getTime() - b.getTime());

  if (activeDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < activeDates.length; i++) {
    const prev = activeDates[i - 1];
    const current = activeDates[i];

    const diffDays = Math.round(
      (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      currentRun += 1;
    } else if (diffDays > 1) {
      longestStreak = Math.max(longestStreak, currentRun);
      currentRun = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentRun);

  const activeDateKeys = new Set(
    Object.entries(contributions)
      .filter(([, count]) => Number(count) > 0)
      .map(([date]) => date)
  );

  const today = startOfLocalDay(new Date());
  const yesterday = addDays(today, -1);

  let currentStreak = 0;
  let cursor = activeDateKeys.has(toDateKey(today)) ? today : yesterday;

  while (activeDateKeys.has(toDateKey(cursor))) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  };
}

function buildGrid(year: number, data: ActivityDay[]) {
  const countMap = new Map(data.map((item) => [item.date, item.count]));

  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  const today = startOfLocalDay(new Date());

  const startDay = startOfYear.getDay(); // 0 = Sunday, 1 = Monday
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  const gridStartDate = addDays(startOfYear, mondayOffset);

  const endDate =
    today.getFullYear() === year && today < endOfYear ? today : endOfYear;

  const grid: GridDay[][] = [];
  const monthLabels: MonthLabel[] = [];
  const seenMonths = new Set<number>();

  let cursor = new Date(gridStartDate);
  let weekIndex = 0;

  while (cursor <= endDate) {
    const week: GridDay[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dateKey = toDateKey(cursor);
      const isInYear = cursor.getFullYear() === year;
      const isFuture = cursor > today;

      if (isInYear && !seenMonths.has(cursor.getMonth())) {
        seenMonths.add(cursor.getMonth());
        monthLabels.push({
          month: cursor.getMonth(),
          weekIndex,
        });
      }

      week.push({
        date: dateKey,
        count: isInYear && !isFuture ? countMap.get(dateKey) ?? 0 : 0,
        isInYear,
        isFuture,
      });

      cursor = addDays(cursor, 1);
    }

    grid.push(week);
    weekIndex += 1;
  }

  return {
    grid,
    monthLabels,
  };
}

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-background/70 px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function ActivityHeatmapSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-14 w-24 rounded-xl" />
            <Skeleton className="h-14 w-24 rounded-xl" />
            <Skeleton className="h-14 w-24 rounded-xl" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border bg-muted/20 p-4">
          <div className="mb-3 ml-8 flex gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-8 rounded" />
            ))}
          </div>

          <div className="flex gap-2">
            <div className="flex w-7 shrink-0 flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} className="h-[13px] w-5 rounded" />
              ))}
            </div>

            <div className="flex gap-[3px] overflow-hidden">
              {Array.from({ length: 53 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <Skeleton
                      key={dayIndex}
                      className="size-[13px] rounded-[3px]"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityHeatmap() {
  const { user } = useUser();
  const year = new Date().getFullYear();

  const { data: heatmapDataResponse, isLoading } = useSWR<Record<string, number>>(
    user ? `/users/me/activity-heatmap?year=${year}` : null,
    fetcher
  );

  const heatmapData: ActivityHeatmapData = useMemo(() => {
    const rawData = heatmapDataResponse ?? {};

    const dataArray: ActivityDay[] = Object.entries(rawData).map(
      ([date, count]) => ({
        date,
        count: Number(count),
      })
    );

    const totalLessons = dataArray.reduce((sum, item) => sum + item.count, 0);
    const streaks = calculateStreaks(rawData);

    return {
      year,
      data: dataArray,
      totalLessons,
      currentStreak: user?.currentStreak ?? streaks.currentStreak,
      longestStreak: user?.maxStreak ?? streaks.longestStreak,
    };
  }, [heatmapDataResponse, user, year]);

  const { grid, monthLabels } = useMemo(() => {
    return buildGrid(year, heatmapData.data);
  }, [year, heatmapData.data]);

  const hasActivity = heatmapData.totalLessons > 0;

  if (isLoading) {
    return <ActivityHeatmapSkeleton />;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4 border-b bg-muted/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CalendarDaysIcon className="size-5 text-muted-foreground" />
              Hoạt động học tập
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              Theo dõi số bài học đã hoàn thành trong năm {year}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <StatItem
              icon={<CalendarDaysIcon className="size-3.5" />}
              label="Tổng bài"
              value={heatmapData.totalLessons}
            />

            <StatItem
              icon={<FlameIcon className="size-3.5 text-orange-500" />}
              label="Chuỗi hiện tại"
              value={`${heatmapData.currentStreak} ngày`}
            />

            <StatItem
              icon={<TrophyIcon className="size-3.5 text-yellow-500" />}
              label="Chuỗi dài nhất"
              value={`${heatmapData.longestStreak} ngày`}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {!hasActivity ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-10 text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <CalendarDaysIcon className="size-6 text-muted-foreground" />
            </div>

            <h3 className="text-sm font-semibold">
              Chưa có hoạt động học tập
            </h3>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Khi bạn hoàn thành bài học, dữ liệu sẽ được hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border bg-muted/10 p-4">
              <div
                className="min-w-max"
                style={{
                  "--cell-size": `${CELL_SIZE}px`,
                  "--cell-gap": `${CELL_GAP}px`,
                } as React.CSSProperties}
              >
                <div
                  className="mb-2 ml-8 grid text-xs text-muted-foreground"
                  style={{
                    gridTemplateColumns: `repeat(${grid.length}, var(--cell-size))`,
                    columnGap: "var(--cell-gap)",
                  }}
                >
                  {monthLabels.map((item) => (
                    <div
                      key={item.month}
                      className="whitespace-nowrap"
                      style={{
                        gridColumnStart: item.weekIndex + 1,
                      }}
                    >
                      {MONTHS[item.month]}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <div className="flex w-6 shrink-0 flex-col gap-[var(--cell-gap)]">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <div
                        key={day}
                        className="text-xs leading-[var(--cell-size)] text-muted-foreground"
                        style={{
                          height: "var(--cell-size)",
                          visibility: index % 2 === 0 ? "visible" : "hidden",
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <TooltipProvider delayDuration={80}>
                    <div className="flex gap-[var(--cell-gap)]">
                      {grid.map((week, weekIndex) => (
                        <div
                          key={weekIndex}
                          className="flex flex-col gap-[var(--cell-gap)]"
                        >
                          {week.map((day) => {
                            const isInactiveDay = !day.isInYear || day.isFuture;

                            return (
                              <Tooltip key={day.date}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    aria-label={`${day.count} bài hoàn thành vào ${formatDate(
                                      day.date
                                    )}`}
                                    disabled={isInactiveDay}
                                    className={cn(
                                      "size-[var(--cell-size)] rounded-[3px] border border-transparent outline-none transition-all",
                                      "hover:scale-110 hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                      getIntensityClass(day.count),
                                      isInactiveDay &&
                                      "cursor-default opacity-30 hover:scale-100"
                                    )}
                                  />
                                </TooltipTrigger>

                                {!isInactiveDay && (
                                  <TooltipContent
                                    side="top"
                                    align="center"
                                    className="space-y-1"
                                  >
                                    <p className="text-sm font-medium">
                                      {day.count > 0
                                        ? `${day.count} bài hoàn thành`
                                        : "Không có hoạt động"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(day.date)}
                                    </p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Mỗi ô đại diện cho một ngày. Màu càng đậm, số bài hoàn thành
                càng nhiều.
              </p>

              <div className="flex items-center gap-2 sm:justify-end">
                <span>Ít</span>

                {[0, 1, 2, 3, 5].map((count) => (
                  <span
                    key={count}
                    className={cn(
                      "size-[13px] rounded-[3px] border border-transparent",
                      getIntensityClass(count)
                    )}
                  />
                ))}

                <span>Nhiều</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}