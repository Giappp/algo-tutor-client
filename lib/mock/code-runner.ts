/**
 * Mock code runner that evaluates JavaScript code against test cases.
 * For Python/Java/C++, it simulates execution with realistic delays.
 * In production, this would call a backend judge API.
 */

import type { TestCase, TestResult } from "@/lib/types/lesson";

interface RunCodeOptions {
    code: string;
    language: string;
    testCases: TestCase[];
    timeLimit: number;
    /** Only run visible test cases (for "Run") vs all (for "Submit") */
    runAll: boolean;
    /** The problem slug to determine how to parse I/O */
    problemSlug: string;
}

interface RunCodeResult {
    results: TestResult[];
    totalTime: number;
    error?: string;
}

// Solution validators for each problem (used for non-JS languages to simulate)
const PROBLEM_SOLUTIONS: Record<string, (input: string) => string> = {
    "two-sum-coding": (input: string) => {
        const parts = input.split("|");
        const nums = parts[0].split(",").map(Number);
        const target = Number(parts[1]);
        const map = new Map<number, number>();
        for (let i = 0; i < nums.length; i++) {
            const complement = target - nums[i];
            if (map.has(complement)) {
                return `${map.get(complement)},${i}`;
            }
            map.set(nums[i], i);
        }
        return "";
    },
    "reverse-string-coding": (input: string) => {
        const chars = input.split(",");
        return chars.reverse().join(",");
    },
    "valid-palindrome-coding": (input: string) => {
        const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, "");
        const reversed = cleaned.split("").reverse().join("");
        return String(cleaned === reversed);
    },
    "max-subarray-coding": (input: string) => {
        const nums = input.split(",").map(Number);
        let maxSum = nums[0];
        let currentSum = nums[0];
        for (let i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        return String(maxSum);
    },
    "binary-search-coding": (input: string) => {
        const parts = input.split("|");
        const nums = parts[0].split(",").map(Number);
        const target = Number(parts[1]);
        let left = 0, right = nums.length - 1;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (nums[mid] === target) return String(mid);
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return "-1";
    },
    "merge-sorted-arrays-coding": (input: string) => {
        const parts = input.split("|");
        const arr1 = parts[0].split(",").map(Number);
        const arr2 = parts[1].split(",").map(Number);
        const merged: number[] = [];
        let i = 0, j = 0;
        while (i < arr1.length && j < arr2.length) {
            if (arr1[i] <= arr2[j]) merged.push(arr1[i++]);
            else merged.push(arr2[j++]);
        }
        while (i < arr1.length) merged.push(arr1[i++]);
        while (j < arr2.length) merged.push(arr2[j++]);
        return merged.join(",");
    },
    "climbing-stairs-coding": (input: string) => {
        const n = Number(input);
        if (n <= 2) return String(n);
        let prev2 = 1, prev1 = 2;
        for (let i = 3; i <= n; i++) {
            const curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return String(prev1);
    },
};

/**
 * Attempts to run JavaScript code and evaluate it against test cases.
 * Uses Function constructor for sandboxed execution.
 */
function executeJavaScript(code: string, testCase: TestCase, problemSlug: string): TestResult {
    const startTime = performance.now();

    try {
        // Build a wrapper that calls the user's function with parsed input
        const wrappedCode = buildJSWrapper(code, testCase.input, problemSlug);
        const fn = new Function(wrappedCode);
        const result = fn();
        const executionTime = Math.round(performance.now() - startTime);

        const actual = String(result ?? "").trim();
        const expected = testCase.expectedOutput.trim();
        const passed = actual === expected;

        return {
            stdin: testCase.input,
            expected,
            actual,
            passed,
            hidden: testCase.isHidden,
            executionTime,
        };
    } catch (err: unknown) {
        const executionTime = Math.round(performance.now() - startTime);
        const errorMessage = err instanceof Error ? err.message : String(err);

        return {
            stdin: testCase.input,
            expected: testCase.expectedOutput,
            actual: "",
            passed: false,
            hidden: testCase.isHidden,
            executionTime,
            error: errorMessage,
        };
    }
}

function buildJSWrapper(code: string, input: string, problemSlug: string): string {
    switch (problemSlug) {
        case "two-sum-coding": {
            const parts = input.split("|");
            const nums = parts[0];
            const target = parts[1];
            return `${code}\nreturn twoSum([${nums}], ${target}).join(",");`;
        }
        case "reverse-string-coding": {
            const chars = input.split(",").map(c => `"${c}"`).join(",");
            return `${code}\nconst s = [${chars}];\nreverseString(s);\nreturn s.join(",");`;
        }
        case "valid-palindrome-coding": {
            return `${code}\nreturn String(isPalindrome(${JSON.stringify(input)}));`;
        }
        case "max-subarray-coding": {
            return `${code}\nreturn String(maxSubArray([${input}]));`;
        }
        case "binary-search-coding": {
            const parts = input.split("|");
            return `${code}\nreturn String(search([${parts[0]}], ${parts[1]}));`;
        }
        case "merge-sorted-arrays-coding": {
            const parts = input.split("|");
            return `${code}\nreturn merge([${parts[0]}], [${parts[1]}]).join(",");`;
        }
        case "climbing-stairs-coding": {
            return `${code}\nreturn String(climbStairs(${input}));`;
        }
        default:
            return `${code}\nreturn "";`;
    }
}

/**
 * Simulates code execution for non-JS languages using the known solutions.
 * Adds realistic random variation to simulate real execution.
 */
function simulateExecution(
    code: string,
    testCase: TestCase,
    problemSlug: string,
    language: string
): TestResult {
    const solver = PROBLEM_SOLUTIONS[problemSlug];

    // If code is just the starter code (hasn't been modified much), fail
    const isStarterCode = code.trim().includes("# Your code here") ||
        code.trim().includes("// Your code here") ||
        code.trim().includes("pass") && code.split("\n").length < 5;

    if (isStarterCode) {
        return {
            stdin: testCase.input,
            expected: testCase.expectedOutput,
            actual: "",
            passed: false,
            hidden: testCase.isHidden,
            executionTime: Math.floor(Math.random() * 5) + 1,
            error: language === "python"
                ? "TypeError: unsupported operand type(s)"
                : language === "java"
                    ? "java.lang.ArrayIndexOutOfBoundsException"
                    : "Runtime Error",
        };
    }

    // If user has written substantial code, use the solution validator
    if (solver) {
        const expected = testCase.expectedOutput.trim();
        const actual = solver(testCase.input);
        const executionTime = Math.floor(Math.random() * 20) + 5;

        return {
            stdin: testCase.input,
            expected,
            actual,
            passed: actual === expected,
            hidden: testCase.isHidden,
            executionTime,
        };
    }

    // Fallback: random pass/fail
    const passed = Math.random() > 0.3;
    return {
        stdin: testCase.input,
        expected: testCase.expectedOutput,
        actual: passed ? testCase.expectedOutput : "incorrect",
        passed,
        hidden: testCase.isHidden,
        executionTime: Math.floor(Math.random() * 30) + 5,
    };
}

/**
 * Main entry point: runs code against test cases.
 */
export async function runCode(options: RunCodeOptions): Promise<RunCodeResult> {
    const { code, language, testCases, timeLimit, runAll, problemSlug } = options;

    // Simulate network/compilation delay
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700));

    const casesToRun = runAll ? testCases : testCases.filter((tc) => !tc.isHidden);
    const results: TestResult[] = [];
    let totalTime = 0;

    for (const tc of casesToRun) {
        let result: TestResult;

        if (language === "javascript") {
            result = executeJavaScript(code, tc, problemSlug);
        } else {
            result = simulateExecution(code, tc, problemSlug, language);
        }

        results.push(result);
        totalTime += result.executionTime ?? 0;

        // Check time limit
        if ((result.executionTime ?? 0) > timeLimit) {
            result.passed = false;
            result.error = `Time Limit Exceeded (${result.executionTime}ms > ${timeLimit}ms)`;
        }
    }

    // For hidden test cases not run (in "Run" mode), add placeholder results
    if (!runAll) {
        const hiddenCases = testCases.filter((tc) => tc.isHidden);
        for (const tc of hiddenCases) {
            results.push({
                stdin: tc.input,
                expected: tc.expectedOutput,
                actual: "",
                passed: false,
                hidden: true,
                executionTime: 0,
            });
        }
    }

    return { results, totalTime };
}

/**
 * Determines submission status from results.
 */
export function getSubmissionStatus(results: TestResult[]): "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED" {
    const hasError = results.some((r) => r.error && !r.error.includes("Time Limit"));
    const hasTLE = results.some((r) => r.error?.includes("Time Limit"));
    const allPassed = results.every((r) => r.passed);

    if (hasError) return "RUNTIME_ERROR";
    if (hasTLE) return "TIME_LIMIT_EXCEEDED";
    if (allPassed) return "ACCEPTED";
    return "WRONG_ANSWER";
}
