import type { ChatMessage } from "@/lib/types/lesson";

const CHAT_STORAGE_KEY_PREFIX = "ai-tutor-chat-";
const CONVERSATION_STORAGE_KEY_PREFIX = "ai-conversation-id-";
const ACTIVE_CODE_KEY_PREFIX = "active-code-";
const ACTIVE_LANGUAGE_KEY_PREFIX = "active-lang-";
const ACTIVE_JUDGE_RESULT_KEY_PREFIX = "active-judge-result-";

interface JudgeResultEntry {
    passed?: boolean;
    error?: string;
}

interface StoredJudgeResult {
    verdict?: string;
    compilationError?: string;
    results?: JudgeResultEntry[];
}

export interface WorkspaceSnapshot {
    code: string;
    language: string;
    verdict?: string;
    errorMessage?: string;
    failedCount: number;
    totalCount: number;
}

export interface FailedTestCaseSnapshot {
    verdict?: string;
    errorMessage?: string;
    failedTestCases: string[];
}

export interface ActiveCodeSnapshot {
    code: string;
    language: string;
}

export function getStorageKey(lessonSlug: string): string {
    return `${CHAT_STORAGE_KEY_PREFIX}${lessonSlug}`;
}

export function getConversationStorageKey(lessonSlug: string): string {
    return `${CONVERSATION_STORAGE_KEY_PREFIX}${lessonSlug}`;
}

export function loadChatHistory(lessonSlug: string): ChatMessage[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(getStorageKey(lessonSlug));
        if (!raw) return [];

        const parsed = JSON.parse(raw) as ChatMessage[];
        return parsed.map((message) => ({
            ...message,
            timestamp: new Date(message.timestamp),
        }));
    } catch {
        return [];
    }
}

export function saveChatHistory(lessonSlug: string, messages: ChatMessage[]) {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(getStorageKey(lessonSlug), JSON.stringify(messages));
    } catch {
        // ignore storage quota/private mode errors
    }
}

export function readConversationId(lessonSlug: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(getConversationStorageKey(lessonSlug));
}

export function saveConversationId(lessonSlug: string, conversationId: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(getConversationStorageKey(lessonSlug), conversationId);
}

export function clearTutorSession(lessonSlug: string) {
    if (typeof window === "undefined") return;

    localStorage.removeItem(getStorageKey(lessonSlug));
    localStorage.removeItem(getConversationStorageKey(lessonSlug));
}

export function readActiveCodeSnapshot(lessonSlug: string): ActiveCodeSnapshot {
    const code = sessionStorage.getItem(`${ACTIVE_CODE_KEY_PREFIX}${lessonSlug}`) || "";
    const language = sessionStorage.getItem(`${ACTIVE_LANGUAGE_KEY_PREFIX}${lessonSlug}`) || "PYTHON";

    return {
        code,
        language: language.toUpperCase(),
    };
}

export function readWorkspaceSnapshot(lessonSlug: string): WorkspaceSnapshot {
    const activeCode = readActiveCodeSnapshot(lessonSlug);
    const storedResult = sessionStorage.getItem(`${ACTIVE_JUDGE_RESULT_KEY_PREFIX}${lessonSlug}`);

    let verdict: string | undefined;
    let errorMessage: string | undefined;
    let failedCount = 0;
    let totalCount = 0;

    if (storedResult) {
        const parsed = JSON.parse(storedResult) as StoredJudgeResult;

        verdict = parsed.verdict;
        errorMessage =
            parsed.compilationError ||
            parsed.results?.find((result) => !result.passed)?.error ||
            "";

        if (Array.isArray(parsed.results)) {
            totalCount = parsed.results.length;
            failedCount = parsed.results.filter((result) => !result.passed).length;
        }
    }

    return {
        code: activeCode.code,
        language: activeCode.language,
        verdict,
        errorMessage,
        failedCount,
        totalCount,
    };
}

export function readFailedTestCases(lessonSlug: string): FailedTestCaseSnapshot {
    try {
        const storedResult = sessionStorage.getItem(`${ACTIVE_JUDGE_RESULT_KEY_PREFIX}${lessonSlug}`);
        if (!storedResult) return { failedTestCases: [] };

        const parsed = JSON.parse(storedResult) as StoredJudgeResult;

        const verdict = parsed.verdict;
        const errorMessage =
            parsed.compilationError ||
            parsed.results?.find((result) => !result.passed)?.error ||
            "";

        const failedTestCases =
            parsed.results
                ?.map((result, index) => (!result.passed ? `test_case_${index + 1}` : null))
                .filter((value: string | null): value is string => value !== null) || [];

        return {
            verdict,
            errorMessage,
            failedTestCases,
        };
    } catch {
        return { failedTestCases: [] };
    }
}
