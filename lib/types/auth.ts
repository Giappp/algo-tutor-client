export interface SignInRequest {
    username: string
    password: string
}

export interface SignUpRequest {
    username: string
    email: string
    password: string
    confirmPassword: string
}

export interface AuthUser {
    id: string
    username: string
    email: string
    role: string
    avatar?: string
}
