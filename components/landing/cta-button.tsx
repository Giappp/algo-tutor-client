"use client";

import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ArrowRight, Loader2} from "lucide-react";
import {useUser} from "@/hooks/use-user";

const LEARNING_HREF = "/home";
const SIGN_IN_HREF = "/auth";
const SIGN_UP_HREF = "/auth?tab=signup";

function LearningButton({className}: { className?: string }) {
    return (
        <Button variant="gradient" size="sm" className={className} asChild>
            <Link href={LEARNING_HREF}>
                Vào trang học
                <ArrowRight className="size-3.5"/>
            </Link>
        </Button>
    );
}

const CtaButton = () => {
    const {isLoading, isLoggedIn} = useUser();

    if (isLoading) {
        return (
            <div className="flex h-8 w-24 items-center justify-center" aria-label="Đang kiểm tra phiên đăng nhập">
                <Loader2 className="size-4 animate-spin text-muted-foreground"/>
            </div>
        )
    }

    if (isLoggedIn) {
        return (
            <>
                <LearningButton className="hidden md:inline-flex gap-1.5"/>
                <LearningButton className="flex-1 md:hidden gap-1.5"/>
            </>
        )
    }

    return (
        <>
            <Button variant="ghost" size="sm" asChild>
                <Link href={SIGN_IN_HREF}>Đăng nhập</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
                <Link href={SIGN_UP_HREF}>
                    Học miễn phí
                    <ArrowRight className="size-3.5"/>
                </Link>
            </Button>
        </>
    )
}
export default CtaButton
