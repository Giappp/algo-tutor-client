"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, User, Mail, Sparkles, Camera, Upload } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { userApi } from "@/api/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
    username: z.string().min(3, "Tên tài khoản phải từ 3 ký tự trở lên").max(20, "Tên tài khoản tối đa 20 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    avatar: z.string().url("Đường dẫn ảnh đại diện không hợp lệ"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function EditProfileForm() {
    const { user, mutate } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            username: user?.username || "",
            email: user?.email || "",
            avatar: user?.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=codestar",
        },
    });

    // Reset form values when user loads
    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                email: user.email,
                avatar: user.avatar || "https://api.dicebear.com/7.x/adventurer/svg?seed=codestar",
            });
        }
    }, [user, reset]);

    const avatarUrl = watch("avatar");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn tệp hình ảnh hợp lệ (jpg, png, svg, gif, etc.)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước tệp quá lớn. Vui lòng chọn tệp dưới 5MB.");
            return;
        }

        setIsUploading(true);
        const uploadToastId = toast.loading("Đang tải ảnh đại diện lên hệ thống...");
        try {
            const res = await userApi.uploadImage(file);
            if (res.success && res.data?.url) {
                setValue("avatar", res.data.url, { shouldValidate: true });
                toast.success("Tải ảnh đại diện lên thành công!", { id: uploadToastId });
            } else {
                toast.error("Tải ảnh thất bại. Vui lòng thử lại.", { id: uploadToastId });
            }
        } catch {
            toast.error("Lỗi kết nối khi tải ảnh lên. Vui lòng thử lại.", { id: uploadToastId });
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setIsSubmitting(true);
        try {
            const response = await userApi.updateProfile(data);
            if (response.success) {
                await mutate(); // Re-validate user state globally
                toast.success(response.message || "Cập nhật hồ sơ thành công!");
            }
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            const msg = err?.response?.data?.message || "Cập nhật thất bại. Vui lòng kiểm tra lại.";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <User className="size-5 text-primary" />
                    <span>Thông tin cá nhân</span>
                </CardTitle>
                <CardDescription>
                    Thay đổi tên hiển thị, địa chỉ email hoặc cập nhật ảnh đại diện của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Centered Large Avatar Preview & S3 Upload */}
                    <div className="flex flex-col items-center justify-center gap-4 pb-6 border-b border-border/40 w-full">
                        <div className="relative group shrink-0 rounded-full overflow-hidden border-2 border-primary/20 bg-muted shadow-md hover:border-primary/50 transition-all duration-300">
                            <label
                                htmlFor="avatar-file-input"
                                className={cn(
                                    "size-28 sm:size-32 rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden transition-all duration-300",
                                    isUploading ? "opacity-70 cursor-not-allowed" : "hover:brightness-90"
                                )}
                            >
                                {avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar preview"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <User className="size-14 text-muted-foreground" />
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Camera className="size-6 text-white animate-in zoom-in-75 duration-250" />
                                    <span className="text-[10px] text-white font-medium">Thay đổi ảnh</span>
                                </div>

                                {/* Uploading spinner overlay */}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-background/85 flex flex-col items-center justify-center gap-1.5">
                                        <Loader2 className="size-6 animate-spin text-primary" />
                                        <span className="text-[9px] text-muted-foreground font-semibold">Đang tải...</span>
                                    </div>
                                )}
                            </label>
                            <input
                                id="avatar-file-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </div>
                        
                        <div className="text-center space-y-1">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 border-dashed text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
                                onClick={() => document.getElementById("avatar-file-input")?.click()}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Upload className="size-3.5" />
                                )}
                                <span>Tải ảnh lên từ máy tính</span>
                            </Button>
                            {errors.avatar && (
                                <p className="text-xs text-destructive font-medium mt-1">{errors.avatar.message}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground max-w-xs">
                                Hỗ trợ JPG, PNG, SVG hoặc GIF (Tối đa 5MB).
                            </p>
                        </div>
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                        <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-1.5">
                            Tên hiển thị
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="username"
                                className="pl-9 h-9"
                                placeholder="Nhập tên hiển thị mới"
                                {...register("username")}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-xs text-destructive mt-1">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-1.5">
                            Địa chỉ Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                id="email"
                                className="pl-9 h-9"
                                type="email"
                                placeholder="Nhập email mới"
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button type="submit" className="w-full sm:w-auto min-w-[120px]" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin mr-2" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4 mr-2" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
