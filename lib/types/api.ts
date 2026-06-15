export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    errors?: string | Record<string, string[]>;
    code?: number;
}

export interface PageResponse<T> {
    data: T[];
    pageSize: number;
    totalPages: number;
    totalElements: number;
    currentPage: number;
}
