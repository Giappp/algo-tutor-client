"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/api/fetchers";
import { userApi } from "@/api/user";
import { toast } from "sonner";
import { Loader2, Monitor, Smartphone, Trash2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Session {
    id: number;
    ipAddress: string;
    deviceInfo: string;
    createdAt: string;
    expiresAt: string;
    isCurrent: boolean;
}

export function ActiveSessionsCard() {
    const { data: sessions, isLoading, mutate } = useSWR<Session[]>("/users/me/sessions", fetcher);
    const [revokingId, setRevokingId] = useState<number | null>(null);
    const [isWipingOthers, setIsWipingOthers] = useState(false);

    const parseUserAgent = (ua: string) => {
        if (!ua) return { browserAndOs: "Thiết bị không xác định", isMobile: false };
        const lower = ua.toLowerCase();
        let browser = "Trình duyệt khác";
        let os = "Hệ điều hành khác";
        let isMobile = false;

        if (lower.includes("firefox")) browser = "Firefox";
        else if (lower.includes("edge")) browser = "Edge";
        else if (lower.includes("chrome")) browser = "Chrome";
        else if (lower.includes("safari")) browser = "Safari";
        
        if (lower.includes("windows")) os = "Windows";
        else if (lower.includes("macintosh") || lower.includes("mac os")) os = "macOS";
        else if (lower.includes("iphone")) {
            os = "iPhone";
            isMobile = true;
        } else if (lower.includes("android")) {
            os = "Android";
            isMobile = true;
        } else if (lower.includes("linux")) os = "Linux";

        return { browserAndOs: `${browser} trên ${os}`, isMobile };
    };

    const handleTerminate = async (id: number) => {
        setRevokingId(id);
        try {
            const res = await userApi.terminateSession(id);
            if (res.success) {
                toast.success(res.message || "Đã thu hồi phiên đăng nhập.");
                mutate(); // Refresh the list
            }
        } catch {
            toast.error("Không thể thu hồi phiên. Vui lòng thử lại.");
        } finally {
            setRevokingId(null);
        }
    };

    const handleTerminateOthers = async () => {
        if (!confirm("Bạn có chắc chắn muốn đăng xuất khỏi toàn bộ các thiết bị khác không?")) return;
        setIsWipingOthers(true);
        try {
            const res = await userApi.terminateOtherSessions();
            if (res.success) {
                toast.success(res.message || "Đã hủy các phiên đăng nhập khác thành công!");
                mutate(); // Refresh list
            }
        } catch {
            toast.error("Hủy phiên thất bại. Vui lòng thử lại.");
        } finally {
            setIsWipingOthers(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="border border-border bg-card">
                <CardContent className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground font-medium">Đang tải danh sách thiết bị...</p>
                </CardContent>
            </Card>
        );
    }

    const hasOtherSessions = sessions && sessions.some(s => !s.isCurrent);

    return (
        <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Monitor className="size-5 text-primary" />
                        <span>Thiết bị đang hoạt động</span>
                    </CardTitle>
                    <CardDescription>
                        Quản lý và thu hồi quyền đăng nhập từ các thiết bị và trình duyệt đang dùng tài khoản này.
                    </CardDescription>
                </div>
                {hasOtherSessions && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTerminateOthers}
                        disabled={isWipingOthers}
                        className="text-xs border-destructive/30 hover:bg-destructive/10 hover:text-destructive shrink-0"
                    >
                        {isWipingOthers ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                Đang xử lý...
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="size-3.5 mr-1.5" />
                                Đăng xuất các thiết bị khác
                            </>
                        )}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="pt-6">
                <div className="divide-y divide-border/40">
                    {sessions && sessions.length > 0 ? (
                        sessions.map((session) => {
                            const parsed = parseUserAgent(session.deviceInfo);
                            const formattedDate = new Date(session.createdAt).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            });

                            return (
                                <div key={session.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4">
                                    <div className="flex items-start gap-3.5 min-w-0">
                                        <div className="p-2 rounded-xl bg-muted/65 text-muted-foreground shrink-0 mt-0.5">
                                            {parsed.isMobile ? (
                                                <Smartphone className="size-5" />
                                            ) : (
                                                <Monitor className="size-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-sm font-semibold text-foreground truncate">
                                                    {parsed.browserAndOs}
                                                </span>
                                                {session.isCurrent && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-difficulty-easy bg-difficulty-easy/10 px-2 py-0.5 rounded-full border border-difficulty-easy/20 shrink-0">
                                                        <CheckCircle2 className="size-2.5" />
                                                        Thiết bị hiện tại
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                                <span>IP: <strong>{session.ipAddress}</strong></span>
                                                <span className="text-border/60">&middot;</span>
                                                <span>Đăng nhập: {formattedDate}</span>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {!session.isCurrent && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleTerminate(session.id)}
                                            disabled={revokingId === session.id}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg shrink-0 size-8"
                                            title="Thu hồi quyền"
                                        >
                                            {revokingId === session.id ? (
                                                <Loader2 className="size-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="size-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Không tìm thấy thiết bị nào đang hoạt động.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
