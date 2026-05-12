import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquareIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function AiTutorCard() {
  return (
    <Card className="bg-gradient-to-br from-[oklch(0.55_0.2_250)] to-[oklch(0.6_0.18_180)] text-primary-foreground border-0">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquareIcon className="size-5" />
          <p className="text-sm font-semibold">AI Tutor</p>
        </div>
        <p className="text-xs opacity-90">
          Get context-aware hints for your current problem, strictly within scope.
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="w-full gap-1.5 text-xs h-8 bg-primary-foreground/15 hover:bg-primary-foreground/25 border-0"
          asChild
        >
          <Link href="/ai-tutor">
            Ask AI Tutor
            <ArrowRightIcon className="size-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
