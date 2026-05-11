export * from "./api"
export * from "./landing"
export * from "./auth"

export type Difficulty = "Easy" | "Medium" | "Hard"

export interface ChatMessage {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
}

export interface Problem {
    id: string
    title: string
    difficulty: Difficulty
    description: string
    tags: string[]
    examples: ProblemExample[]
    constraints: string[]
}

export interface ProblemExample {
    input: string
    output: string
    explanation?: string
}
