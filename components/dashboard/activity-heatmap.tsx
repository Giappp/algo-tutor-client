"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlameIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";
import useSWR from "swr";
import { fetcher } from "@/api/fetchers";
import { Skeleton } from "@/components/ui/skeleton";

// ─── API Description ────────────────────────────────────────────────────────
// GET /api/users/me/activity-heatmap?year=2025
//
// Response:
// {
//   "year": 2025,
//   "data": [
//     { "date": "2025-01-01", "count": 2 },
//     { "date": "2025-01-03", "count": 1 },
//     ...
//   ],
//   "totalLessons": 42,
//   "currentStreak": 5,
//   "longestStreak": 12
// }
//
// - date: ngày hoạt động (format YYYY-MM-DD)
// - count: số lesson đã hoàn thành trong ngày đó (dựa theo lesson progress)
// - totalLessons: tổng số lesson đã hoàn thành trong năm
// - currentStreak: chuỗi ngày liên tiếp hiện tại
// - longestStreak: chuỗi ngày liên tiếp dài nhất
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number; // số lesson hoàn thành
}

export interface ActivityHeatmapData {
  year: number;
  data: ActivityDay[];
  totalLessons: number;
  currentStreak: number;
  longestStreak: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────
function generateMockData(year: number): ActivityHeatmapData {
  const data: ActivityDay[] = [];
  const today = new Date();
  const startOfYear = new Date(year, 0, 1);

  const endDate = today.getFullYear() === year ? today : new Date(year, 11, 31);

  let current = new Date(startOfYear);
  while (current <= endDate) {
    // ~40% chance of activity on any given day
    if (Math.random() > 0.6) {
      data.push({
        date: current.toISOString().split("T")[0],
        count: Math.floor(Math.random() * 5) + 1,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return {
    year,
    data,
    totalLessons: data.reduce((sum, d) => sum + d.count, 0),
    currentStreak: 5,
    longestStreak: 12,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTHS = [
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
];

function getIntensityClass(count: number): string {
  if (count === 0) return "bg-muted";
  if (count === 1) return "bg-[oklch(0.75_0.15_145)]";
  if (count === 2) return "bg-[oklch(0.65_0.18_145)]";
  if (count <= 4) return "bg-[oklch(0.55_0.2_145)]";
  return "bg-[oklch(0.45_0.2_145)]";
}

function calculateStreaks(contributions: Record<string, number>) {
  const dates = Object.keys(contributions)
    .filter((dateStr) => contributions[dateStr] > 0)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let longest = 0;
  let prevDate: Date | null = null;
  let tempStreak = 0;

  for (const d of dates) {
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = d.getTime() - prevDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longest) {
          longest = tempStreak;
        }
        tempStreak = 1;
      }
    }
    prevDate = d;
  }
  if (tempStreak > longest) {
    longest = tempStreak;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const activeDateStrings = new Set(
    Object.keys(contributions).filter((dateStr) => contributions[dateStr] > 0)
  );

  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  let current = 0;

  if (activeDateStrings.has(todayStr) || activeDateStrings.has(yesterdayStr)) {
    let checkDate = activeDateStrings.has(todayStr) ? today : yesterday;
    let count = 0;
    while (true) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (activeDateStrings.has(checkStr)) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    current = count;
  }

  return { currentStreak: current, longestStreak: Math.max(longest, current) };
}

export function ActivityHeatmap() {
  const { user } = useUser();
  const year = new Date().getFullYear();

  const { data: heatmapDataResponse, isLoading } = useSWR<Record<string, number>>(
    user ? `/users/me/activity-heatmap?year=${year}` : null,
    fetcher
  );

  const heatmapData = useMemo(() => {
    const rawData = heatmapDataResponse || {};
    const dataArray: ActivityDay[] = Object.entries(rawData).map(([date, count]) => ({
      date,
      count: Number(count),
    }));

    const totalLessons = dataArray.reduce((sum, d) => sum + d.count, 0);
    const streaks = calculateStreaks(rawData);

    return {
      year,
      data: dataArray,
      totalLessons,
      currentStreak: user?.currentStreak ?? streaks.currentStreak ?? 0,
      longestStreak: user?.maxStreak ?? streaks.longestStreak ?? 0,
    };
  }, [heatmapDataResponse, year, user]);

  const { grid, monthLabels } = useMemo(() => {
    return buildGrid(year, heatmapData.data);
  }, [year, heatmapData.data]);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36 rounded-md" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-32 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-1 mb-2 ml-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-8 rounded" />
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1.5 w-7 shrink-0">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-3 w-5 rounded" />
                ))}
              </div>
              <div className="flex gap-[3px] flex-1 overflow-hidden">
                {Array.from({ length: 53 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-[3px]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <Skeleton key={j} className="size-[12px] rounded-[2px] shrink-0" />
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Hoạt động học tập</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <FlameIcon className="size-4 text-[oklch(0.65_0.2_30)]" />
              Chuỗi: {heatmapData.currentStreak} ngày
            </span>
            <span>{heatmapData.totalLessons} bài trong năm {year}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((m) => (
              <span
                key={m.month}
                className="text-sm text-muted-foreground"
                style={{ marginLeft: `${m.offset}px` }}
              >
                {MONTHS[m.month]}
              </span>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day-of-week labels */}
            <div className="flex flex-col gap-0.5 mr-1 shrink-0">
              {DAYS_OF_WEEK.map((day, i) => (
                <span
                  key={day}
                  className="text-sm text-muted-foreground h-[14px] leading-[14px] w-7"
                  style={{ visibility: i % 2 === 0 ? "visible" : "hidden" }}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Heatmap grid */}
            <TooltipProvider delayDuration={100}>
              <div className="flex gap-[3px]">
                {grid.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-[3px]">
                    {week.map((day) => (
                      <Tooltip key={day.date}>
                        <TooltipTrigger asChild>
                          <div
                            className={`size-[12px] rounded-[2px] transition-colors ${getIntensityClass(day.count)}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-sm">
                          <p className="font-medium">
                            {day.count > 0
                              ? `${day.count} bài hoàn thành`
                              : "Không có hoạt động"}
                          </p>
                          <p className="text-muted-foreground">{formatDate(day.date)}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-sm text-muted-foreground">Ít</span>
            {[0, 1, 2, 3, 5].map((count) => (
              <div
                key={count}
                className={`size-[14px] rounded-[2px] ${getIntensityClass(count)}`}
              />
            ))}
            <span className="text-sm text-muted-foreground">Nhiều</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

interface GridDay {
  date: string;
  count: number;
}

function buildGrid(year: number, data: ActivityDay[]) {
  const countMap = new Map(data.map((d) => [d.date, d.count]));

  const startOfYear = new Date(year, 0, 1);
  const today = new Date();
  const endDate = today.getFullYear() === year ? today : new Date(year, 11, 31);

  // Adjust start to previous Monday (week starts on Monday)
  const startDay = startOfYear.getDay(); // 0=Sun, 1=Mon...
  const adjustedStart = new Date(startOfYear);
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  adjustedStart.setDate(adjustedStart.getDate() + mondayOffset);

  const grid: GridDay[][] = [];
  const monthLabels: { month: number; offset: number }[] = [];
  let lastMonth = -1;

  let current = new Date(adjustedStart);
  while (current <= endDate) {
    const week: GridDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split("T")[0];
      const isInRange = current >= startOfYear && current <= endDate;
      week.push({
        date: dateStr,
        count: isInRange ? (countMap.get(dateStr) ?? 0) : 0,
      });

      // Track month labels
      if (isInRange && current.getMonth() !== lastMonth) {
        lastMonth = current.getMonth();
        monthLabels.push({ month: lastMonth, offset: grid.length * 15 });
      }

      current.setDate(current.getDate() + 1);
    }
    grid.push(week);
  }

  return { grid, monthLabels };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
