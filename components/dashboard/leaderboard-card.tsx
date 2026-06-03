"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLeaderboard } from "@/hooks/use-dashboard-data";
import { AVATAR_GRADIENTS } from "@/lib/icon-map";
import { TrophyIcon, FlameIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const rankColors: Record<number, string> = {
  1: "bg-[oklch(0.65_0.15_340)]/10 text-[oklch(0.65_0.15_340)]",
  2: "bg-[oklch(0.7_0.18_85)]/10 text-[oklch(0.7_0.18_85)]",
  3: "bg-[oklch(0.55_0.2_250)]/10 text-[oklch(0.55_0.2_250)]",
};

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase();
}

export function LeaderboardCard() {
  const { entries, isLoading, isError } = useLeaderboard(5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <TrophyIcon className="size-4 text-[oklch(0.65_0.15_340)]" />
            Bảng xếp hạng
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
            <Link href="/leaderboard">Xem tất cả</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 px-4 pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="px-4 pb-5 pt-1 text-sm text-muted-foreground">
            Chưa tải được bảng xếp hạng từ máy chủ.
          </div>
        ) : entries.length === 0 ? (
          <div className="px-4 pb-5 pt-1 text-sm text-muted-foreground">
            Chưa có dữ liệu xếp hạng.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {entries.map((user, index) => (
            <div
              key={`${user.rank}-${user.userId ?? user.username}`}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5",
                user.isCurrentUser && "bg-primary/5"
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
              <Avatar size="sm" className="shrink-0">
                <AvatarImage src={user.avatar ?? ""} alt={user.username} />
                <AvatarFallback
                  className={cn(
                    "bg-gradient-to-br text-[10px] font-bold text-primary-foreground",
                    AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
                  )}
                >
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-medium truncate",
                  user.isCurrentUser && "text-primary"
                )}>
                  {user.isCurrentUser ? "Bạn" : user.username}
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
        )}
      </CardContent>
    </Card>
  );
}
