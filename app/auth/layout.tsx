import React from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {ArrowLeft, Braces} from "lucide-react";

export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <div
            className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 pb-8 pt-20 sm:px-6 lg:py-10">
            <div className="absolute inset-0 bg-dotgrid opacity-25"/>
            <div
                aria-hidden="true"
                className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/15 orb-primary"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/10 orb-primary"
            />

            <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4 md:left-6 md:top-6 text-muted-foreground hover:text-foreground gap-1.5"
                asChild
            >
                <Link href="/">
                    <ArrowLeft className="size-4"/>
                    Về trang chủ
                </Link>
            </Button>

            <Link href="/" className="relative mb-7 flex items-center gap-2.5 group">
                <div
                    className="size-9 rounded-xl bg-primary flex items-center justify-center group-hover:-translate-y-0.5 transition-transform shadow-lg shadow-primary/25">
                    <Braces className="size-5 text-primary-foreground"/>
                </div>
                <span className="font-bold text-2xl tracking-tight">
                    Algo
                    <span className="text-primary">Tutor</span>
                </span>
            </Link>
            {children}
            <p className="relative mt-5 text-center text-xs text-muted-foreground">
                Bằng việc tiếp tục, bạn đồng ý với điều khoản sử dụng và chính sách bảo mật của AlgoTutor.
            </p>
        </div>
    )
}
