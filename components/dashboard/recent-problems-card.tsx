import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CheckCircle2Icon, ClockIcon } from "lucide-react";
import Link from "next/link";

const difficultyColors: Record<string, string> = {
  Easy: "bg-[oklch(0.65_0.2_145)]/10 text-[oklch(0.65_0.2_145)] border-[oklch(0.65_0.2_145)]/20",
  Medium: "bg-[oklch(0.7_0.18_85)]/10 text-[oklch(0.7_0.18_85)] border-[oklch(0.7_0.18_85)]/20",
  Hard: "bg-[oklch(0.6_0.22_25)]/10 text-[oklch(0.6_0.22_25)] border-[oklch(0.6_0.22_25)]/20",
};

const recentProblems = [
  { title: "Two Sum", difficulty: "Easy" as const, topic: "Arrays", status: "Solved" as const, date: "2h ago" },
  { title: "Valid Parentheses", difficulty: "Easy" as const, topic: "Stacks", status: "Solved" as const, date: "1d ago" },
  { title: "Merge Sorted Array", difficulty: "Medium" as const, topic: "Arrays", status: "Attempted" as const, date: "2d ago" },
  { title: "Reverse Linked List", difficulty: "Easy" as const, topic: "Linked Lists", status: "Solved" as const, date: "3d ago" },
];

export function RecentProblemsCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Problems</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" asChild>
            <Link href="/problems">
              View all <ArrowRightIcon className="size-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {recentProblems.map((problem) => (
            <div
              key={problem.title}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div
                className={problem.status === "Solved"
                  ? "text-[oklch(0.65_0.2_145)]"
                  : "text-muted-foreground"
                }
              >
                {problem.status === "Solved" ? (
                  <CheckCircle2Icon className="size-4" />
                ) : (
                  <ClockIcon className="size-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{problem.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {problem.topic} &middot; {problem.date}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] shrink-0 ${difficultyColors[problem.difficulty]}`}
              >
                {problem.difficulty}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
