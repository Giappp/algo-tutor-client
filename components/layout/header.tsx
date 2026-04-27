"use client";

import {BellIcon, MoonIcon, SearchIcon, SunIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useTheme} from "next-themes";
import {useState} from "react";

function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const {theme, setTheme} = useTheme();

    if (typeof window !== "undefined") {
        setMounted(true);
    }

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
                <SunIcon className="size-5 text-muted-foreground"/>
            ) : (
                <MoonIcon className="size-5 text-muted-foreground"/>
            )}
        </Button>
    );
}

export function Header() {
    return (
        <header
            className="flex items-center justify-between h-14 px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md w-full hidden sm:block">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
                    <Input
                        placeholder="Search problems, topics..."
                        className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle/>
                <Button variant="ghost" size="icon" className="size-9 relative">
                    <BellIcon className="size-5 text-muted-foreground"/>
                    <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary"/>
                </Button>
                <div
                    className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-semibold text-primary-foreground ml-2">
                    U
                </div>
            </div>
        </header>
    );
}
