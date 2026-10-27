
"use client";

import React from "react";
import { FileText, CalendarDays, BriefcaseBusiness } from "lucide-react";

import type {
    Resume,
    ServerResumeAnalysis,
    ServerResumeVersion,
} from "@/utils/types";

interface AnalysisHistoryByResumeProps {
    resumes: Resume[];
    resumeVersions: Record<string, ServerResumeVersion[]>;
    analyses: ServerResumeAnalysis[];
    onSelectAnalysis: (analysis: ServerResumeAnalysis) => void;
}

function formatDate(date: string | null): string {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Date unavailable";
    }

    return parsedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function getStatusClasses(status: ServerResumeAnalysis["analysisStatus"]) {
    switch (status) {
        case "completed":
            return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "processing":
            return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
        case "failed":
            return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        default:
            return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
}

export function AnalysisHistoryByResume({
                                            resumes,
                                            resumeVersions,
                                            analyses,
                                            onSelectAnalysis,
                                        }: AnalysisHistoryByResumeProps) {
    const sortedResumes = [...resumes].sort(
        (a, b) =>
            new Date(b.updatedAt ?? b.createdAt ?? 0).getTime() -
            new Date(a.updatedAt ?? a.createdAt ?? 0).getTime()
    );

    return (
        <div className="space-y-6">
            {sortedResumes.map((resume) => {
                const resumeAnalyses = analyses.filter(
                    (analysis) => analysis.resumeId === resume.id
                );

                const versions = resumeVersions[resume.id] ?? [];

                return (
                    <section
                        key={resume.id}
                        className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                        {/* Resume group heading */}
                        <div className="flex items-start gap-3 border-b border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50 sm:p-5">
                            <div className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                <FileText size={22} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="break-words font-semibold text-zinc-900 dark:text-zinc-100">
                                    {resume.fileName}
                                </h2>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    {resumeAnalyses.length}{" "}
                                    {resumeAnalyses.length === 1
                                        ? "analysis"
                                        : "analyses"}
                                </p>
                            </div>
                        </div>

                        {/* Analyses belonging to this resume */}
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {resumeAnalyses.length === 0 ? (
                                <p className="p-5 text-sm text-zinc-500 dark:text-zinc-400">
                                    No analyses have been created for this resume yet.
                                </p>
                            ) : (
                                resumeAnalyses.map((analysis) => {
                                    const version = versions.find(
                                        (item) => item.id === analysis.versionId
                                    );

                                    return (
                                        <button
                                            key={analysis.id}
                                            type="button"
                                            onClick={() =>
                                                onSelectAnalysis(analysis)
                                            }
                                            className="block w-full p-4 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-zinc-800/60 sm:p-5"
                                        >
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                            {analysis.jobTitle ||
                                                                "Untitled position"}
                                                        </h3>

                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClasses(
                                                                analysis.analysisStatus
                                                            )}`}
                                                        >
                                                            {analysis.analysisStatus}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                        <BriefcaseBusiness
                                                            size={15}
                                                        />
                                                        {analysis.companyName ||
                                                            "Company not specified"}
                                                    </p>

                                                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                        <span>
                                                            {version
                                                                ? `Version ${version.versionNumber}`
                                                                : "Version unavailable"}
                                                        </span>

                                                        <span className="flex items-center gap-1">
                                                            <CalendarDays
                                                                size={14}
                                                            />
                                                            {formatDate(
                                                                analysis.createdAt
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 sm:text-right">
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        Overall score
                                                    </p>
                                                    <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                                        {analysis.overallScore ??
                                                            "—"}
                                                        {analysis.overallScore !==
                                                        null
                                                            ? "%"
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
