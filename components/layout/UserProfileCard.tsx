import React from 'react'
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";
import {AVATAR_GRADIENTS} from "@/lib/icon-map";
import {Progress} from "@/components/ui/progress";
import {useUser} from "@/hooks/use-user";

const UserProfileCard = () => {
    const {user} = useUser();
    return (
        <div
            className="rounded-xl bg-gradient-to-br from-sidebar-accent to-sidebar p-3 ring-1 ring-sidebar-border mb-3">
            <div className="flex items-center gap-2.5 mb-2">
                <Avatar size="sm" className="shrink-0">
                    <AvatarImage src="" alt="User avatar"/>
                    <AvatarFallback
                        className={cn("bg-gradient-to-br text-primary-foreground font-semibold", AVATAR_GRADIENTS[0])}>
                        U
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-semibold truncate text-sidebar-foreground">{user?.username}</p>
                    <p className="text-xs text-muted-foreground truncate">Level 5 &middot; 1,250
                        XP</p>
                </div>
            </div>
            <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-medium text-sidebar-foreground">42%</span>
                </div>
                <Progress value={42} className="h-1.5"/>
            </div>
        </div>
    )
}
export default UserProfileCard
