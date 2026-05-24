import axios from "axios";
import { toast } from "sonner";
import { getMockResponse, mockEnroll, mockUpdateProgress } from "@/lib/mock/mock-api";

const NETWORK_ERROR_TOAST_ID = "NETWORK_ERROR_TOAST";
const USE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

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

        // Mock fallback: if backend is unreachable, try mock data
        if (isNetworkOrTimeoutError && USE_MOCK_FALLBACK) {
            const config = error.config;
            const method = config?.method?.toLowerCase() ?? "get";
            const url = config?.url ?? "";

            const mockData = getMockResponse(method, url);
            if (mockData) {
                // Handle side effects for mutations
                const enrollMatch = url.match(/^\/roadmaps\/([^/]+)\/enroll$/);
                if (method === "post" && enrollMatch) {
                    mockEnroll(enrollMatch[1]);
                }
                const progressMatch = url.match(/^\/roadmaps\/([^/]+)\/lessons\/([^/]+)\/progress$/);
                if (method === "patch" && progressMatch) {
                    const status = config?.data ? JSON.parse(config.data)?.status : "COMPLETED";
                    mockUpdateProgress(progressMatch[1], progressMatch[2], status);
                }

                // Return a fake axios response
                return Promise.resolve({
                    data: mockData,
                    status: 200,
                    statusText: "OK (Mock)",
                    headers: {},
                    config,
                });
            }
        }

        if (isNetworkOrTimeoutError) {
            toast.error("Lỗi kết nối mạng hoặc máy chủ không phản hồi.", {
                id: NETWORK_ERROR_TOAST_ID,
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

        if (status === 403) {
            return Promise.reject(error);
        }

        if (status === 401) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
                id: "AUTH_ERROR_TOAST"
            });
            return Promise.reject(error);
        }

        if (!hasFieldErrors) {
            const message = error.response?.data?.message || "Đã xảy ra lỗi hệ thống";
            toast.error(message, {
                id: status >= 500 ? "SERVER_ERROR_TOAST" : undefined
            });
        }

        return Promise.reject(error);
    }
);

