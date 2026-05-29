"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { userApi } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const passwordSchema = z
    .object({
        oldPassword: z.string().min(1, "Mật khẩu cũ không được để trống"),
        newPassword: z
            .string()
            .min(8, "Mật khẩu mới phải từ 8 ký tự trở lên")
            .regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất một chữ viết hoa")
            .regex(/[0-9]/, "Mật khẩu phải chứa ít nhất một chữ số"),
        confirmPassword: z.string().min(1, "Xác nhận mật khẩu không được để trống"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu mới không trùng khớp",
        path: ["confirmPassword"],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ChangePasswordForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: PasswordFormData) => {
        setIsSubmitting(true);
        try {
            const response = await userApi.changePassword(data);
            if (response.success) {
                toast.success(response.message || "Đổi mật khẩu thành công!");
                reset(); // Clear fields
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            const msg = err?.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <KeyRound className="size-5 text-primary" />
                    <span>Đổi mật khẩu</span>
                </CardTitle>
                <CardDescription>
                    Thay đổi mật khẩu đăng nhập để nâng cao độ bảo mật cho tài khoản của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Old Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="oldPassword">Mật khẩu hiện tại</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="oldPassword"
                                type={showOldPassword ? "text" : "password"}
                                className="pl-9 pr-10 h-9"
                                placeholder="Nhập mật khẩu hiện tại"
                                {...register("oldPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showOldPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errors.oldPassword && (
                            <p className="text-xs text-destructive mt-1">{errors.oldPassword.message}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                className="pl-9 pr-10 h-9"
                                placeholder="Nhập mật khẩu mới"
                                {...register("newPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p className="text-xs text-destructive mt-1">{errors.newPassword.message}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground">
                            Yêu cầu: Tối thiểu 8 ký tự, có ít nhất 1 chữ in hoa và 1 chữ số.
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                className="pl-9 pr-10 h-9"
                                placeholder="Nhập lại mật khẩu mới"
                                {...register("confirmPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button type="submit" className="w-full sm:w-auto min-w-[120px]" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin mr-2" />
                                    Đang đổi...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="size-4 mr-2" />
                                    Cập nhật mật khẩu
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
