"use client"

import {useRouter, useSearchParams} from "next/navigation"
import {Suspense} from "react"
import {Card, CardContent} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {SignInForm} from "@/components/auth/sign-in-form"
import {SignUpForm} from "@/components/auth/sign-up-form"
import {BookOpenCheck, Code2, Sparkles} from "lucide-react"

function AuthPageInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeTab = searchParams.get("tab") === "signup" ? "signup" : "signin"

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("tab", tab)
        params.delete("registered")
        router.replace(`/auth?${params.toString()}`, {scroll: false})
    }

    return (
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-7 h-11 w-full rounded-xl bg-muted/70 p-1">
                <TabsTrigger value="signin" className="flex-1 rounded-lg">
                    Đăng nhập
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 rounded-lg">
                    Đăng ký
                </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-0">
                <SignInForm/>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
                <SignUpForm/>
            </TabsContent>
        </Tabs>
    )
}

export default function AuthPage() {
    return (
        <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/70 bg-card/90 shadow-2xl shadow-primary/10 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="relative hidden overflow-hidden bg-foreground px-10 py-12 text-background lg:flex lg:flex-col lg:justify-between">
                <div className="absolute inset-0 bg-dotgrid opacity-10"/>
                <div className="absolute -right-28 -top-28 size-72 rounded-full bg-primary/35 blur-3xl"/>

                <div className="relative">
                    <div className="mb-8 inline-flex size-12 items-center justify-center rounded-2xl bg-background/10 ring-1 ring-background/15">
                        <Code2 className="size-6"/>
                    </div>
                    <p className="mb-3 text-sm font-medium text-background/60">Học giải thuật có định hướng</p>
                    <h1 className="max-w-sm text-balance text-4xl font-semibold leading-tight tracking-tight">
                        Hiểu sâu hơn qua từng dòng code.
                    </h1>
                    <p className="mt-5 max-w-sm text-pretty text-sm leading-6 text-background/65">
                        Lộ trình rõ ràng, bài tập thực hành và trợ giảng AI giúp bạn tiến bộ đều đặn.
                    </p>
                </div>

                <div className="relative space-y-4 text-sm text-background/75">
                    <div className="flex items-center gap-3">
                        <BookOpenCheck className="size-4 text-primary"/>
                        Theo dõi tiến độ theo từng lộ trình
                    </div>
                    <div className="flex items-center gap-3">
                        <Sparkles className="size-4 text-primary"/>
                        Nhận gợi ý khi bạn thực sự cần
                    </div>
                </div>
            </aside>

            <Card className="w-full rounded-none border-0 bg-transparent py-0 shadow-none">
                <CardContent className="px-5 py-8 sm:px-10 sm:py-10">
                    <Suspense fallback={<div
                        className="flex h-64 items-center justify-center text-sm text-muted-foreground">Đang tải...</div>}>
                        <AuthPageInner/>
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
