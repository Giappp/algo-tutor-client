"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * ThemeToggle — toggles between light and dark mode using next-themes.
 * Must be used inside a ThemeProvider (already set up in app/layout.tsx).
 * Returns null during SSR to prevent hydration mismatch.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="size-9"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <SunIcon className="size-5 text-muted-foreground" />
      ) : (
        <MoonIcon className="size-5 text-muted-foreground" />
      )}
    </Button>
  );
}
