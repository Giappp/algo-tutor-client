"use client";

import { BellIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { AVATAR_GRADIENTS } from "@/lib/icon-map";

interface HeaderProps {
    title?: string;
    description?: string;
}

export function Header({ title, description }: HeaderProps) {
    const { user } = useUser();

    return (
        <header
            className="flex items-center justify-between h-14 px-6 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 gap-4">
            {/* Left: Title or Search */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {title ? (
                    <div className="min-w-0">
                        <h1 className="text-sm font-semibold truncate text-foreground">{title}</h1>
                        {description && (
                            <p className="text-xs text-muted-foreground truncate">{description}</p>
                        )}
                    </div>
                ) : (
                    <div className="relative max-w-md w-full hidden sm:block">
                        <SearchIcon
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search problems, topics..."
                            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
                        />
                    </div>
                )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {title && (
                    <div className="relative max-w-xs w-full hidden lg:block">
                        <SearchIcon
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 h-8 text-xs"
                        />
                    </div>
                )}
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="size-9 relative">
                    <BellIcon className="size-5 text-muted-foreground" />
                </Button>
                <Avatar className="ml-1">
                    <AvatarImage src={user?.avatar || ""} alt={user?.username || "User"} />
                    <AvatarFallback
                        className={cn(
                            "bg-gradient-to-br text-xs font-semibold text-primary-foreground uppercase",
                            AVATAR_GRADIENTS[0]
                        )}
                    >
                        {user?.username?.slice(0, 2) || "U"}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}
