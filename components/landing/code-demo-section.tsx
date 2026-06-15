"use client";

import {BrainCircuit, ChevronRight, MessageSquare, Terminal} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";

export function CodeDemoSection() {
    return (
        <section id="ai-tutor" className="bg-muted/10 py-24 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-14 max-w-3xl reveal-up">
                    <p className="mb-3 text-sm font-medium text-primary">AI Tutor trong bài học</p>
                    <h2 className="mb-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                        Gợi ý để bạn tự tìm ra lời giải, không làm hộ.
                    </h2>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        AI Tutor đọc code hiện tại, hiểu chủ đề bạn đang học và chỉ đưa ra bước gợi mở phù hợp.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-6 items-start reveal-up">
                    {/* Left: Problem description */}
                    <Card className="lg:col-span-2 border-border/50">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                    Mảng
                                </Badge>
                                <Badge className="text-xs bg-[oklch(0.65_0.2_145)] text-white">Dễ</Badge>
                            </div>
                            <h3 className="font-bold text-lg">Tổng hai phần tử</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Cho một mảng số nguyên{" "}
                                <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">nums</code> and an
                                và số nguyên{" "}
                                <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">target</code>, return
                                hãy trả về vị trí của hai số có tổng bằng target.
                            </p>
                            <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground">Ví dụ</div>
                                <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs space-y-1">
                                    <div>Input: nums = [2,7,11,15], target = 9</div>
                                    <div>Output: [0,1]</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right: Interactive demo */}
                    <div className="lg:col-span-3 code-border rounded-2xl overflow-hidden">
                        {/* Tab bar */}
                        <div
                            className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="size-3 rounded-full bg-[oklch(0.65_0.2_25)]"/>
                                    <div className="size-3 rounded-full bg-[oklch(0.7_0.18_85)]"/>
                                    <div className="size-3 rounded-full bg-[oklch(0.65_0.2_145)]"/>
                                </div>
                                <span className="text-xs font-mono text-muted-foreground">solution.ts</span>
                            </div>
                            <Button size="sm" className="gap-1.5 h-7 text-xs">
                                <Terminal className="size-3"/>
                                Chạy
                            </Button>
                        </div>

                        {/* Code editor mockup */}
                        <div className="p-5 font-mono text-sm leading-relaxed bg-[oklch(0.13_0.01_260)]">
              <pre className="text-[oklch(0.9_0_0)]">
                <span className="text-[oklch(0.55_0.15_250)]">function</span>{" "}
                  <span className="text-[oklch(0.7_0.18_195)]">twoSum</span>
                <span className="text-[oklch(0.9_0_0)]">(</span>
                <span className="text-[oklch(0.6_0.12_280)]">nums</span>,
                <span className="text-[oklch(0.9_0_0)]"> </span>
                <span className="text-[oklch(0.6_0.12_280)]">target</span>
                <span className="text-[oklch(0.9_0_0)]">): </span>
                <span className="text-[oklch(0.6_0.12_280)]">number</span>
                <span className="text-[oklch(0.9_0_0)]">[] {"{"}</span>
              </pre>
                            <pre className="pl-6">
                <span className="text-[oklch(0.55_0.15_250)]">const</span>{" "}
                                <span className="text-[oklch(0.6_0.12_280)]">seen</span>
                <span className="text-[oklch(0.9_0_0)]"> = </span>
                <span className="text-[oklch(0.55_0.15_250)]">new</span>{" "}
                                <span className="text-[oklch(0.7_0.18_195)]">Map</span>
                <span className="text-[oklch(0.9_0_0)]">();</span>
              </pre>
                            <pre className="pl-6">
                <span className="text-[oklch(0.55_0.15_250)]">for</span>
                <span className="text-[oklch(0.9_0_0)]">(</span>
                <span className="text-[oklch(0.55_0.15_250)]">let</span>{" "}
                                <span className="text-[oklch(0.6_0.12_280)]">i</span>
                <span className="text-[oklch(0.9_0_0)]"> = </span>
                <span className="text-[oklch(0.8_0.1_30)]">0</span>
                <span className="text-[oklch(0.9_0_0)]">; </span>
                <span className="text-[oklch(0.6_0.12_280)]">i</span>
                <span className="text-[oklch(0.9_0_0)]"> &lt; </span>
                <span className="text-[oklch(0.6_0.12_280)]">nums</span>
                <span className="text-[oklch(0.9_0_0)]">.</span>
                <span className="text-[oklch(0.7_0.18_195)]">length</span>
                <span className="text-[oklch(0.9_0_0)]">; </span>
                <span className="text-[oklch(0.6_0.12_280)]">i</span>
                <span className="text-[oklch(0.9_0_0)]">++) {"{"}</span>
              </pre>
                            <pre className="pl-12 text-[oklch(0.9_0_0)]">
                <span className="text-[oklch(0.6_0.12_280)]">const</span>{" "}
                                <span className="text-[oklch(0.6_0.12_280)]">need</span>
                <span className="text-[oklch(0.9_0_0)]"> = </span>
                <span className="text-[oklch(0.6_0.12_280)]">target</span>
                <span className="text-[oklch(0.9_0_0)]"> - </span>
                <span className="text-[oklch(0.6_0.12_280)]">nums</span>
                <span className="text-[oklch(0.9_0_0)]">[</span>
                <span className="text-[oklch(0.6_0.12_280)]">i</span>
                <span className="text-[oklch(0.9_0_0)]">];</span>
                            </pre>
                            <pre className="pl-12 text-muted-foreground">
                  {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                                <span className="text-[oklch(0.55_0.15_250)]">//</span>
                                <span className="text-[oklch(0.5_0.01_260)] opacity-60">
                                    {"  "}&lt;-- cursor is here, AI hint appears below
                                </span>
                            </pre>
                            <pre className="pl-12">
                                <span className="text-[oklch(0.9_0_0)]">{"}"}</span>
                            </pre>
                            <pre className="pl-6 text-[oklch(0.9_0_0)]">{"}"}</pre>
                        </div>

                        {/* AI Hint panel */}
                        <div className="border-t border-border/50 p-4 bg-card">
                            <div className="flex items-start gap-3">
                                <div
                                    className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <BrainCircuit className="size-4 text-primary"/>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-primary">AI Tutor</span>
                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                            Gợi ý 1/3
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-foreground leading-relaxed">
                                        Bạn đang đi đúng hướng với hash map. Với mỗi phần tử{" "}
                                        <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">nums[i]</code>,
                                        giá trị duy nhất nào sẽ giúp tổng bằng{" "}
                                        <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">target</code>?
                                        Hãy kiểm tra xem phần bù đó đã xuất hiện trong map chưa.
                                    </p>
                                    <div className="flex gap-2 pt-1">
                                        <Button size="sm" variant="secondary" className="h-7 text-xs gap-1.5">
                                            <MessageSquare className="size-3"/>
                                            Hỏi thêm
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground">
                                            Gợi ý tiếp
                                            <ChevronRight className="size-3"/>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
