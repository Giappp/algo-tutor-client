"use client"
import {useTheme} from "next-themes";
import {Button} from "@/components/ui/button";
import {MoonIcon, SunIcon} from "lucide-react";

export function ThemeToggle() {
    const {theme, setTheme} = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative size-9"
            aria-label="Toggle theme"
        >
            <SunIcon
                className="size-5 text-muted-foreground transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90"/>

            <MoonIcon
                className="absolute size-5 text-muted-foreground transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0"/>
        </Button>
    );
}