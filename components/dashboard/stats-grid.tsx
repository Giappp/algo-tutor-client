import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/use-dashboard-data";
import {
  BookOpenIcon,
  FlameIcon,
  RouteIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "lucide-react";

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function StatsGrid() {
  const { stats, isLoading, isError } = useDashboardStats();

  const items = [
    {
      label: "Bài hoàn thành",
      value: formatNumber(stats.completedLessons),
      icon: BookOpenIcon,
      color: "oklch(0.6 0.18 180)",
    },
    {
      label: "Điểm đóng góp",
      value: formatNumber(stats.totalXp),
      icon: TrendingUpIcon,
      color: "oklch(0.7 0.18 195)",
    },
    {
      label: "Chuỗi ngày",
      value: `${formatNumber(stats.currentStreak)}`,
      icon: FlameIcon,
      color: "oklch(0.65 0.2 145)",
    },
    {
      label: "Lộ trình active",
      value: formatNumber(stats.activeRoadmaps),
      icon: RouteIcon,
      color: "oklch(0.58 0.16 260)",
    },
    {
      label: "Xếp hạng",
      value: stats.rank ? `#${formatNumber(stats.rank)}` : "-",
      icon: TrophyIcon,
      color: "oklch(0.65 0.15 340)",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="flex items-center gap-3 p-4">
              <Skeleton className="size-10 shrink-0 rounded-lg" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      {items.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className="size-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="size-5" style={{ color: stat.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      {isError && (
        <p className="col-span-2 text-xs text-muted-foreground lg:col-span-5">
          Một vài chỉ số chưa tải được từ máy chủ.
        </p>
      )}
    </div>
  );
}
