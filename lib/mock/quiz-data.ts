import type { Quiz } from "@/lib/types/lesson";

export const MOCK_QUIZZES: Record<string, Quiz> = {
    "arrays-fundamentals-quiz": {
        id: 1,
        slug: "arrays-fundamentals-quiz",
        title: "Arrays Fundamentals Quiz",
        passingScore: 70,
        questions: [
            {
                id: 1,
                text: "What is the time complexity of accessing an element at index `i` in an array?",
                type: "SINGLE_CHOICE",
                options: [
                    { id: "a", text: "O(n)" },
                    { id: "b", text: "O(1)" },
                    { id: "c", text: "O(log n)" },
                    { id: "d", text: "O(n²)" },
                ],
                explanation:
                    "Array elements are stored at contiguous memory locations. To access element at index `i`, the computer calculates the address as: base_address + i × element_size. This is a constant-time operation regardless of array size.",
                correctOptionIds: ["b"],
            },
            {
                id: 2,
                text: "Which of the following operations is O(n) in an array? (Select all that apply)",
                type: "MULTIPLE_CHOICE",
                options: [
                    { id: "a", text: "Searching for an element (unsorted array)" },
                    { id: "b", text: "Accessing by index" },
                    { id: "c", text: "Inserting at the beginning" },
                    { id: "d", text: "Accessing the last element" },
                ],
                explanation:
                    "Searching requires checking potentially all elements (O(n)). Inserting at the beginning requires shifting all existing elements (O(n)). Both accessing by index and accessing the last element are O(1) constant-time operations.",
                correctOptionIds: ["a", "c"],
            },
            {
                id: 3,
                text: "What happens when you try to access an array element at an index outside its bounds?",
                type: "SINGLE_CHOICE",
                options: [
                    { id: "a", text: "JavaScript returns `undefined`, Java throws ArrayIndexOutOfBoundsException" },
                    { id: "b", text: "All languages return null" },
                    { id: "c", text: "The program automatically resizes the array" },
                    { id: "d", text: "The program continues normally with garbage data" },
                ],
                explanation:
                    "Behavior depends on the language. Java and C++ will throw an exception or crash. JavaScript may return `undefined` or return arbitrary memory values (a serious security bug). Always validate indices!",
                correctOptionIds: ["a"],
            },
            {
                id: 4,
                text: "Why are arrays cache-friendly compared to linked lists?",
                type: "SINGLE_CHOICE",
                options: [
                    { id: "a", text: "Arrays are stored in sorted order" },
                    { id: "b", text: "Elements in arrays are stored in contiguous memory locations" },
                    { id: "c", text: "Arrays use less memory than linked lists" },
                    { id: "d", text: "Arrays are always smaller in size" },
                ],
                explanation:
                    "Arrays store elements contiguously in memory. When the CPU loads one element, it also preloads nearby elements into cache (spatial locality). Linked lists scatter elements throughout memory, causing cache misses on each access.",
                correctOptionIds: ["b"],
            },
            {
                id: 5,
                text: "What is the main trade-off when using a hash map to solve the Two Sum problem?",
                type: "SINGLE_CHOICE",
                options: [
                    { id: "a", text: "Time increases but space decreases" },
                    { id: "b", text: "Time decreases but space increases" },
                    { id: "c", text: "Both time and space decrease" },
                    { id: "d", text: "There is no trade-off" },
                ],
                explanation:
                    "Using a hash map reduces time complexity from O(n²) to O(n), but requires O(n) extra space to store the hash map. This is a classic space-time trade-off in algorithm design.",
                correctOptionIds: ["b"],
            },
        ],
    },
    "two-sum-coding-quiz": {
        id: 2,
        slug: "two-sum-coding-quiz",
        title: "Two Sum Problem Quiz",
        passingScore: 60,
        questions: [
            {
                id: 1,
                text: "In the Two Sum problem, what is the 'complement' when examining element `nums[i]`?",
                type: "SINGLE_CHOICE",
                options: [
                    { id: "a", text: "The next element in the array" },
                    { id: "b", text: "target + nums[i]" },
                    { id: "c", text: "target - nums[i]" },
                    { id: "d", text: "nums[i] / 2" },
                ],
                explanation:
                    "The complement is `target - nums[i]`. If `nums[j] = complement`, then `nums[i] + nums[j] = nums[i] + (target - nums[i]) = target`. We're looking for the number that, when added to the current element, equals the target.",
                correctOptionIds: ["c"],
            },
            {
                id: 2,
                text: "Why do we check `complement in seen` before adding `num` to the hash map in the optimal solution?",
                type: "SINGLE_CHOICE",
                options: [
                    { id: "a", text: "To ensure we don't exceed memory limits" },
                    { id: "b", text: "Because we need to find the complement that was already seen, not the current element" },
                    { id: "c", text: "To sort the array" },
                    { id: "d", text: "To avoid division by zero" },
                ],
                explanation:
                    "If we added the current element first, then checked for its complement, we would find the current element itself as a 'match'. We want to find a previously seen element that, together with the current one, sums to the target. So we check first, then add.",
                correctOptionIds: ["b"],
            },
            {
                id: 3,
                text: "Which of the following are valid approaches to solve Two Sum? (Select all that apply)",
                type: "MULTIPLE_CHOICE",
                options: [
                    { id: "a", text: "Brute force with nested loops" },
                    { id: "b", text: "Sorting + two pointers" },
                    { id: "c", text: "Binary search on each element" },
                    { id: "d", text: "Hash map (single pass)" },
                ],
                explanation:
                    "Brute force (O(n²)), sorting with two pointers (O(n log n)), and hash map (O(n)) are all valid approaches. Binary search on each element would be O(n log n), which works but is suboptimal. Note: sorting loses original indices, so you need to track them.",
                correctOptionIds: ["a", "b", "c", "d"],
            },
        ],
    },
};
