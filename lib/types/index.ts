export * from "./api"
export * from "./landing"
export * from "./auth"
export * from "./roadmap"

export interface ChatMessage {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
}