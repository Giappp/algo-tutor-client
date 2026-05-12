import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, StarIcon } from "lucide-react";
import Link from "next/link";

export function DailyQuizCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <StarIcon className="size-4 text-[oklch(0.65_0.15_340)]" />
          Daily Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Test your knowledge with a quick quiz on today&apos;s topic.
        </p>
        <Button size="sm" variant="outline" className="w-full text-xs h-8" asChild>
          <Link href="/topics/arrays/quiz">
            Take Quiz <ArrowRightIcon className="size-3 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
