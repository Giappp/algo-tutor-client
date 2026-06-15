export function TickerBar() {
  const items = [
    "Lộ trình học có thứ tự",
    "Bài tập chấm tự động",
    "AI hiểu bài học hiện tại",
    "Theo dõi tiến độ rõ ràng",
    "Phản hồi test case chi tiết",
    "Phù hợp người mới bắt đầu",
  ];

  return (
    <div className="relative overflow-hidden border-y border-border/50 bg-foreground py-3 text-background">
      <div className="flex animate-ticker whitespace-nowrap gap-12">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 flex-shrink-0">
            <svg className="size-3.5 flex-shrink-0 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium tracking-wide text-background/70">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
