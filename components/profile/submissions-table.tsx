"use client";

import { useState, useMemo } from "react";
import { CheckCircle2Icon, XCircleIcon, AlertTriangleIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Submission {
    submissionId: string;
    problemId: string;
    problemTitle: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    status: "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR";
    executionTimeSec: number;
    memoryUsageMb: number;
    submittedAt: string;
}

interface SubmissionsTableProps {
    submissions: Submission[];
}

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter submissions based on search
    const filteredSubmissions = useMemo(() => {
        return submissions.filter((sub) =>
            sub.problemTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [submissions, searchQuery]);

    // Paginate items
    const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / itemsPerPage));
    
    // Reset page if filter shrinks data
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const paginatedSubmissions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredSubmissions.slice(start, start + itemsPerPage);
    }, [filteredSubmissions, currentPage]);

    const renderStatusBadge = (status: string) => {
        if (status === "ACCEPTED") {
            return (
                <div className="flex items-center gap-1.5 text-emerald-500 font-semibold text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full w-fit">
                    <CheckCircle2Icon className="size-3.5 fill-emerald-500/10 shrink-0" />
                    <span>Thành công</span>
                </div>
            );
        }
        if (status === "WRONG_ANSWER") {
            return (
                <div className="flex items-center gap-1.5 text-red-500 font-semibold text-xs bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full w-fit">
                    <XCircleIcon className="size-3.5 fill-red-500/10 shrink-0" />
                    <span>Sai kết quả</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full w-fit">
                <AlertTriangleIcon className="size-3.5 fill-amber-500/10 shrink-0" />
                <span>Lỗi biên dịch</span>
            </div>
        );
    };

    const diffColors = {
        EASY: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15",
        MEDIUM: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/15",
        HARD: "bg-red-500/10 text-red-500 hover:bg-red-500/15",
    };

    const formattedTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Lịch sử nộp bài
                </h3>
                <div className="relative w-full sm:max-w-xs">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài tập..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-hidden focus:ring-1 focus:ring-primary shadow-xs"
                    />
                </div>
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto border border-border/80 rounded-lg">
                <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs font-bold uppercase tracking-wider">
                            <th className="p-4">Trạng thái</th>
                            <th className="p-4">Bài tập</th>
                            <th className="p-4">Độ khó</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Bộ nhớ</th>
                            <th className="p-4">Nộp lúc</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {paginatedSubmissions.length > 0 ? (
                            paginatedSubmissions.map((sub) => (
                                <tr key={sub.submissionId} className="hover:bg-muted/10 transition-colors">
                                    <td className="p-4">{renderStatusBadge(sub.status)}</td>
                                    <td className="p-4 font-bold text-foreground">
                                        <Link
                                            href={`/learn/roadmap/lesson?id=${sub.problemId}`}
                                            className="hover:underline hover:text-primary transition-colors"
                                        >
                                            {sub.problemTitle}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="secondary" className={cn("text-[10px] font-bold py-0.5 px-2.5", diffColors[sub.difficulty])}>
                                            {sub.difficulty}
                                        </Badge>
                                    </td>
                                    <td className="p-4 font-mono font-medium text-xs text-muted-foreground">
                                        {sub.executionTimeSec}s
                                    </td>
                                    <td className="p-4 font-mono font-medium text-xs text-muted-foreground">
                                        {sub.memoryUsageMb}MB
                                    </td>
                                    <td className="p-4 text-xs font-semibold text-muted-foreground">
                                        {formattedTime(sub.submittedAt)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-10 text-center text-muted-foreground font-semibold">
                                    Không có dữ liệu bài nộp phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-muted-foreground font-semibold">
                        Trang <strong>{currentPage}</strong> trên <strong>{totalPages}</strong> (Tổng số {filteredSubmissions.length})
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-border bg-card shadow-xs hover:bg-muted disabled:opacity-40 disabled:hover:bg-card active:scale-95 transition-all cursor-pointer"
                        >
                            <ChevronLeftIcon className="size-4 text-foreground" />
                        </button>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-border bg-card shadow-xs hover:bg-muted disabled:opacity-40 disabled:hover:bg-card active:scale-95 transition-all cursor-pointer"
                        >
                            <ChevronRightIcon className="size-4 text-foreground" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
