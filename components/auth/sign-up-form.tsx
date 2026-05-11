"use client"

import {useMemo, useState} from "react"
import {useForm, useWatch} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {Check, Eye, EyeOff, Loader2} from "lucide-react"
import {toast} from "sonner"
import {useRouter} from "next/navigation"

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {signUp} from "@/api/auth"
import {cn} from "@/lib/utils"
import {isAxiosError} from "axios";

const signUpSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must be at most 20 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
        email: z.string().email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        confirmPassword: z.string(),
        terms: z.boolean().refine((val) => val === true, {
            message: "You must agree to the terms of service",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type SignUpFormData = z.infer<typeof signUpSchema>

const PASSWORD_RULES = [
    {label: "At least 8 characters", test: (p: string) => p.length >= 8},
    {label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p)},
    {label: "One number", test: (p: string) => /[0-9]/.test(p)},
]

export function SignUpForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const router = useRouter()

    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: {errors},
    } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const password = useWatch({control, name: "password"})

    const passwordStrength = useMemo(() => {
        if (!password) return 0
        const passed = PASSWORD_RULES.filter((r) => r.test(password)).length
        return (passed / PASSWORD_RULES.length) * 100
    }, [password])

    const strengthLabel = useMemo(() => {
        if (passwordStrength === 0) return null
        if (passwordStrength < 50) return "Weak"
        if (passwordStrength < 100) return "Medium"
        return "Strong"
    }, [passwordStrength])

    const onSubmit = async (data: SignUpFormData) => {
        if (!agreedToTerms) {
            toast.error("Please agree to the terms of service")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await signUp(data)
            if (response.success) {
                toast.success(response.message || "Account created successfully!")
                router.push("/dashboard")
                router.refresh()
            }
        } catch (error) {
            if (isAxiosError(error) && error.response?.data) {
                setError("root", {
                    message: error?.response?.data?.message || error?.message || "Failed to create account. Please try again.",
                })
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {errors.root && (
                <div
                    className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
                    {errors.root.message}
                </div>
            )}

            <div className="space-y-1.5">
                <Label htmlFor="signup-username">Username</Label>
                <Input
                    id="signup-username"
                    className="h-9"
                    placeholder="Choose a username"
                    autoComplete="username"
                    aria-invalid={!!errors.username}
                    {...register("username")}
                />
                {errors.username && (
                    <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                    id="signup-email"
                    className="h-9"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                />
                {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                    <Input
                        id="signup-password"
                        className="h-9 pr-10"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="size-4"/> : <Eye className="size-4"/>}
                    </button>
                </div>

                {password && (
                    <div className="space-y-2">
                        <div className="flex gap-1">
                            {PASSWORD_RULES.map((rule, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1 flex-1 rounded-full transition-colors",
                                        rule.test(password) ? "bg-difficulty-easy" : "bg-border"
                                    )}
                                />
                            ))}
                        </div>
                        <p
                            className={cn(
                                "text-xs",
                                passwordStrength < 50
                                    ? "text-destructive"
                                    : passwordStrength < 100
                                        ? "text-[var(--chart-3)]"
                                        : "text-difficulty-easy"
                            )}
                        >
                            {strengthLabel} password
                        </p>
                    </div>
                )}

                {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="signup-confirm-password"
                        className="h-9 pr-10"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        {...register("confirmPassword")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="size-4"/>
                        ) : (
                            <Eye className="size-4"/>
                        )}
                    </button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
            </div>

            <div className="flex items-start gap-2">
                <button
                    type="button"
                    aria-checked={agreedToTerms}
                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                    className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                        agreedToTerms
                            ? "bg-primary border-primary"
                            : "border-input bg-transparent hover:border-ring"
                    )}
                    aria-pressed={agreedToTerms}
                >
                    {agreedToTerms && <Check className="size-3 text-primary-foreground"/>}
                </button>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <a href="#" className="text-primary hover:underline">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                        Privacy Policy
                    </a>
                </p>
            </div>

            <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="size-4 animate-spin"/>
                        Creating account...
                    </>
                ) : (
                    "Create Account"
                )}
            </Button>

            <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border"/>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-3 text-muted-foreground">or continue with</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => (window.location.href = "/api/auth/oauth/google")}
                >
                    <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"/>
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"/>
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"/>
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"/>
                    </svg>
                    Google
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => (window.location.href = "/api/auth/oauth/github")}
                >
                    <svg className="size-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path
                            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    GitHub
                </Button>
            </div>
        </form>
    )
}
