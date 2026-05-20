import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, StarIcon } from "lucide-react";
import Link from "next/link";

export function DailyQuizCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <StarIcon className="size-4 text-[oklch(0.65_0.15_340)]" />
          Quiz hàng ngày
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Kiểm tra kiến thức với quiz ngắn về chủ đề hôm nay.
        </p>
        <Button size="sm" variant="outline" className="w-full text-sm h-9" asChild>
          <Link href="/topics/arrays/quiz">
            Làm Quiz <ArrowRightIcon className="size-3.5 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
