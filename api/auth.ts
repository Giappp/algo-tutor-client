import {apiClient} from "./api-client"
import type {SignInRequest, SignUpRequest} from "@/lib/types/auth"
import {ApiResponse} from "@/lib/types";

export async function signIn(data: SignInRequest): Promise<ApiResponse<string>> {
    const response = await apiClient.post<ApiResponse<string>>("/iam/signin", data)
    return response.data
}

export async function signUp(data: SignUpRequest): Promise<ApiResponse<string>> {
    const response = await apiClient.post<ApiResponse<string>>("/iam/signup", data)
    return response.data
}

export async function logout(): Promise<ApiResponse<string>> {
    const response = await apiClient.post<ApiResponse<string>>("/iam/logout")
    return response.data
}
