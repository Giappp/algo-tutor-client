"use client";

import { useMemo } from "react";
import { useUser } from "@/hooks/use-user";
import useSWR from "swr";
import { fetcher } from "@/api/fetchers";
import {
    ProfileSidebar,
    StatsRadialCharts,
    AchievementsGrid,
    ActivityHeatmapCard,
    SubmissionsTable,
    EditProfileForm,
    ChangePasswordForm,
    ActiveSessionsCard,
} from "@/components/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { AwardIcon, SparklesIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Programmatically seed realistic mock activity contributions for past 365 days deterministically
const getDeterministicContributions = () => {
    const data: Record<string, number> = {};
    const todayDate = new Date();

    for (let i = 0; i < 365; i++) {
        const d = new Date(todayDate);
        d.setDate(todayDate.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        // Use a pseudorandom deterministic generator to keep React compiler happy
        const day = d.getDay();
        const isWeekend = day === 0 || day === 6;
        const hash = (i * 19 + 71) % 100;
        const rand = hash / 100;

        if (isWeekend) {
            data[dateStr] = rand > 0.8 ? Math.floor(rand * 3) : 0;
        } else {
            data[dateStr] = rand > 0.45 ? Math.floor(rand * 5) : 0;
        }
    }
    return data;
};

const STATIC_MOCK_CONTRIBUTIONS = getDeterministicContributions();

export default function ProfilePage() {
    const { user, isLoading: userLoading } = useUser();

    // Get real activity heatmap data from backend
    const currentYear = new Date().getFullYear();
    const { data: heatmapData } = useSWR<Record<string, number>>(
        user ? `/users/me/activity-heatmap?year=${currentYear}` : null,
        fetcher
    );

    const contributions = useMemo(() => {
        return heatmapData || STATIC_MOCK_CONTRIBUTIONS;
    }, [heatmapData]);

    const totalContributions = useMemo(() => {
        return Object.values(contributions).reduce((sum, val) => sum + val, 0);
    }, [contributions]);

    // High-fidelity fallback profile data augmented with current logged in user details
    const profileData = useMemo(() => {
        return {
            user: {
                username: user?.username || "alexrivera",
                fullName: user?.username ? undefined : "Alex Rivera",
                avatarUrl: user?.avatar || undefined,
                level: 84,
                currentXp: 44250,
                nextLevelXp: 50000,
                title: "Algorithm Master",
                joinedDate: user?.createdAt || "2023-10-15T08:30:00Z",
                location: "London",
                streakCount: 45,
                nextStreakGoal: 10,
            },
            solvedStats: {
                total: 700,
                solved: 440,
                easy: { solved: 215, total: 250 },
                medium: { solved: 180, total: 300 },
                hard: { solved: 45, total: 150 },
            },
            achievements: [
                {
                    id: "rec-1",
                    name: "Recursion Champion",
                    description: "Giải quyết 10 bài toán đệ quy trong thời gian ngắn nhất",
                    icon: "DnaIcon",
                    color: "emerald",
                    unlockedAt: "2026-01-10T12:00:00Z",
                },
                {
                    id: "dp-1",
                    name: "Dynamic Programmer",
                    description: "Hoàn thành toàn bộ lộ trình quy hoạch động cơ bản",
                    icon: "WorkflowIcon",
                    color: "pink",
                    unlockedAt: "2026-02-15T15:30:00Z",
                },
                {
                    id: "graph-1",
                    name: "Graph Guru",
                    description: "Duyệt qua 15 đồ thị dạng BFS/DFS thành công",
                    icon: "NetworkIcon",
                    color: "blue",
                    unlockedAt: "2026-03-20T09:45:00Z",
                },
                {
                    id: "greedy-1",
                    name: "Greedy Master",
                    description: "Áp dụng giải thuật tham lam để giải 8 bài tối ưu hóa",
                    icon: "TargetIcon",
                    color: "amber",
                    unlockedAt: "2026-04-05T18:10:00Z",
                },
                {
                    id: "stack-1",
                    name: "Stack Hero",
                    description: "Vượt qua thử thách ngăn xếp với các bài ngoặc hợp lệ",
                    icon: "LayersIcon",
                    color: "purple",
                    unlockedAt: "2026-04-22T14:15:00Z",
                },
                {
                    id: "binary-1",
                    name: "Binary Star",
                    description: "Tìm kiếm nhị phân chính xác 15 mảng dữ liệu có điều kiện",
                    icon: "StarIcon",
                    color: "cyan",
                    unlockedAt: "2026-05-12T11:25:00Z",
                },
            ],
            submissions: [
                {
                    submissionId: "sub-901",
                    problemId: "prob-two-sum",
                    problemTitle: "Two Sum",
                    difficulty: "EASY" as const,
                    status: "ACCEPTED" as const,
                    executionTimeSec: 0.04,
                    memoryUsageMb: 14.1,
                    submittedAt: "2026-05-24T15:20:00Z",
                },
                {
                    submissionId: "sub-902",
                    problemId: "prob-longest-substring",
                    problemTitle: "Longest Substring Without Repeating Characters",
                    difficulty: "MEDIUM" as const,
                    status: "ACCEPTED" as const,
                    executionTimeSec: 0.08,
                    memoryUsageMb: 14.9,
                    submittedAt: "2026-05-23T11:42:00Z",
                },
                {
                    submissionId: "sub-903",
                    problemId: "prob-merge-k",
                    problemTitle: "Merge K Sorted Lists",
                    difficulty: "HARD" as const,
                    status: "ACCEPTED" as const,
                    executionTimeSec: 0.15,
                    memoryUsageMb: 16.5,
                    submittedAt: "2026-05-22T09:12:00Z",
                },
                {
                    submissionId: "sub-904",
                    problemId: "prob-valid-parentheses",
                    problemTitle: "Valid Parentheses",
                    difficulty: "EASY" as const,
                    status: "ACCEPTED" as const,
                    executionTimeSec: 0.02,
                    memoryUsageMb: 13.8,
                    submittedAt: "2026-05-20T17:33:00Z",
                },
                {
                    submissionId: "sub-905",
                    problemId: "prob-climbing-stairs",
                    problemTitle: "Climbing Stairs",
                    difficulty: "EASY" as const,
                    status: "ACCEPTED" as const,
                    executionTimeSec: 0.01,
                    memoryUsageMb: 13.5,
                    submittedAt: "2026-05-19T14:10:00Z",
                },
                {
                    submissionId: "sub-906",
                    problemId: "prob-reverse-linked-list",
                    problemTitle: "Reverse Linked List",
                    difficulty: "EASY" as const,
                    status: "RUNTIME_ERROR" as const,
                    executionTimeSec: 0.0,
                    memoryUsageMb: 0.0,
                    submittedAt: "2026-05-17T18:05:00Z",
                },
                {
                    submissionId: "sub-907",
                    problemId: "prob-binary-tree",
                    problemTitle: "Binary Tree Inorder Traversal",
                    difficulty: "EASY" as const,
                    status: "ACCEPTED" as const,
                    executionTimeSec: 0.03,
                    memoryUsageMb: 14.0,
                    submittedAt: "2026-05-16T10:12:00Z",
                },
                {
                    submissionId: "sub-908",
                    problemId: "prob-container-water",
                    problemTitle: "Container With Most Water",
                    difficulty: "MEDIUM" as const,
                    status: "WRONG_ANSWER" as const,
                    executionTimeSec: 0.12,
                    memoryUsageMb: 15.6,
                    submittedAt: "2026-05-15T22:15:00Z",
                },
            ],
        };
    }, [user]);

    // Loading Skeletons layout
    if (userLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <Skeleton className="h-[300px] w-full rounded-2xl" />
                        <Skeleton className="h-[120px] w-full rounded-2xl" />
                    </div>
                    <div className="md:col-span-2 space-y-6">
                        <Skeleton className="h-[200px] w-full rounded-2xl" />
                        <Skeleton className="h-[150px] w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-300">
            {/* Simple Clean Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <AwardIcon className="size-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Hồ sơ lập trình viên
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
                            Theo dõi cấp độ rèn luyện, huy hiệu danh vọng và lịch sử giải bài thuật toán.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shrink-0 w-fit">
                    <SparklesIcon className="size-3.5 fill-primary/10" />
                    <span>Học viên Premium</span>
                </div>
            </div>

            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Cột Sidebar */}
                <div className="lg:col-span-1">
                    <ProfileSidebar user={profileData.user} />
                </div>

                {/* Right Cột Progress Analytics with Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid grid-cols-3 w-full max-w-md mb-6 bg-muted/65 p-1 rounded-xl">
                            <TabsTrigger value="overview" className="rounded-lg text-xs font-semibold">
                                Tổng quan
                            </TabsTrigger>
                            <TabsTrigger value="settings" className="rounded-lg text-xs font-semibold">
                                Cài đặt tài khoản
                            </TabsTrigger>
                            <TabsTrigger value="security" className="rounded-lg text-xs font-semibold">
                                Thiết bị & Bảo mật
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-0">
                            <StatsRadialCharts solvedStats={profileData.solvedStats} />
                            <AchievementsGrid achievements={profileData.achievements} />
                            <ActivityHeatmapCard
                                contributions={contributions}
                                totalContributions={totalContributions}
                                maxStreak={88}
                                currentStreak={profileData.user.streakCount}
                            />
                            <SubmissionsTable submissions={profileData.submissions} />
                        </TabsContent>

                        <TabsContent value="settings" className="space-y-6 mt-0">
                            <EditProfileForm />
                            <ChangePasswordForm />
                        </TabsContent>

                        <TabsContent value="security" className="space-y-6 mt-0">
                            <ActiveSessionsCard />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
