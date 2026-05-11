"use client"

import { ArrowLeft, Braces } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"

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
        <SignInForm />
      </TabsContent>

      <TabsContent value="signup">
        <SignUpForm />
      </TabsContent>
    </Tabs>
  )
}

export default function AuthPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Dot-grid background */}
      <div className="absolute inset-0 bg-dotgrid opacity-40" />

      {/* Decorative orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/20 orb-primary float-slow"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 size-96 rounded-full bg-chart-3/20 orb-primary float-slow"
        style={{ animationDelay: "-4s" }}
      />

      {/* Return to home */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute left-4 top-4 md:left-6 md:top-6 text-muted-foreground hover:text-foreground gap-1.5"
        asChild
      >
        <Link href="/">
          <ArrowLeft className="size-4" />
          Back to home
        </Link>
      </Button>

      {/* Branding */}
      <Link href="/" className="relative mb-8 flex items-center gap-2 group">
        <div className="size-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/25">
          <Braces className="size-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-2xl tracking-tight">
          Algo<span className="text-primary">Tutor</span>
        </span>
      </Link>

      {/* Auth card */}
      <Card className="relative w-full max-w-md ring-1 ring-foreground/10 shadow-xl shadow-foreground/5">
        <CardContent className="px-6 py-6">
          <Suspense fallback={<div className="h-64 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
            <AuthPageInner />
          </Suspense>
        </CardContent>
      </Card>

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
