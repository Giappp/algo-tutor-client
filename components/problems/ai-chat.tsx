"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  SendIcon,
  SparklesIcon,
  BotIcon,
  UserIcon,
  Loader2Icon,
  TrashIcon,
  LightbulbIcon,
  CodeIcon,
  TrendingUpIcon,
  ZapIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { ChatMessage, Problem, Difficulty } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AIChatProps {
  problem?: Problem;
}

const difficultyColors: Record<Difficulty, string> = {
  Easy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Hard: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

function getInitialMessages(problem?: Problem) {
  const baseMessages: ChatMessage[] = [];

  if (problem) {
    baseMessages.push({
      id: "1",
      role: "assistant",
      content: `Hello! I'm your AI coding assistant for **${problem.title}**.

I can help you with:
- Understanding the problem requirements
- Breaking down the approach step by step
- Debugging your code
- Explaining algorithms and data structures
- Optimizing your solution

This is a ${problem.difficulty} problem covering ${problem.tags.slice(0, 2).join(" and ")}. What would you like help with?`,
      timestamp: new Date(),
    });
  } else {
    baseMessages.push({
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI coding assistant. I can help you with:\n\n- Understanding problem requirements\n- Breaking down the approach\n- Debugging your code\n- Explaining algorithms and data structures\n\nWhat would you like help with today?",
      timestamp: new Date(),
    });
  }

  return baseMessages;
}

function getQuickActions(problem?: Problem) {
  const baseActions = [
    {
      label: "Explain Problem",
      icon: LightbulbIcon,
      prompt: problem
        ? "Can you explain the problem requirements for this challenge?"
        : "Help me understand this problem",
    },
    {
      label: "Show Approach",
      icon: TrendingUpIcon,
      prompt: problem
        ? "What's a good approach to solve this problem?"
        : "Show me an approach to solve this",
    },
    {
      label: "Review Code",
      icon: CodeIcon,
      prompt: "Can you review my code and suggest improvements?",
    },
    {
      label: "Optimize",
      icon: ZapIcon,
      prompt: "How can I optimize my solution for better performance?",
    },
  ];

  return baseActions;
}

export function AIChat({ problem }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getInitialMessages(problem)
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const quickActions = getQuickActions(problem);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      let response: ChatMessage;

      if (input.toLowerCase().includes("explain") || input.toLowerCase().includes("understand")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Here's a breakdown of the problem:

**Key Requirements:**
1. We need to find two numbers in the array that add up to the target
2. Each number can only be used once
3. There is exactly one valid solution

**Approach:**
- Use a hash map to store numbers we've seen
- For each number, check if (target - number) exists in the map
- If found, return both indices

Would you like me to elaborate on any part?`,
          timestamp: new Date(),
        };
      } else if (input.toLowerCase().includes("approach") || input.toLowerCase().includes("solve")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Here's a recommended approach:

**Algorithm:**
1. Create an empty hash map \`seen = {}\`
2. Iterate through the array with index \`i\`
3. Calculate \`complement = target - nums[i]\`
4. If \`complement\` exists in \`seen\`, return \`seen[complement], i\`
5. Otherwise, store \`nums[i]: i\` in the map

**Time Complexity:** O(n) - single pass
**Space Complexity:** O(n) - for the hash map

Want me to show you the code for this approach?`,
          timestamp: new Date(),
        };
      } else if (input.toLowerCase().includes("optimize") || input.toLowerCase().includes("optimize")) {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `To optimize your solution:

**Current:** O(n) time, O(n) space

**Potential Improvements:**
1. If sorting is allowed, a two-pointer approach could reduce space to O(1), but indices would be lost
2. For very large arrays, consider batch processing
3. Cache frequently accessed values

The hash map approach is already near-optimal for this problem type. The main trade-off is space vs. time.

Do you have specific code you'd like me to review?`,
          timestamp: new Date(),
        };
      } else {
        response = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "That's a great question! Let me help you think through this step by step.\n\nFor this type of problem, I'd recommend breaking it down into smaller sub-problems and tackling each one systematically.\n\nCould you share your current code so I can provide more specific guidance?",
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleClearChat = () => {
    setMessages(getInitialMessages(problem));
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background border-l border-border/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <SparklesIcon className="size-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Tutor</h3>
            <p className="text-xs text-muted-foreground">Powered by GPT-4</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {problem && (
            <Badge
              variant="secondary"
              className={cn("text-xs", difficultyColors[problem.difficulty])}
            >
              {problem.difficulty}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleClearChat}
            title="Clear chat"
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
      </div>

      {problem && (
        <div className="px-4 py-2 border-b border-border/50 bg-muted/20">
          <div className="flex flex-wrap gap-1">
            {problem.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] h-5 px-1.5 bg-secondary/50"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "size-8 rounded-full flex items-center justify-center shrink-0",
                  message.role === "assistant"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.role === "assistant" ? (
                  <BotIcon className="size-4" />
                ) : (
                  <UserIcon className="size-4" />
                )}
              </div>
              <div className="flex flex-col gap-1 max-w-[85%]">
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm",
                    message.role === "assistant"
                      ? "bg-muted text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
                  )}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-[10px] text-muted-foreground px-1",
                    message.role === "user" && "justify-end"
                  )}
                >
                  <span>
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-5"
                      onClick={() =>
                        handleCopyMessage(message.content, message.id)
                      }
                    >
                      {copiedId === message.id ? (
                        <CheckIcon className="size-3" />
                      ) : (
                        <CopyIcon className="size-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <BotIcon className="size-4" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-muted">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2Icon className="size-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 2 && (
          <div className="mt-6 space-y-3">
            <p className="text-xs text-muted-foreground font-medium">
              Quick actions:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="h-auto py-2 px-3 text-xs justify-start"
                >
                  <action.icon className="size-3.5 mr-2 shrink-0" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border/50 bg-muted/30">
        <div className="flex gap-2">
          <Input
            placeholder="Ask the AI tutor..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            <SendIcon className="size-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          AI responses are for guidance only. Always verify your solutions.
        </p>
      </div>
    </div>
  );
}
