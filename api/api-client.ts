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
        const message = error.response?.data?.message || "Lỗi kết nối đến máy chủ";
        toast.error(message);

        return Promise.reject(error);
    }
);

