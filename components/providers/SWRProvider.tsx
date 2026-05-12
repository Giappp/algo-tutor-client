"use client"

import {ReactNode} from "react";
import {SWRConfig} from "swr";
import {toast} from "sonner";

interface SWRProviderProps {
    children: ReactNode;
}

export function SWRProvider({children}: SWRProviderProps) {
    return (
        <SWRConfig
            value={{
                revalidateOnFocus: false,
                onErrorRetry: (error, key, config, revalidate, {retryCount}) => {
                    const status = error?.response?.status || error?.status || error?.code;

                    if (status === 401 || status === 403 || status === 404) return;

                    if (retryCount >= 3) {
                        toast.error("Lỗi mạng: Không thể kết nối đến máy chủ sau nhiều lần thử.", {
                            id: "NETWORK_ERROR_TOAST", // Dùng chung ID với Axios để đè thông báo
                            duration: 3000,
                        });
                        return;
                    }

                    const retryInterval = Math.min(1000 * 2 ** retryCount, 30000);

                    setTimeout(() => {
                        revalidate({retryCount});
                    }, retryInterval);
                },
            }}
        >
            {children}
        </SWRConfig>
    );
}