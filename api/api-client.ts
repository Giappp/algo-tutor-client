import axios from "axios";
import {toast} from "sonner";

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
        const status = error.response?.status;
        const url = error.config?.url;
        const hasFieldErrors = error.response?.data?.errors;

        // 1. Nếu là lỗi 401 từ API kiểm tra user hiện tại -> Bỏ qua không hiện toast
        // (Chỉ đơn giản là user chưa đăng nhập, để SWR tự handle)
        if (status === 401 && url?.includes("/iam/me")) {
            return Promise.reject(error);
        }

        // 2. Nếu là lỗi 401 ở các API khác -> Cookie đã hết hạn hoặc không hợp lệ
        if (status === 401) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            // Tùy chọn: Có thể window.location.href = "/login" ở đây nếu muốn force văng ra ngoài
            return Promise.reject(error);
        }

        // 3. Các lỗi server khác (500, 403, 400 không có field errors...)
        if (!hasFieldErrors) {
            const message = error.response?.data?.message || "Lỗi kết nối đến máy chủ";
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

