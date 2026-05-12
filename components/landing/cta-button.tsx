import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ArrowRight, Loader2} from "lucide-react";
import {useUser} from "@/hooks/useUser";

const CtaButton = () => {
    const {isLoading, isLoggedIn} = useUser();

    if (isLoading) {
        return (
            <Loader2 className="animate-spin"/>
        )
    }

    if (isLoggedIn) {
        return (
            <>
                {/* Desktop */}
                <Button variant="gradient" size="sm" className="hidden md:inline-flex gap-1.5" asChild>
                    <Link href="/home">
                        Go to Dashboard
                        <ArrowRight className="size-3.5"/>
                    </Link>
                </Button>
                {/* Mobile */}
                <Button variant="gradient" size="sm" className="flex-1 md:hidden gap-1.5" asChild>
                    <Link href="/home">
                        Go to Dashboard
                        <ArrowRight className="size-3.5"/>
                    </Link>
                </Button>
            </>
        )
    }

    return (
        <>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/auth">Sign In</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
                <Link href="/auth?tab=signup">
                    Get Started
                    <ArrowRight className="size-3.5"/>
                </Link>
            </Button>
        </>
    )
}
export default CtaButton
