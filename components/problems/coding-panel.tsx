"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlayIcon,
  RotateCcwIcon,
  LightbulbIcon,
  TerminalIcon,
  Loader2Icon,
} from "lucide-react";

interface CodingPanelProps {
  starterCode?: Record<string, string>;
  hints?: string[];
}

const languages = [
  { value: "python", label: "Python 3", monaco: "python" },
  { value: "java", label: "Java", monaco: "java" },
  { value: "cpp", label: "C++", monaco: "cpp" },
];

const monacoLanguages: Record<string, string> = {
  python: "python",
  javascript: "javascript",
  java: "java",
  cpp: "cpp",
  go: "go",
};

interface TestResult {
  stdin: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function CodingPanel({ starterCode, hints = [] }: CodingPanelProps) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(starterCode?.python || "# Write your code here\n");
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [revealedHints, setRevealedHints] = useState(0);

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (starterCode?.[value]) {
      setCode(starterCode[value]);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const handleRun = () => {
    setIsRunning(true);
    setConsoleOutput(["Running code..."]);
    setActiveTab("console");

    setTimeout(() => {
      const output = [
        "> Executing test cases...",
        "",
        "Test Case 1:",
        "  Stdin:   5\\n4 2 7 11 15\\n9",
        "  Expected: 0 1",
        "  Actual:   0 1",
        "  Status:   PASS",
        "",
        "Test Case 2:",
        "  Stdin:   3\\n3 2 4\\n6",
        "  Expected: 1 2",
        "  Actual:   1 2",
        "  Status:   PASS",
        "",
        "Test Case 3:",
        "  Stdin:   2\\n3 3\\n6",
        "  Expected: 0 1",
        "  Actual:   0 1",
        "  Status:   PASS",
        "",
        "All tests passed!",
      ];
      setConsoleOutput(output);
      setTestResults([
        {
          stdin: "5\\n4 2 7 11 15\\n9",
          expected: "0 1",
          actual: "0 1",
          passed: true,
        },
        {
          stdin: "3\\n3 2 4\\n6",
          expected: "1 2",
          actual: "1 2",
          passed: true,
        },
        {
          stdin: "2\\n3 3\\n6",
          expected: "0 1",
          actual: "0 1",
          passed: true,
        },
      ]);
      setIsRunning(false);
    }, 1500);
  };

  const handleReset = () => {
    if (starterCode?.[language]) {
      setCode(starterCode[language]);
    }
  };

  const handleRevealNextHint = () => {
    if (revealedHints < hints.length) {
      setRevealedHints(revealedHints + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] dark:bg-[#0d0d0d]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#252526] dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px] h-8 bg-[#3c3c3c] border-0 text-white text-sm [&>span]:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#252526] border-white/10">
              {languages.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className="text-white focus:bg-white/10 focus:text-white"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-3 text-white/70 hover:text-white hover:bg-white/10"
          >
            <RotateCcwIcon className="size-4 mr-1.5" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="w-full justify-start rounded-none border-b border-white/10 bg-[#252526] dark:bg-[#1a1a1a] h-10 p-1">
          <TabsTrigger
            value="editor"
            className="text-white/70 data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white rounded"
          >
            Editor
          </TabsTrigger>
          <TabsTrigger
            value="hints"
            className="text-white/70 data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white rounded"
          >
            <LightbulbIcon className="size-3.5 mr-1.5" />
            Hints
            {hints.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-primary/20 text-primary border-0 text-[10px] h-4 px-1"
              >
                {hints.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="console"
            className="text-white/70 data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-white rounded"
          >
            <TerminalIcon className="size-3.5 mr-1.5" />
            Console
            {consoleOutput.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-emerald-500/20 text-emerald-400 border-0 text-[10px] h-4 px-1"
              >
                {testResults.filter((t) => t.passed).length}/{testResults.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          {activeTab === "editor" && (
            <div className="h-full">
              <Editor
                height="100%"
                language={monacoLanguages[language]}
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 0,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: "line",
                  scrollbar: {
                    vertical: "auto",
                    horizontal: "auto",
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                  },
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  wordWrap: "on",
                }}
              />
            </div>
          )}
          {activeTab === "hints" && (
            <div className="h-full overflow-auto p-4">
              {hints.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/50">
                  <LightbulbIcon className="size-12 mb-4 opacity-50" />
                  <p className="text-sm">No hints available yet.</p>
                  <p className="text-xs mt-1 opacity-60">
                    Hints will appear here when available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60">
                      {revealedHints} of {hints.length} hints revealed
                    </p>
                    {revealedHints < hints.length && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleRevealNextHint}
                        className="bg-primary/20 hover:bg-primary/30 text-primary border-0"
                      >
                        <LightbulbIcon className="size-3.5 mr-1.5" />
                        Reveal Hint {revealedHints + 1}
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {hints.slice(0, revealedHints).map((hint, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/30 text-xs"
                          >
                            Hint {idx + 1}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                          {hint}
                        </p>
                      </div>
                    ))}
                    {revealedHints === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-white/40">
                        <LightbulbIcon className="size-10 mb-3 opacity-40" />
                        <p className="text-sm">Click &ldquo;Reveal Hint&rdquo; to get started</p>
                        <p className="text-xs mt-1 opacity-60">
                          Hints progressively guide you to the solution
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "console" && (
            <div className="h-full overflow-auto">
              {consoleOutput.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40">
                  <TerminalIcon className="size-12 mb-4 opacity-50" />
                  <p className="text-sm">No output yet.</p>
                  <p className="text-xs mt-1 opacity-60">
                    Run your code to see results here.
                  </p>
                </div>
              ) : (
                <div className="p-4">
                  <pre className="font-mono text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                    {consoleOutput.map((line, idx) => {
                      if (line.includes("PASS")) {
                        return (
                          <span key={idx} className="text-emerald-400">
                            {line}
                            {"\n"}
                          </span>
                        );
                      }
                      if (line.includes("FAIL")) {
                        return (
                          <span key={idx} className="text-rose-400">
                            {line}
                            {"\n"}
                          </span>
                        );
                      }
                      if (line.includes(">")) {
                        return (
                          <span key={idx} className="text-primary">
                            {line}
                            {"\n"}
                          </span>
                        );
                      }
                      return (
                        <span key={idx}>
                          {line}
                          {"\n"}
                        </span>
                      );
                    })}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>

      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-[#252526] dark:bg-[#1a1a1a]">
        <div className="flex items-center gap-3 text-xs text-white/50">
          <span>Lines: {code.split("\n").length}</span>
          <span className="text-white/20">|</span>
          <span>UTF-8</span>
          <span className="text-white/20 hidden sm:inline">|</span>
          <span className="text-white/50 hidden sm:inline">
            Ctrl+Enter to run
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {isRunning ? (
              <>
                <Loader2Icon className="size-4 mr-1.5 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="size-4 mr-1.5" />
                Run Code
              </>
            )}
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
