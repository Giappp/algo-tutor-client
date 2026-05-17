import type { TheoryLesson } from "@/lib/types/lesson";

export const MOCK_THEORY_LESSONS: Record<string, TheoryLesson> = {
    "intro-to-arrays": {
        id: 1,
        slug: "intro-to-arrays",
        title: "Introduction to Arrays",
        estimatedMinutes: 8,
        content: `# Introduction to Arrays

Arrays are one of the most fundamental data structures in computer science. They are **contiguous blocks of memory** that store elements of the same type, accessible by their index.

## What is an Array?

An array is a collection of items stored at contiguous memory locations. The idea is to store multiple items of the same type together.

\`\`\`
Index:     0      1      2      3      4
Value:    [12]   [45]   [78]   [23]   [91]
Address:  0x100  0x104  0x108  0x10C  0x110
\`\`\`

> **Key Insight:** In most languages, array indices start at 0. The first element is always at index 0.

## Key Properties

### 1. Fixed Size (in most static languages)
In languages like Java, C++, and Go, arrays have a **fixed size** that must be known at compile time.

\`\`\`java
int[] numbers = new int[5]; // Creates array of 5 integers
\`\`\`

### 2. Random Access — O(1)
One of the biggest advantages of arrays is **constant-time random access**.

\`\`\`
Access element at index i:  O(1)
Because:  address(i) = base_address + i × element_size
\`\`\`

### 3. Cache-Friendly
Modern CPUs cache data in blocks. Because arrays store elements contiguously, accessing element \`arr[i]\` makes it highly likely that \`arr[i+1]\` is already in the CPU cache. This is called **spatial locality**.

## Common Operations

| Operation | Time Complexity | Description |
|-----------|-----------------|-------------|
| Access by index | O(1) | Get element at position i |
| Search | O(n) | Find if element exists |
| Insert (at end) | O(1)* | Add element to the end |
| Insert (at position) | O(n) | Insert at middle |
| Delete | O(n) | Remove element and shift |

*Amortized for dynamic arrays (ArrayList, vector)

## When to Use Arrays

**Use arrays when:**
- You need fast random access to elements
- You know the exact size upfront
- You need cache-friendly iteration
- You want simple, readable code

**Consider alternatives when:**
- You need frequent insertions/deletions in the middle
- The size is unknown and changes frequently (use dynamic arrays or linked lists)

## Memory Layout

\`\`\`
Stack                    Heap
┌──────────────┐        ┌─────────────────────────────┐
│ arr (ref) ───┼───────►│ [12] [45] [78] [23] [91]   │
└──────────────┘        └─────────────────────────────┘
\`\`\`

The array reference lives on the stack, but the actual data lives on the heap (for dynamically allocated arrays).

## Practice Tips

1. Always be mindful of **off-by-one errors** — array indices start at 0, not 1
2. Check **boundary conditions** — accessing \`arr[-1]\` or \`arr[n]\` causes crashes
3. Use \`arr.length\` (or equivalent) instead of hardcoding sizes
4. Remember that arrays are **passed by reference** in most languages — modifying the array inside a function modifies the original

---

Ready to practice? Head to the quiz below to test your understanding of arrays!
`,
    },
    "two-sum-problem": {
        id: 2,
        slug: "two-sum-problem",
        title: "The Two Sum Problem",
        estimatedMinutes: 10,
        content: `# The Two Sum Problem

Two Sum is the "Hello World" of algorithmic problem-solving. Nearly every developer encounters it early in their journey.

## Problem Statement

> Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to \`target\`.
>
> You may assume that **each input has exactly one solution**, and you may not use the same element twice.
> Return the answer in any order.

### Example

\`\`\`
Input:  nums = [2, 7, 11, 15],  target = 9
Output: [0, 1]
Reason: nums[0] + nums[1] = 2 + 7 = 9
\`\`\`

## Approach 1: Brute Force — O(n²)

The simplest approach: check every pair of numbers.

\`\`\`python
def two_sum_brute(nums: list[int], target: int) -> list[int]:
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []
\`\`\`

### Why O(n²)?
- Outer loop runs **n** times
- Inner loop runs at most **n-1, n-2, ...** times
- Total: n(n-1)/2 ≈ n²/2

### Time vs Space
| | Brute Force |
|---|---|
| Time | O(n²) |
| Space | O(1) |

---

## Approach 2: Hash Map — O(n)

Use a hash map to store numbers we've seen and their indices. For each element, check if \`target - element\` exists in the map.

\`\`\`python
def two_sum_hash(nums: list[int], target: int) -> list[int]:
    seen = {}  # value → index

    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i

    return []
\`\`\`

### Step-by-step visualization

\`\`\`
nums = [2, 7, 11, 15], target = 9

i=0: num=2,  complement=7,  seen={}           → not found, store {2:0}
i=1: num=7,  complement=2,  seen={2:0}         → FOUND! return [0, 1]

Done in 2 iterations instead of 6 comparisons.
\`\`\`

### Why O(n)?
- Single pass through the array: **O(n)**
- Hash map lookup/insert: **O(1)** average

### Time vs Space
| | Hash Map |
|---|---|
| Time | O(n) |
| Space | O(n) |

---

## Which Approach to Use?

| Scenario | Recommended Approach |
|----------|---------------------|
| Interview (expected) | Hash Map |
| Very small arrays (< 10) | Brute force is fine |
| Memory constrained | Consider brute force |
| Multiple queries | Preprocessing helps |

## Key Takeaways

1. **Trade space for time** — the hash map solution uses O(n) space to achieve O(n) time
2. **Single pass** — we only traverse the array once
3. **Early termination** — as soon as we find the answer, we stop
4. **Complement thinking** — the core insight is to look for \`target - current\`

---

> **Pro Tip:** In a real interview, always start by mentioning the brute force approach, then optimize. Interviewers want to see your thought process!
`,
    },
    "array-traversal-patterns": {
        id: 3,
        slug: "array-traversal-patterns",
        title: "Array Traversal Patterns",
        estimatedMinutes: 6,
        content: `# Array Traversal Patterns

Mastering array traversal patterns unlocks solutions to dozens of common problems. Let's explore the most important ones.

## 1. Forward Traversal

The most common pattern — iterate from left to right.

\`\`\`python
for i in range(len(arr)):
    process(arr[i])
\`\`\`

## 2. Two Pointers

Use two pointers moving toward or away from each other.

### Opposite Directions (Palindrome Check)
\`\`\`python
def is_palindrome(s: str) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
\`\`\`

### Same Direction (Remove Duplicates)
\`\`\`python
def remove_duplicates(nums: list[int]) -> int:
    if not nums:
        return 0

    write_ptr = 1
    for read_ptr in range(1, len(nums)):
        if nums[read_ptr] != nums[read_ptr - 1]:
            nums[write_ptr] = nums[read_ptr]
            write_ptr += 1

    return write_ptr
\`\`\`

## 3. Sliding Window

Maintain a "window" that expands and contracts.

### Fixed Size Window
\`\`\`python
def max_subarray_sum_k(arr: list[int], k: int) -> int:
    window_sum = sum(arr[:k])
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)

    return max_sum
\`\`\`

### Dynamic Size Window
\`\`\`python
def longest_substring_k_distinct(s: str, k: int) -> int:
    char_count = {}
    left = 0
    max_length = 0

    for right in range(len(s)):
        char_count[s[right]] = char_count.get(s[right], 0) + 1

        while len(char_count) > k:
            char_count[s[left]] -= 1
            if char_count[s[left]] == 0:
                del char_count[s[left]]
            left += 1

        max_length = max(max_length, right - left + 1)

    return max_length
\`\`\`

## Pattern Comparison

| Pattern | Time | Space | Use When |
|---------|------|-------|----------|
| Forward | O(n) | O(1) | Simple iteration |
| Two Pointers | O(n) | O(1) | Searching pairs, palindromes |
| Sliding Window | O(n) | O(1) to O(n) | Subarrays, substrings |

## When to Use Each

- **Forward**: Just need to visit every element once
- **Two Pointers**: Need to compare elements from both ends, or eliminate half the search space
- **Sliding Window**: Need to find subarrays/substrings with certain properties
`,
    },
};
