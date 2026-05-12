import { Card, CardContent } from "@/components/ui/card";
import { BookOpenIcon, TrendingUpIcon, FlameIcon, TrophyIcon } from "lucide-react";

const stats = [
  {
    label: "Problems Solved",
    value: "42",
    icon: BookOpenIcon,
    color: "oklch(0.6 0.18 180)",
  },
  {
    label: "Total XP",
    value: "1,250",
    icon: TrendingUpIcon,
    color: "oklch(0.7 0.18 195)",
  },
  {
    label: "Day Streak",
    value: "5",
    icon: FlameIcon,
    color: "oklch(0.65 0.2 145)",
  },
  {
    label: "Leaderboard Rank",
    value: "#3",
    icon: TrophyIcon,
    color: "oklch(0.65 0.15 340)",
  },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className="size-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="size-5" style={{ color: stat.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
