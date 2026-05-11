"use client"

import {ReactNode} from "react";
import {SWRConfig} from "swr";
import {toast} from "sonner";

interface SWRProviderProps {
    children: ReactNode;
}

export function SWRProvider({children}: SWRProviderProps) {
    return <SWRConfig
        value={{
            // 1. Tắt revalidate khi focus tab để tránh gọi API thừa
            revalidateOnFocus: false,
            // 2. Cấu hình retry logic
            onErrorRetry: (error, key, config, revalidate, {retryCount}) => {
                // Bỏ qua không retry nếu là lỗi xác thực hoặc 404
                const status = error?.response?.status || error?.status || error?.code;
                if (status === 401 || status === 403 || status === 404) return;

                // Nếu đã thử quá 3 lần -> Báo lỗi và Dừng (Không gọi revalidate nữa)
                if (retryCount >= 3) {
                    toast.error("Lỗi mạng: Không thể kết nối đến máy chủ sau 3 lần thử.");
                    return;
                }

                // Tính toán thời gian chờ giữa các lần retry (Exponential backoff)
                // Lần 1: 2s, Lần 2: 4s, Lần 3: 8s...
                const retryInterval = Math.min(1000 * 2 ** retryCount, 30000);

                setTimeout(() => {
                    revalidate({retryCount});
                }, retryInterval);
            },
        }}
    >{children}</SWRConfig>
}