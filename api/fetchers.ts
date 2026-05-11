// api/fetchers.ts
import {apiClient} from "@/api/api-client";
import {AxiosRequestConfig} from "axios";
import {ApiResponse} from "@/lib/types/api";

const handleResponse = <T>(response: ApiResponse<T>): T => {
    if (!response.success) {
        throw new Error(response.message || "Đã có lỗi xảy ra từ máy chủ");
    }
    return response.data;
};
// 1. Fetcher cơ bản cho GET (không params)
export const fetcher = async <T>(url: string): Promise<T> => {
    const res = await apiClient.get<ApiResponse<T>>(url);
    return handleResponse(res.data);
};

// 2. Fetcher cho GET có params (Phân trang, lọc)
export const fetcherWithParams = async <T>(
    url: string,
    params?: AxiosRequestConfig["params"]
): Promise<T> => {
    const res = await apiClient.get<ApiResponse<T>>(url, {params});
    return handleResponse(res.data);
};