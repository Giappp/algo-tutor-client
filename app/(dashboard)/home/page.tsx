"use client";

import {
  WelcomeSection,
  StatsGrid,
  ActivityHeatmap,
  LeaderboardCard,
  ContinueLessonCard,
  LearningOverviewCard,
} from "@/components/dashboard";

export default function DashboardPage() {
  return <DashboardContent />;
}

function DashboardContent() {
  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_top_left,oklch(0.55_0.2_250_/_0.08),transparent_34rem)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <WelcomeSection />
        <StatsGrid />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="space-y-6 xl:col-span-8">
            <ContinueLessonCard />
            <ActivityHeatmap />
          </section>

          <aside className="space-y-6 xl:col-span-4">
            <LearningOverviewCard />
            <LeaderboardCard />
          </aside>
        </div>
      </div>
    </main>
  );
}
