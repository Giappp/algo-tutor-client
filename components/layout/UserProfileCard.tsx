import React, { useState } from 'react'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";
import {AVATAR_GRADIENTS} from "@/lib/icon-map";
import {useUser} from "@/hooks/use-user";
import {LogOutIcon, Loader2} from "lucide-react";
import {logout} from "@/api/auth";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import Link from "next/link";

const UserProfileCard = () => {
    const {user, mutate} = useUser();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const contributionScore = user?.contributionScore ?? user?.totalContributions ?? 0;

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            await mutate(undefined, false);
            toast.success("Đăng xuất thành công!");
            router.push("/auth?tab=signin");
            router.refresh();
        } catch {
            toast.error("Không thể đăng xuất. Vui lòng thử lại.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div
            className="rounded-xl bg-gradient-to-br from-sidebar-accent to-sidebar p-3.5 ring-1 ring-sidebar-border/50 mb-3 group relative">
            <div className="flex items-center justify-between gap-2 mb-2.5">
                <Link href="/profile" className="flex items-center gap-3 min-w-0 hover:opacity-85 transition-opacity flex-1">
                    <Avatar size="lg" className="shrink-0">
                        <AvatarImage src={user?.avatar || ""} alt="User avatar"/>
                        <AvatarFallback
                            className={cn("bg-gradient-to-br text-primary-foreground font-semibold uppercase", AVATAR_GRADIENTS[0])}>
                            {user?.username?.substring(0, 2) || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-sidebar-foreground">{user?.username || "Guest"}</p>
                        <p className="text-[10px] text-muted-foreground truncate">
                            {user?.role ? `Vai trò ${user.role}` : "Đang tải hồ sơ"}
                        </p>
                    </div>
                </Link>
                
                <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors shrink-0"
                    title="Đăng xuất"
                >
                    {isLoggingOut ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <LogOutIcon className="size-4" />
                    )}
                </button>
            </div>
            
            <div className="rounded-lg bg-sidebar-accent/50 px-2.5 py-2">
                <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                    <span>Điểm đóng góp</span>
                    <span className="font-semibold tabular-nums text-sidebar-foreground">
                        {contributionScore.toLocaleString("vi-VN")}
                    </span>
                </div>
            </div>
        </div>
    )
}
export default UserProfileCard
