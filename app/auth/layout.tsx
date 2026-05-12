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
            className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
            {/* Dot-grid background */}
            <div className="absolute inset-0 bg-dotgrid opacity-40"/>

            {/* Decorative orbs */}
            <div
                aria-hidden="true"
                className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 orb-primary float-slow"
            />
            <div
                aria-hidden="true"
                className="absolute -bottom-32 -right-32 size-96 rounded-full bg-chart-3/20 orb-primary float-slow"
                style={{animationDelay: "-4s"}}
            />

            {/* Return to home */}
            <Button
                variant="ghost"
                size="sm"
                className="absolute left-4 top-4 md:left-6 md:top-6 text-muted-foreground hover:text-foreground gap-1.5"
                asChild
            >
                <Link href="/">
                    <ArrowLeft className="size-4"/>
                    Back to home
                </Link>
            </Button>

            {/* Branding */}
            <Link href="/" className="relative mb-8 flex items-center gap-2 group">
                <div
                    className="size-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/25">
                    <Braces className="size-5 text-primary-foreground"/>
                </div>
                <span className="font-bold text-2xl tracking-tight">
                    Algo
                    <span className="text-primary">Tutor</span>
                </span>
            </Link>
            {children}
            {/* Footer note */}
            <p className="relative mt-6 text-center text-xs text-muted-foreground">
                By continuing, you agree to AlgoTutor&apos;s{" "}
                <a href="#" className="text-primary hover:underline">
                    Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                </a>
            </p>
        </div>
    )
}
