"use client";

import React from "react";
import { Sparkles, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { ServerResumeAnalysis } from "@/utils/types";

interface AnalysisAuditModalProps {
    analysis: ServerResumeAnalysis | null;
    onClose: () => void;
}

export function AnalysisAuditModal({ analysis, onClose }: AnalysisAuditModalProps) {
    if (!analysis) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl rounded-[2.5rem] border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                    <div>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">ATS Audit Breakdown</span>
                        <h3 className="text-2xl font-extrabold text-white mt-0.5">{analysis.jobTitle}</h3>
                        <p className="text-xs text-zinc-400">{analysis.companyName || "Unspecified Target Role"}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Score Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <span className="text-[11px] font-medium text-zinc-400">Overall Match</span>
                        <p className="text-2xl font-extrabold text-amber-400 mt-1">{analysis.overallScore ?? 0}%</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <span className="text-[11px] font-medium text-zinc-400">ATS Readiness</span>
                        <p className="text-2xl font-extrabold text-white mt-1">{analysis.ATS?.score ?? 0}%</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <span className="text-[11px] font-medium text-zinc-400">Skills Score</span>
                        <p className="text-2xl font-extrabold text-white mt-1">{analysis.skills?.score ?? 0}%</p>
                    </div>
                </div>

                {/* AI Recommendations */}
                {analysis.aiSuggestions?.improvedSummary && (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-amber-400 mb-2">
                            <Sparkles className="size-4" /> Recommended Executive Summary
                        </h4>
                        <p className="text-xs leading-relaxed text-zinc-300 italic">
                            "{analysis.aiSuggestions.improvedSummary}"
                        </p>
                    </div>
                )}

                {/* Missing Keywords */}
                {analysis.keywords?.missingKeywords && analysis.keywords.missingKeywords.length > 0 && (
                    <div>
                        <h4 className="text-xs font-bold uppercase text-zinc-400 mb-2">Missing Priority Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                            {analysis.keywords.missingKeywords.map((kw, i) => (
                                <span
                                    key={i}
                                    className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400"
                                >
                                  + {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}