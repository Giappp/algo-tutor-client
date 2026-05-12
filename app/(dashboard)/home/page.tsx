import {
  WelcomeSection,
  StatsGrid,
  CurrentLessonCard,
  RecentProblemsCard,
  LeaderboardCard,
  AiTutorCard,
  DailyQuizCard,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <WelcomeSection />
      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CurrentLessonCard />
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
