"use client";

import {
  WelcomeSection,
  StatsGrid,
  ActivityHeatmap,
  RecentProblemsCard,
  LeaderboardCard,
  AiTutorCard,
  DailyQuizCard,
  ContinueLessonCard,
} from "@/components/dashboard";

export default function DashboardPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      <WelcomeSection />
      <StatsGrid />
      <ActivityHeatmap />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ContinueLessonCard />
          <RecentProblemsCard />
        </div>

        <div className="space-y-6">
          <LeaderboardCard />
          <AiTutorCard />
          <DailyQuizCard />
        </div>
      </div>
    </div>
  );
}
