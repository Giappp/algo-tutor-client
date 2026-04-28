/**
 * api-client — Axios instance configured for the Spring Boot backend.
 * All landing page API calls go through here.
 *
 * BACKEND: Set NEXT_PUBLIC_API_BASE_URL in your .env.local
 *   e.g. NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
 */

import axios from "axios";

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    // Wait up to 10s for the backend to respond
    timeout: 10_000,
});

