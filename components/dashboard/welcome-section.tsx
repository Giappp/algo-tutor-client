"use client"
import {useUser} from "@/hooks/use-user";

export function WelcomeSection() {
    const {user} = useUser();
    return (
        <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.username}</h1>
            <p className="text-sm text-muted-foreground">
                Continue your journey in{" "}
                <span className="font-medium text-foreground">Arrays</span> &mdash; you&apos;re 42% through.
            </p>
        </div>
    );
}
