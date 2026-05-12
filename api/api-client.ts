import axios from "axios";
import {toast} from "sonner";

const NETWORK_ERROR_TOAST_ID = "NETWORK_ERROR_TOAST";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10_000,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isNetworkOrTimeoutError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';

        if (isNetworkOrTimeoutError) {
            toast.error("Lỗi kết nối mạng hoặc máy chủ không phản hồi.", {
                id: NETWORK_ERROR_TOAST_ID, // Sonner sẽ chỉ hiện 1 thông báo duy nhất với ID này
                duration: 5000,
            });
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const url = error.config?.url;
        const hasFieldErrors = error.response?.data?.errors;

        if (status === 401 && url?.includes("/iam/me")) {
            return Promise.reject(error);
        }

        if (status === 401) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
                id: "AUTH_ERROR_TOAST" // Tránh spam lỗi 401 nếu có nhiều API gọi cùng lúc
            });
            return Promise.reject(error);
        }

        if (!hasFieldErrors) {
            const message = error.response?.data?.message || "Đã xảy ra lỗi hệ thống";
            toast.error(message, {
                // Tùy chọn: Nhóm các lỗi 500 lại với nhau để tránh spam
                id: status >= 500 ? "SERVER_ERROR_TOAST" : undefined
            });
        }

        return Promise.reject(error);
    }
);

