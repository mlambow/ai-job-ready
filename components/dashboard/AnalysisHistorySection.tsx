"use client";

import React, { useState, useMemo } from "react";
import {Search, Briefcase, CheckCircle2, Clock, Eye, AlertCircle, ChevronDown} from "lucide-react";
import { ServerResumeAnalysis } from "@/utils/types";

interface AnalysisHistorySectionProps {
    analyses: ServerResumeAnalysis[];
    onSelectAnalysis: (analysis: ServerResumeAnalysis) => void;
}

export function AnalysisHistorySection({ analyses, onSelectAnalysis }: AnalysisHistorySectionProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredAnalyses = useMemo(() => {
        return analyses.filter((item) => {
            const matchesSearch =
                item.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.companyName && item.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === "ALL" || item.analysisStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [analyses, searchTerm, statusFilter]);

    return (
        <div className="space-y-4 mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Briefcase className="size-5 text-amber-400" />
                        Analysis Audit History Logs
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Review detailed ATS scores and keyword alignment across previous runs.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative sm:w-full md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-amber-400/50" />
                        <input
                            type="search"
                            placeholder="Filter by title or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-2 pl-10 pr-4 text-xs text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 backdrop-blur-md sm:text-sm"
                        />
                    </div>

                    <div className="relative inline-flex items-center">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none rounded-xl border border-zinc-800 bg-zinc-900/80 pl-3.5 pr-8 py-2 px-4 text-center text-xs font-medium text-zinc-300 outline-none transition-colors hover:border-zinc-700 focus:border-amber-400/50 cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 shadow-2xl backdrop-blur-xl overflow-hidden">
                {/* Enabled horizontal auto-scrolling container */}
                <div className="w-full overflow-x-auto">
                    {/* Added min-w-[800px] to preserve structure on mobile views */}
                    <table className="w-full min-w-[800px] text-left text-xs text-zinc-300">
                        <thead className="border-b border-zinc-800 bg-zinc-950/50 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        <tr>
                            <th className="px-6 py-4">Target Role / Company</th>
                            <th className="px-6 py-4">Overall Score</th>
                            <th className="px-6 py-4">ATS Match</th>
                            <th className="px-6 py-4">Matched / Missing Skills</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60">
                        {filteredAnalyses.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                                    No matching analysis records found.
                                </td>
                            </tr>
                        ) : (
                            filteredAnalyses.map((item) => {
                                const overall = item.overallScore ?? 0;
                                const atsScore = item.ATS?.score ?? 0;
                                const matchedCount = item.skills?.matchedSkills?.length ?? 0;
                                const missingCount = item.skills?.missingSkills?.length ?? 0;

                                return (
                                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium">
                                            <div className="font-bold text-white">{item.jobTitle}</div>
                                            <div className="text-[11px] text-zinc-400">{item.companyName || "Unspecified Target"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${overall >= 80 ? "text-amber-400" : overall >= 60 ? "text-yellow-400" : "text-rose-400"}`}>
                                              {overall}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono">{atsScore}%</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[11px]">
                                                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                    {matchedCount} matched
                                                  </span>
                                                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {missingCount} missing
                                              </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                                                item.analysisStatus === "completed"
                                                    ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                                                    : item.analysisStatus === "processing"
                                                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                            }`}>
                                              {item.analysisStatus === "completed" ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
                                                {item.analysisStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onSelectAnalysis(item)}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:border-amber-400/40 hover:bg-zinc-700"
                                            >
                                                <Eye className="size-3.5 text-amber-400" />
                                                Audit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}