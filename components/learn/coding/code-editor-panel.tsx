"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcwIcon } from "lucide-react";
import { LANGUAGES, MONACO_LANGUAGES } from "./constants";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorPanelProps {
    language: string;
    code: string;
    onLanguageChange: (lang: string) => void;
    onCodeChange: (value: string | undefined) => void;
    onReset: () => void;
}

export function CodeEditorPanel({
    language,
    code,
    onLanguageChange,
    onCodeChange,
    onReset,
}: CodeEditorPanelProps) {
    return (
        <>
            {/* Language bar */}
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-[#252526] shrink-0">
                <div className="flex items-center gap-1.5">
                    {LANGUAGES.map((lang) => (
                        <button
                            key={lang.value}
                            onClick={() => onLanguageChange(lang.value)}
                            className={cn(
                                "px-2 py-1 rounded text-sm font-medium transition-all",
                                language === lang.value
                                    ? "bg-primary/20 text-primary"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                            )}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReset}
                    className="h-7 px-2 text-sm text-white/50 hover:text-white hover:bg-white/10"
                >
                    <RotateCcwIcon className="size-3 mr-1" />
                    Reset
                </Button>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={MONACO_LANGUAGES[language] ?? language}
                    value={code}
                    onChange={onCodeChange}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        fontLigatures: true,
                        padding: { top: 12, bottom: 12 },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        glyphMargin: false,
                        folding: true,
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 3,
                        renderLineHighlight: "line",
                        scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                        automaticLayout: true,
                        tabSize: language === "python" ? 4 : 2,
                        insertSpaces: true,
                        wordWrap: "on",
                        bracketPairColorization: { enabled: true },
                        guides: { bracketPairs: true },
                    }}
                />
            </div>
        </>
    );
}
