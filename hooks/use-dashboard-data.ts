import { useMemo } from "react";
import useSWR from "swr";

import { fetcher } from "@/api/fetchers";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useUser } from "@/hooks/use-user";

export interface LeaderboardEntry {
  userId?: string;
  username: string;
  avatar?: string | null;
  rank: number;
  xp: number;
  streak: number;
  isCurrentUser?: boolean;
}

type LeaderboardResponse =
  | LeaderboardEntry[]
  | {
      entries?: LeaderboardEntry[];
      users?: LeaderboardEntry[];
      currentUserRank?: number | null;
    };

function normalizeLeaderboard(data: LeaderboardResponse | undefined) {
  if (!data) {
    return {
      entries: [],
      currentUserRank: null,
    };
  }

  if (Array.isArray(data)) {
    return {
      entries: data,
      currentUserRank: data.find((entry) => entry.isCurrentUser)?.rank ?? null,
    };
  }

  const entries = data.entries ?? data.users ?? [];

  return {
    entries,
    currentUserRank:
      data.currentUserRank ?? entries.find((entry) => entry.isCurrentUser)?.rank ?? null,
  };
}

export function useLeaderboard(limit = 5) {
  const { user } = useUser();
  const { data, error, isLoading, mutate } = useSWR<LeaderboardResponse>(
    `/leaderboard?limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const normalized = useMemo(() => normalizeLeaderboard(data), [data]);
  const entries = normalized.entries.map((entry) => ({
    ...entry,
    isCurrentUser:
      entry.isCurrentUser ||
      (!!user?.id && entry.userId === user.id) ||
      (!!user?.username && entry.username === user.username),
  }));

  const currentUserRank =
    normalized.currentUserRank ??
    entries.find((entry) => entry.isCurrentUser)?.rank ??
    null;

  return {
    entries,
    currentUserRank,
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useDashboardStats() {
  const { user, isLoading: isUserLoading, isError: userError } = useUser();
  const {
    enrollments,
    isLoading: isEnrollmentsLoading,
    isError: enrollmentsError,
  } = useEnrollments();
  const { currentUserRank, isLoading: isLeaderboardLoading } = useLeaderboard(5);

  const year = new Date().getFullYear();
  const heatmapKey = user ? `/users/me/activity-heatmap?year=${year}` : null;
  const {
    data: activityHeatmap,
    error: heatmapError,
    isLoading: isHeatmapLoading,
  } = useSWR<Record<string, number>>(heatmapKey, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const completedLessons = useMemo(
    () =>
      Object.values(activityHeatmap ?? {}).reduce(
        (total, count) => total + Number(count || 0),
        0
      ),
    [activityHeatmap]
  );

  const activeRoadmaps = enrollments.filter(
    (item) => item.completionPercentage < 100
  ).length;

  return {
    stats: {
      completedLessons,
      totalXp: user?.contributionScore ?? user?.totalContributions ?? 0,
      currentStreak: user?.currentStreak ?? 0,
      rank: currentUserRank,
      activeRoadmaps,
    },
    isLoading:
      isUserLoading ||
      isEnrollmentsLoading ||
      isHeatmapLoading ||
      isLeaderboardLoading,
    isError: !!userError || enrollmentsError || !!heatmapError,
  };
}
