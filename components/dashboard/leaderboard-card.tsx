import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrophyIcon, FlameIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const leaderboard = [
  { rank: 1, name: "Alex Chen", xp: 4850, streak: 12, avatar: "A" },
  { rank: 2, name: "Sarah Kim", xp: 4320, streak: 8, avatar: "S" },
  { rank: 3, name: "You", xp: 1250, streak: 5, avatar: "U", isYou: true },
  { rank: 4, name: "Mike Ross", xp: 980, streak: 3, avatar: "M" },
  { rank: 5, name: "Emma Liu", xp: 750, streak: 2, avatar: "E" },
];

const rankColors: Record<number, string> = {
  1: "bg-[oklch(0.65_0.15_340)]/10 text-[oklch(0.65_0.15_340)]",
  2: "bg-[oklch(0.7_0.18_85)]/10 text-[oklch(0.7_0.18_85)]",
  3: "bg-[oklch(0.55_0.2_250)]/10 text-[oklch(0.55_0.2_250)]",
};

export function LeaderboardCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrophyIcon className="size-4 text-[oklch(0.65_0.15_340)]" />
            Leaderboard
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
            <Link href="/leaderboard">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5",
                user.isYou && "bg-primary/5"
              )}
            >
              <div
                className={cn(
                  "size-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  rankColors[user.rank] ?? "bg-muted text-muted-foreground"
                )}
              >
                {user.rank}
              </div>
              <div className="size-6 rounded-full bg-gradient-to-br from-primary to-[oklch(0.65_0.15_340)] flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  user.isYou && "text-primary"
                )}>
                  {user.name}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <FlameIcon className="size-2.5" />
                  {user.streak}
                </div>
                <p className="text-xs font-semibold tabular-nums">
                  {user.xp.toLocaleString()} XP
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
