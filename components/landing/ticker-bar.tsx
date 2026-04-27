export function TickerBar() {
  const items = [
    "50,000+ Active Learners",
    "1,200+ Coding Problems",
    "12 Core Topics",
    "AI Context-Aware Hints",
    "Auto-Graded Solutions",
    "Progress Tracking",
    "Real-Time Feedback",
    "Beginner Friendly",
  ];

  return (
    <div className="relative border-y border-border/50 overflow-hidden bg-muted/20 py-4">
      <div className="flex animate-ticker whitespace-nowrap gap-12">
        {[...items, ...items].map((item, i) => (
          <div key={i} className="flex items-center gap-3 flex-shrink-0">
            <svg className="size-4 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-muted-foreground">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
