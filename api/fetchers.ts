import {apiClient} from "@/api/api-client";
import {AxiosRequestConfig} from "axios";
import {ApiResponse} from "@/lib/types/api";

const handleResponse = <T>(response: ApiResponse<T>): T => {
    if (!response.success) {
        throw new Error(response.message || "Đã có lỗi xảy ra từ máy chủ");
    }
    return response.data;
};

export const fetcher = async <T>(url: string): Promise<T> => {
    const res = await apiClient.get<ApiResponse<T>>(url);
    return handleResponse(res.data);
};

export const fetcherWithParams = async <T>(
    url: string,
    params?: AxiosRequestConfig["params"]
): Promise<T> => {
    const res = await apiClient.get<T>(url, {params});
    return res.data;
};