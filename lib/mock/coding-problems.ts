import type { CodingProblem } from "@/lib/types/lesson";

export const MOCK_CODING_PROBLEMS: Record<string, CodingProblem> = {
    "two-sum-coding": {
        id: 1,
        slug: "two-sum-coding",
        title: "Two Sum",
        description: `## Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume that each input has **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Examples

**Example 1:**
\`\`\`
Input:  nums = [2, 7, 11, 15], target = 9
Output: [0, 1]
Explanation: nums[0] + nums[1] == 9, so we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [3, 2, 4], target = 6
Output: [1, 2]
\`\`\`

**Example 3:**
\`\`\`
Input:  nums = [3, 3], target = 6
Output: [0, 1]
\`\`\`

### Constraints

- \`2 <= nums.length <= 10⁴\`
- \`-10⁹ <= nums[i] <= 10⁹\`
- \`-10⁹ <= target <= 10⁹\`
- Only one valid answer exists.

### Follow-up

Can you come up with an algorithm that is **less than O(n²)** time complexity?`,
        starterCode: {
            javascript: `function twoSum(nums, target) {
    // Your code here
}`,
            python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass`,
            java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
            cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
        return {};
    }
};`,
        },
        testCases: [
            { input: "2,7,11,15|9", expectedOutput: "0,1", isHidden: false },
            { input: "3,2,4|6", expectedOutput: "1,2", isHidden: false },
            { input: "3,3|6", expectedOutput: "0,1", isHidden: false },
            { input: "1,5,3,7,9,2|8", expectedOutput: "0,3", isHidden: true },
            { input: "-1,-2,-3,-4,-5|-8", expectedOutput: "2,4", isHidden: true },
        ],
        hints: [
            "Think about what two numbers add up to the target. If you know one number, do you know what the other should be?",
            "For each number `x` in the array, we need to find if `target - x` exists in the array.",
            "Use a hash map (dictionary) to store numbers you've seen and their indices. For each number, check if `target - number` is already in the map.",
            "Here's the solution pattern: iterate through the array, calculate the complement, check the map for it. If found, return both indices. If not, add the current number to the map.",
        ],
        timeLimit: 2000,
        memoryLimit: 256,
    },
    "reverse-string-coding": {
        id: 2,
        slug: "reverse-string-coding",
        title: "Reverse String",
        description: `## Reverse String

Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with O(1) extra memory.

### Examples

**Example 1:**
\`\`\`
Input:  s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\`

**Example 2:**
\`\`\`
Input:  s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]
\`\`\`

### Constraints

- \`1 <= s.length <= 10⁵\`
- \`s[i]\` is a printable ASCII character.

### Follow-up

Can you solve it using the **two-pointer technique**?`,
        starterCode: {
            javascript: `function reverseString(s) {
    // Do not return anything, modify s in-place instead.
}`,
            python: `def reverse_string(s: list[str]) -> None:
    # Do not return anything, modify s in-place instead.
    pass`,
            java: `class Solution {
    public void reverseString(char[] s) {
        // Do not return anything, modify s in-place instead.
    }
}`,
            cpp: `class Solution {
public:
    void reverseString(vector<char>& s) {
        // Do not return anything, modify s in-place instead.
    }
};`,
        },
        testCases: [
            { input: "h,e,l,l,o", expectedOutput: "o,l,l,e,h", isHidden: false },
            { input: "H,a,n,n,a,h", expectedOutput: "h,a,n,n,a,H", isHidden: false },
            { input: "a", expectedOutput: "a", isHidden: false },
            { input: "a,b", expectedOutput: "b,a", isHidden: true },
            { input: "R,a,c,e,c,a,r", expectedOutput: "r,a,c,e,c,a,R", isHidden: true },
        ],
        hints: [
            "Use two pointers: one at the start, one at the end.",
            "Swap the characters at the two pointers, then move both pointers toward the center.",
            "Continue swapping until the left pointer is no longer less than the right pointer.",
        ],
        timeLimit: 2000,
        memoryLimit: 256,
    },
    "valid-palindrome-coding": {
        id: 3,
        slug: "valid-palindrome-coding",
        title: "Valid Palindrome",
        description: `## Valid Palindrome

A phrase is a **palindrome** if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

### Examples

**Example 1:**
\`\`\`
Input:  s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
\`\`\`

**Example 2:**
\`\`\`
Input:  s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.
\`\`\`

**Example 3:**
\`\`\`
Input:  s = " "
Output: true
Explanation: After removing non-alphanumeric, it becomes "" (empty string). Empty string is a palindrome.
\`\`\`

### Constraints

- \`1 <= s.length <= 2 × 10⁵\`
- \`s\` consists only of printable ASCII characters.`,
        starterCode: {
            javascript: `function isPalindrome(s) {
    // Your code here
}`,
            python: `def is_palindrome(s: str) -> bool:
    # Your code here
    pass`,
            java: `class Solution {
    public boolean isPalindrome(String s) {
        // Your code here
        return false;
    }
}`,
            cpp: `class Solution {
public:
    bool isPalindrome(string s) {
        // Your code here
        return false;
    }
};`,
        },
        testCases: [
            { input: "A man, a plan, a canal: Panama", expectedOutput: "true", isHidden: false },
            { input: "race a car", expectedOutput: "false", isHidden: false },
            { input: " ", expectedOutput: "true", isHidden: false },
            { input: "Was it a car or a cat I saw?", expectedOutput: "true", isHidden: true },
            { input: "hello", expectedOutput: "false", isHidden: true },
        ],
        hints: [
            "First, preprocess the string: convert to lowercase and keep only alphanumeric characters.",
            "Once cleaned, you can use two pointers (left and right) moving toward the center.",
            "If at any point the characters don't match, it's not a palindrome.",
            "An empty or single-character string is always a palindrome.",
        ],
        timeLimit: 2000,
        memoryLimit: 256,
    },
    "max-subarray-coding": {
        id: 4,
        slug: "max-subarray-coding",
        title: "Maximum Subarray",
        description: `## Maximum Subarray (Kadane's Algorithm)

Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.

### Examples

**Example 1:**
\`\`\`
Input:  nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Output: 6
Explanation: The subarray [4, -1, 2, 1] has the largest sum = 6.
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [1]
Output: 1
Explanation: The subarray [1] has the largest sum = 1.
\`\`\`

**Example 3:**
\`\`\`
Input:  nums = [5, 4, -1, 7, 8]
Output: 23
Explanation: The subarray [5, 4, -1, 7, 8] has the largest sum = 23.
\`\`\`

### Constraints

- \`1 <= nums.length <= 10⁵\`
- \`-10⁴ <= nums[i] <= 10⁴\`

### Follow-up

If you have figured out the O(n) solution, try coding another solution using the **divide and conquer** approach, which is more subtle.`,
        starterCode: {
            javascript: `function maxSubArray(nums) {
    // Your code here
}`,
            python: `def max_sub_array(nums: list[int]) -> int:
    # Your code here
    pass`,
            java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your code here
        return 0;
    }
}`,
            cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        // Your code here
        return 0;
    }
};`,
        },
        testCases: [
            { input: "-2,1,-3,4,-1,2,1,-5,4", expectedOutput: "6", isHidden: false },
            { input: "1", expectedOutput: "1", isHidden: false },
            { input: "5,4,-1,7,8", expectedOutput: "23", isHidden: false },
            { input: "-1", expectedOutput: "-1", isHidden: true },
            { input: "-2,-1,-3,-4", expectedOutput: "-1", isHidden: true },
            { input: "1,2,3,4,5", expectedOutput: "15", isHidden: true },
        ],
        hints: [
            "Think about Kadane's Algorithm: at each position, decide whether to extend the current subarray or start a new one.",
            "Keep track of two variables: `currentSum` (max sum ending at current position) and `maxSum` (global maximum).",
            "At each element: `currentSum = max(nums[i], currentSum + nums[i])`. Then update `maxSum = max(maxSum, currentSum)`.",
            "Initialize both `currentSum` and `maxSum` to `nums[0]`, then iterate from index 1.",
        ],
        timeLimit: 2000,
        memoryLimit: 256,
    },
    "binary-search-coding": {
        id: 5,
        slug: "binary-search-coding",
        title: "Binary Search",
        description: `## Binary Search

Given a **sorted** array of distinct integers \`nums\` and a target value \`target\`, return the index if the target is found. If not, return \`-1\`.

You must write an algorithm with **O(log n)** runtime complexity.

### Examples

**Example 1:**
\`\`\`
Input:  nums = [-1, 0, 3, 5, 9, 12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4.
\`\`\`

**Example 2:**
\`\`\`
Input:  nums = [-1, 0, 3, 5, 9, 12], target = 2
Output: -1
Explanation: 2 does not exist in nums so return -1.
\`\`\`

### Constraints

- \`1 <= nums.length <= 10⁴\`
- \`-10⁴ < nums[i], target < 10⁴\`
- All the integers in \`nums\` are unique.
- \`nums\` is sorted in ascending order.`,
        starterCode: {
            javascript: `function search(nums, target) {
    // Your code here
}`,
            python: `def search(nums: list[int], target: int) -> int:
    # Your code here
    pass`,
            java: `class Solution {
    public int search(int[] nums, int target) {
        // Your code here
        return -1;
    }
}`,
            cpp: `class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Your code here
        return -1;
    }
};`,
        },
        testCases: [
            { input: "-1,0,3,5,9,12|9", expectedOutput: "4", isHidden: false },
            { input: "-1,0,3,5,9,12|2", expectedOutput: "-1", isHidden: false },
            { input: "5|5", expectedOutput: "0", isHidden: false },
            { input: "1,2,3,4,5,6,7,8,9,10|7", expectedOutput: "6", isHidden: true },
            { input: "2,5|0", expectedOutput: "-1", isHidden: true },
        ],
        hints: [
            "Use two pointers: `left = 0` and `right = nums.length - 1`.",
            "Calculate `mid = Math.floor((left + right) / 2)`. Compare `nums[mid]` with `target`.",
            "If `nums[mid] === target`, return `mid`. If `nums[mid] < target`, search right half. Otherwise, search left half.",
            "The loop continues while `left <= right`. If the loop ends without finding target, return -1.",
        ],
        timeLimit: 1000,
        memoryLimit: 128,
    },
    "merge-sorted-arrays-coding": {
        id: 6,
        slug: "merge-sorted-arrays-coding",
        title: "Merge Two Sorted Arrays",
        description: `## Merge Two Sorted Arrays

You are given two integer arrays \`nums1\` and \`nums2\`, both sorted in **non-decreasing order**. Return a new array that merges both arrays into one sorted array.

### Examples

**Example 1:**
\`\`\`
Input:  nums1 = [1, 2, 4], nums2 = [1, 3, 4]
Output: [1, 1, 2, 3, 4, 4]
\`\`\`

**Example 2:**
\`\`\`
Input:  nums1 = [1, 3, 5], nums2 = [2, 4, 6]
Output: [1, 2, 3, 4, 5, 6]
\`\`\`

**Example 3:**
\`\`\`
Input:  nums1 = [], nums2 = [1]
Output: [1]
\`\`\`

### Constraints

- \`0 <= nums1.length, nums2.length <= 200\`
- \`-10⁹ <= nums1[i], nums2[j] <= 10⁹\`
- Both arrays are sorted in non-decreasing order.

### Follow-up

Can you solve this in O(m + n) time where m and n are the lengths of the two arrays?`,
        starterCode: {
            javascript: `function merge(nums1, nums2) {
    // Your code here
}`,
            python: `def merge(nums1: list[int], nums2: list[int]) -> list[int]:
    # Your code here
    pass`,
            java: `class Solution {
    public int[] merge(int[] nums1, int[] nums2) {
        // Your code here
        return new int[]{};
    }
}`,
            cpp: `class Solution {
public:
    vector<int> merge(vector<int>& nums1, vector<int>& nums2) {
        // Your code here
        return {};
    }
};`,
        },
        testCases: [
            { input: "1,2,4|1,3,4", expectedOutput: "1,1,2,3,4,4", isHidden: false },
            { input: "1,3,5|2,4,6", expectedOutput: "1,2,3,4,5,6", isHidden: false },
            { input: "1|1", expectedOutput: "1,1", isHidden: false },
            { input: "1,2,3|4,5,6", expectedOutput: "1,2,3,4,5,6", isHidden: true },
            { input: "-5,-3,0|,-2,-1,4", expectedOutput: "-5,-3,-2,-1,0,4", isHidden: true },
        ],
        hints: [
            "Use two pointers, one for each array, both starting at index 0.",
            "Compare elements at both pointers. Push the smaller one to the result and advance that pointer.",
            "When one array is exhausted, append the remaining elements from the other array.",
            "This gives you O(m + n) time complexity with O(m + n) space for the result.",
        ],
        timeLimit: 1000,
        memoryLimit: 128,
    },
    "climbing-stairs-coding": {
        id: 7,
        slug: "climbing-stairs-coding",
        title: "Climbing Stairs",
        description: `## Climbing Stairs

You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb **1** or **2** steps. In how many distinct ways can you climb to the top?

### Examples

**Example 1:**
\`\`\`
Input:  n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
\`\`\`

**Example 2:**
\`\`\`
Input:  n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
\`\`\`

**Example 3:**
\`\`\`
Input:  n = 5
Output: 8
\`\`\`

### Constraints

- \`1 <= n <= 45\`

### Hint

This is essentially the Fibonacci sequence! \`f(n) = f(n-1) + f(n-2)\``,
        starterCode: {
            javascript: `function climbStairs(n) {
    // Your code here
}`,
            python: `def climb_stairs(n: int) -> int:
    # Your code here
    pass`,
            java: `class Solution {
    public int climbStairs(int n) {
        // Your code here
        return 0;
    }
}`,
            cpp: `class Solution {
public:
    int climbStairs(int n) {
        // Your code here
        return 0;
    }
};`,
        },
        testCases: [
            { input: "2", expectedOutput: "2", isHidden: false },
            { input: "3", expectedOutput: "3", isHidden: false },
            { input: "5", expectedOutput: "8", isHidden: false },
            { input: "1", expectedOutput: "1", isHidden: true },
            { input: "10", expectedOutput: "89", isHidden: true },
            { input: "20", expectedOutput: "10946", isHidden: true },
        ],
        hints: [
            "Think about it recursively: to reach step n, you either came from step n-1 (1 step) or step n-2 (2 steps).",
            "So `ways(n) = ways(n-1) + ways(n-2)`. This is the Fibonacci sequence!",
            "Use dynamic programming (bottom-up) to avoid exponential time from naive recursion.",
            "You only need the last two values, so you can optimize space to O(1) with two variables.",
        ],
        timeLimit: 1000,
        memoryLimit: 128,
    },
};
