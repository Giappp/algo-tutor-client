export const LANGUAGES = [
    { value: "python", label: "Python 3" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
] as const;

export const MONACO_LANGUAGES: Record<string, string> = {
    python: "python",
    java: "java",
    cpp: "cpp",
};
