import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

const difficultyBreakdown = [
  { label: "Easy Done", count: 8, color: "oklch(0.65 0.2 145)" },
  { label: "Medium Done", count: 6, color: "oklch(0.7 0.18 85)" },
  { label: "Hard Done", count: 4, color: "oklch(0.6 0.22 25)" },
];

export function CurrentLessonCard() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Current Topic: Arrays</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              18 of 42 problems completed
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            In Progress
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Topic Progress</span>
            <span className="font-medium text-foreground">42%</span>
          </div>
          <Progress value={42} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {difficultyBreakdown.map((item) => (
            <div
              key={item.label}
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: `${item.color}12` }}
            >
              <p className="text-lg font-bold" style={{ color: item.color }}>
                {item.count}
              </p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button size="sm" className="w-full gap-1.5" asChild>
          <Link href="/topics/arrays">
            Continue Learning
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
