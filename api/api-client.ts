import axios, {
    type AxiosError,
    type InternalAxiosRequestConfig,
} from "axios";
import { mutate } from "swr";
import { toast } from "sonner";
import { getMockResponse, mockEnroll, mockUpdateProgress } from "@/lib/mock/mock-api";
import type { ApiResponse } from "@/lib/types";

const NETWORK_ERROR_TOAST_ID = "NETWORK_ERROR_TOAST";
const USE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const TERMINAL_TOKEN_ERROR_CODES = new Set([1004, 1005]);

type RetryableRequest = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

let refreshPromise: Promise<void> | null = null;
let isRedirectingToSignIn = false;

export const publicApiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10_000,
});

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10_000,
});

async function refreshSession(): Promise<void> {
    await apiClient.post("/iam/refresh");
}

function isLandingPath(pathname: string): boolean {
    return pathname === "/";
}

function isAuthMeRequest(url: string): boolean {
    return url.includes("/iam/me");
}

function isLandingAuthMeCheck(url: string): boolean {
    if (typeof window === "undefined") return false;
    return isLandingPath(window.location.pathname) && isAuthMeRequest(url);
}

function parseRequestData(data: unknown): Record<string, unknown> | null {
    if (data === null || data === undefined) return null;
    if (typeof data === "object") return data as Record<string, unknown>;
    if (typeof data !== "string") return null;

    try {
        const parsed = JSON.parse(data);
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
}

function clearSessionAndRedirect(options?: { silent?: boolean }): void {
    if (typeof window === "undefined") return;

    void mutate(() => true, undefined, { revalidate: false });

    if (options?.silent || isLandingPath(window.location.pathname)) return;
    if (window.location.pathname.startsWith("/auth")) return;
    if (isRedirectingToSignIn) return;

    isRedirectingToSignIn = true;
    const redirect = `${window.location.pathname}${window.location.search}`;
    const signInUrl = new URL("/auth", window.location.origin);
    signInUrl.searchParams.set("tab", "signin");
    signInUrl.searchParams.set("redirect", redirect);
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

    window.location.assign(signInUrl.toString());
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse<unknown>>) => {
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
                    const requestData = parseRequestData(config?.data);
                    const status = typeof requestData?.status === "string" ? requestData.status : "COMPLETED";
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

        const originalRequest = error.config as RetryableRequest | undefined;
        const status = error.response?.status;
        const url = originalRequest?.url ?? "";
        const responseErrors = error.response?.data?.errors;
        const hasFieldErrors = responseErrors !== null && typeof responseErrors === "object";
        const errorCode = error.response?.data?.code;
        const isRefreshRequest = url.includes("/iam/refresh");
        const isPublicAuthRequest = url.includes("/iam/signin") || url.includes("/iam/signup");
        const isOptionalLandingAuthMeRequest = isLandingAuthMeCheck(url);
        const isTerminalTokenError = errorCode !== undefined && TERMINAL_TOKEN_ERROR_CODES.has(errorCode);

        if (status === 401) {
            if (isRefreshRequest || isTerminalTokenError) {
                clearSessionAndRedirect({silent: isOptionalLandingAuthMeRequest});
                return Promise.reject(error);
            }

            // Public auth failures are expected user-facing errors, not expired sessions.
            if (!originalRequest || originalRequest._retry || isPublicAuthRequest) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                refreshPromise ??= refreshSession().finally(() => {
                    refreshPromise = null;
                });
                await refreshPromise;
                return apiClient(originalRequest);
            } catch (refreshError) {
                clearSessionAndRedirect({silent: isOptionalLandingAuthMeRequest});
                return Promise.reject(refreshError);
            }
        }

        if (status === 403) {
            return Promise.reject(error);
        }

        if (!hasFieldErrors) {
            const message = typeof responseErrors === "string"
                ? responseErrors
                : error.response?.data?.message || "Đã xảy ra lỗi hệ thống";
            toast.error(message, {
                id: status !== undefined && status >= 500 ? "SERVER_ERROR_TOAST" : undefined
            });
        }

        return Promise.reject(error);
    }
);
