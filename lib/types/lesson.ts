export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface CodingProblem {
    id: number;
    title: string;
    slug: string;
    description: string;
    starterCode: Record<string, string>;
    testCases: TestCase[];
    hints: string[];
    timeLimit: number;
    memoryLimit: number;
}

export interface QuizOption {
    id: string;
    text: string;
}

export interface QuizQuestion {
    id: number;
    text: string;
    type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
    options: QuizOption[];
    explanation: string;
    correctOptionIds: string[];
}

export interface Quiz {
    id: number;
    slug: string;
    title: string;
    questions: QuizQuestion[];
    passingScore: number;
}

export interface TheoryLesson {
    id: number;
    slug: string;
    title: string;
    content: string;
    estimatedMinutes: number;
}

export interface LessonSummary {
    slug: string;
    title: string;
    type: "THEORY" | "QUIZ" | "CODING";
}

export interface LessonNav {
    prev: LessonSummary | null;
    next: LessonSummary | null;
}

export interface LessonContext {
    roadmapSlug: string;
    roadmapName: string;
    lessonSlug: string;
    lessonTitle: string;
    lessonType: "THEORY" | "QUIZ" | "CODING";
    lessonId?: number;
    problemDescription?: string;
}

export interface TestResult {
    stdin: string;
    expected: string;
    actual: string;
    passed: boolean;
    hidden: boolean;
    executionTime?: number;
    error?: string;
}

export interface Submission {
    id: string;
    timestamp: Date;
    language: string;
    status: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED" | "COMPILATION_ERROR";
    passedCount: number;
    totalCount: number;
    executionTime: number;
    memoryUsed: number;
    code: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
}

// Quiz Attempt types

export interface QuizAttemptAnswer {
    questionId: number;
    selectedOptionIds: string[];
}

export interface QuizAttemptRequest {
    answers: QuizAttemptAnswer[];
    startedAt: string;
    completedAt: string;
    timeSpentSeconds: number;
}

export interface QuizQuestionResult {
    questionId: number;
    isCorrect: boolean;
    correctOptionIds: string[];
}

export interface QuizAttemptResponse {
    id: string;
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    attemptNumber: number;
    completedAt: string;
    questionResults: QuizQuestionResult[];
    lessonProgressUpdated: boolean;
}

export interface QuizAttemptSummary {
    id: string;
    attemptNumber: number;
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    completedAt: string;
    timeSpentSeconds: number;
}
