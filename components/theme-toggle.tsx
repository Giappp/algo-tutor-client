"use client"

import {useTheme} from "next-themes";
import {Button} from "@/components/ui/button";
import {MoonIcon, SunIcon} from "lucide-react";

export function ThemeToggle() {
    const {resolvedTheme, setTheme} = useTheme();

    if (!resolvedTheme) {
        return <div className="size-9"/>;
    }

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="size-9"
            aria-label="Toggle theme"
        >
            {isDark ? (
                <SunIcon className="size-5 text-muted-foreground"/>
            ) : (
                <MoonIcon className="size-5 text-muted-foreground"/>
            )}
        </Button>
    );
}