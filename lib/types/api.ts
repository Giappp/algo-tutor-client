export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
    errors?: Record<string, string[]>;
}

export interface PageResponse<T> {
    data: T[];
    pageSize: number;
    totalPages: number;
    totalElements: number;
    currentPage: number;
}