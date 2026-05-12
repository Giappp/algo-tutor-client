"use client"

import {Suspense, useState} from "react"
import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {Eye, EyeOff, Loader2} from "lucide-react"
import {toast} from "sonner"
import {useRouter, useSearchParams} from "next/navigation"

import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {signIn} from "@/api/auth"
import {isAxiosError} from "axios";
import {ApiResponse} from "@/lib/types";
import {useUser} from "@/hooks/useUser";

const signInSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type SignInFormData = z.infer<typeof signInSchema>

function SignInFormInner() {
    const {mutate} = useUser();
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect") ?? "/(dashboard)"

    const {
        register,
        handleSubmit,
        setError,
        formState: {errors},
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    function handleApiError(err: unknown) {
        // Kiểm tra xem lỗi có phải từ Axios và có data trả về từ backend không
        if (isAxiosError(err) && err.response?.data) {
            const responseData = err.response.data as ApiResponse<null>;

            // Nếu backend trả về mảng các lỗi validation cho từng field
            if (responseData.errors) {
                const fieldErrors = responseData.errors;

                // Lặp qua từng field (username, password...)
                Object.keys(fieldErrors).forEach((fieldName) => {
                    setError(fieldName as keyof SignInFormData, {
                        type: "server",
                        // fieldErrors[fieldName] là một mảng, ta lấy message đầu tiên để hiển thị
                        message: fieldErrors[fieldName][0],
                    });
                });
            } else {
                // Nếu là lỗi chung (VD: "Sai mật khẩu", "Tài khoản bị khóa")
                setError("root", {
                    message: responseData.message || "Đã có lỗi xảy ra",
                });
            }
        } else {
            // Lỗi không xác định (mất mạng, crash browser...)
            setError("root", {
                message: "Không thể kết nối tới máy chủ.",
            });
        }
    }

    const onSubmit = async (data: SignInFormData) => {
        setIsSubmitting(true)
        try {
            const response = await signIn(data)
            if (response.success) {
                await mutate();
                toast.success(response.message || "Sign in successful!")
                router.push(redirect)
                router.refresh()
            }
        } catch (err) {
            handleApiError(err);
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
                <Label htmlFor="signin-username">Username</Label>
                <Input
                    id="signin-username"
                    className="h-9"
                    placeholder="Enter your username"
                    autoComplete="username"
                    aria-invalid={!!errors.username}
                    {...register("username")}
                />
                {errors.username && (
                    <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <a
                        href="#"
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        Forgot password?
                    </a>
                </div>
                <div className="relative">
                    <Input
                        id="signin-password"
                        className="h-9 pr-10"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        aria-invalid={!!errors.password}
                        {...register("password")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="size-4"/>
                        ) : (
                            <Eye className="size-4"/>
                        )}
                    </button>
                </div>
                {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
            </div>

            <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="size-4 animate-spin"/>
                        Signing in...
                    </>
                ) : (
                    "Sign In"
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

export function SignInForm() {
    return (
        <Suspense fallback={<div
            className="h-48 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
            <SignInFormInner/>
        </Suspense>
    )
}
