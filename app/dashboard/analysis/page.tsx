"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    BarChart2,
    Search,
    ChevronDown,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileText,
    TrendingUp,
    ArrowLeft,
    Filter
} from "lucide-react";
import { AmbientBackground } from "@/components/dashboard/AmbientBackground";
import { getResumes, getResumeAnalysisById, getResumeAnalysis } from "@/lib/api/resumes";
import { ServerResumeAnalysis, Resume } from "@/utils/types";

export default function AllAnalysesPage() {
    const router = useRouter();

    const [analyses, setAnalyses] = useState<ServerResumeAnalysis[]>([]);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch Resumes
            const resumeList: Resume[] = await getResumes();
            setResumes(resumeList);

            // 2. Fetch Analyses across all resumes
            const analysisPromises = resumeList.map(async (resume) => {
                if (!resume.currentVersionId) return null;
                try {
                    return await getResumeAnalysis(resume.id);
                } catch {
                    return null;
                }
            });

            const results = await Promise.all(analysisPromises);
            const validAnalyses = results.filter(Boolean) as ServerResumeAnalysis[];
            setAnalyses(validAnalyses);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load analyses history.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Combined Search & Filter Logic
    const filteredAnalyses = useMemo(() => {
        return analyses.filter((item) => {
            const matchesSearch =
                (item.jobTitle?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                (item.resumeId?.toLowerCase() || "").includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" ||
                item.analysisStatus?.toUpperCase() === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [analyses, searchQuery, statusFilter]);

    // Summary Metrics
    const avgScore = useMemo(() => {
        if (analyses.length === 0) return 0;
        const total = analyses.reduce((acc, curr) => acc + (curr.overallScore ?? curr.ATS?.score ?? 0), 0);
        return Math.round(total / analyses.length);
    }, [analyses]);

    const getStatusBadge = (status?: string) => {
        switch (status?.toUpperCase()) {
            case "COMPLETED":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="size-3.5" />
            Completed
          </span>
                );
            case "PENDING":
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
            <Clock className="size-3.5 animate-spin" />
            Analyzing
          </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400">
            <AlertCircle className="size-3.5" />
            Failed
          </span>
                );
        }
    };

    const getScoreColor = (score?: number) => {
        if (!score) return "border-zinc-800 bg-zinc-950/60 text-zinc-400";
        if (score >= 80) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
        if (score >= 60) return "border-amber-500/30 bg-amber-500/10 text-amber-400";
        return "border-rose-500/30 bg-rose-500/10 text-rose-400";
    };

    return (
        <main className="relative min-h-screen bg-zinc-950 px-6 py-10 font-sans text-zinc-100 antialiased selection:bg-amber-400 selection:text-zinc-950">
            <AmbientBackground />

            <div className="mx-auto max-w-6xl space-y-10">
                {/* Top Header & Navigation */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="group mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400 transition-colors hover:text-zinc-100"
                        >
                            <div className="flex size-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 transition-colors group-hover:border-zinc-700 group-hover:bg-zinc-800">
                                <ArrowLeft className="size-3.5" />
                            </div>
                            Back to Dashboard
                        </button>
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100 sm:text-3xl flex items-center gap-2.5">
                            <BarChart2 className="size-7 text-amber-400" />
                            Analysis History & Audit Logs
                        </h1>
                        <p className="text-xs text-zinc-400">
                            Overview of all candidate resume evaluations, ATS scores, and role match reports
                        </p>
                    </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-xl">
                        <div className="text-xs text-zinc-400">Total Evaluations</div>
                        <div className="mt-1 font-mono text-2xl font-extrabold text-zinc-100">{analyses.length}</div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-xl">
                        <div className="text-xs text-zinc-400">Average ATS Score</div>
                        <div className="mt-1 font-mono text-2xl font-extrabold text-amber-400">{avgScore}%</div>
                    </div>
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-xl">
                        <div className="text-xs text-zinc-400">Completed Audits</div>
                        <div className="mt-1 font-mono text-2xl font-extrabold text-emerald-400">
                            {analyses.filter((a) => a.analysisStatus === "completed").length}
                        </div>
                    </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search by target role or resume..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2 text-xs text-zinc-200 outline-none transition-colors placeholder:text-zinc-500 focus:border-amber-400/50"
                        />
                    </div>

                    <div className="relative inline-flex items-center">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900/80 pl-3.5 pr-8 py-2 text-center text-xs font-medium text-zinc-300 outline-none transition-colors hover:border-zinc-700 focus:border-amber-400/50 cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-zinc-400" />
                    </div>
                </div>

                {/* Main Grid List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-36 animate-pulse rounded-2xl bg-zinc-900/60 border border-zinc-800" />
                        ))}
                    </div>
                ) : filteredAnalyses.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center">
                        <p className="text-xs text-zinc-400">No analysis history found matching your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAnalyses.map((item) => {
                            const matchingResume = resumes.find((r) => r.id === item.resumeId);
                            const score = item.overallScore ?? item.ATS?.score;

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/dashboard/analysis/${item.id}`)}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer"
                                >
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent transition-opacity duration-300 group-hover:via-amber-400/40" />

                                    {/* Top Bar */}
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3.5 min-w-0">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-400 transition-colors duration-200 group-hover:border-amber-500/30 group-hover:bg-amber-400/10 group-hover:text-amber-400">
                                                <FileText className="size-5" />
                                            </div>

                                            <div className="min-w-0 space-y-1">
                                                <h4 className="truncate text-sm font-semibold tracking-tight text-zinc-100 transition-colors group-hover:text-amber-300">
                                                    {matchingResume?.fileName || "Resume File"}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
                          <span>
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">{getStatusBadge(item.analysisStatus)}</div>
                                    </div>

                                    {/* Target Role Tag */}
                                    {item.jobTitle && (
                                        <div className="my-3 flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-400">
                                            <span className="text-zinc-400 font-normal">Targeting:</span>
                                            <span className="truncate font-semibold text-zinc-200">{item.jobTitle}</span>
                                        </div>
                                    )}

                                    {/* Metrics Footer */}
                                    <div className="mt-2 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-zinc-400">Score:</span>
                                                <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${getScoreColor(score)}`}>
                          {score !== undefined ? `${score}%` : "Pending"}
                        </span>
                                            </div>
                                        </div>

                                        <div className="flex size-7 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-200 group-hover:bg-zinc-800 group-hover:text-zinc-100">
                                            <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}