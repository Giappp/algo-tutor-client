import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ArrowRight, Loader2} from "lucide-react";
import {useUser} from "@/hooks/use-user";

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
                {/* Desktop */}
                <Button variant="gradient" size="sm" className="hidden md:inline-flex gap-1.5" asChild>
                    <Link href="/home">
                        Vào trang học
                        <ArrowRight className="size-3.5"/>
                    </Link>
                </Button>
                {/* Mobile */}
                <Button variant="gradient" size="sm" className="flex-1 md:hidden gap-1.5" asChild>
                    <Link href="/home">
                        Vào trang học
                        <ArrowRight className="size-3.5"/>
                    </Link>
                </Button>
            </>
        )
    }

    return (
        <>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/auth">Đăng nhập</Link>
            </Button>
            <Button size="sm" className="gap-1.5" asChild>
                <Link href="/auth?tab=signup">
                    Học miễn phí
                    <ArrowRight className="size-3.5"/>
                </Link>
            </Button>
        </>
    )
}
export default CtaButton
