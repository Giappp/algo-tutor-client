"use client"

import {useSearchParams} from "next/navigation"
import {Suspense, useState} from "react"
import {Card, CardContent} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {SignInForm} from "@/components/auth/sign-in-form"
import {SignUpForm} from "@/components/auth/sign-up-form"

function AuthPageInner() {
    const searchParams = useSearchParams()
    const initialTab = searchParams.get("tab") === "signup" ? "signup" : "signin"
    const [activeTab, setActiveTab] = useState(initialTab)

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6">
                <TabsTrigger value="signin" className="flex-1">
                    Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex-1">
                    Sign Up
                </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
                <SignInForm/>
            </TabsContent>

            <TabsContent value="signup">
                <SignUpForm/>
            </TabsContent>
        </Tabs>
    )
}

export default function AuthPage() {
    return (
        <Card className="relative w-full max-w-md ring-1 ring-foreground/10 shadow-xl shadow-foreground/5">
            <CardContent className="px-6 py-6">
                <Suspense fallback={<div
                    className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
                    <AuthPageInner/>
                </Suspense>
            </CardContent>
        </Card>
    );
}
