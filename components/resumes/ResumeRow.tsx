"use client";

import {
    FileText,
    MoreHorizontal,
    Sparkles,
} from "lucide-react";

import { useState } from "react";

import { ResumeStatus } from "@/components/resumes/ResumeStatus";

import { ResumeMenu } from "@/components/resumes/ResumeMenu";

import {
    Resume,
    ResumeVersion,
} from "@/utils/types";

interface ResumeRowProps {
    resume: Resume;

    currentVersion?: ResumeVersion;

    onAnalyze: (
        resume: Resume,
    ) => void;

    onResumeView: (
        resume: Resume,
    ) => void;

    onResumeDownload: (
        resume: Resume,
    ) => void;

    onReplace: (
        resume: Resume,
    ) => void;

    onVersionHistory: (
        resume: Resume,
    ) => void;

    onDelete: (
        resume: Resume,
    ) => void;
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(
            bytes / 1024
        ).toFixed(1)} KB`;
    }

    return `${(
        bytes / (1024 * 1024)
    ).toFixed(1)} MB`;
}

function formatDate(
    date: string | null,
) {
    if (!date) {
        return "Recently";
    }

    return new Intl.DateTimeFormat(
        "en",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        },
    ).format(
        new Date(date),
    );
}

export function ResumeRow({
                              resume,
                              currentVersion,
                              onAnalyze,
                              onResumeView,
                              onResumeDownload,
                              onReplace,
                              onVersionHistory,
                              onDelete,
                          }: ResumeRowProps) {
    const [menuOpen, setMenuOpen] =
        useState(false);

    const isPdf =
        resume.fileType ===
        "application/pdf" ||
        resume.fileName
            .toLowerCase()
            .endsWith(".pdf");

    // Analyze is only available once
    // resume extraction is complete.
    const canAnalyze =
        currentVersion?.resumeStatus ===
        "ready";

    return (
        <div className="group flex flex-col gap-4 border-b border-zinc-800/60 px-6 py-4.5 transition-all duration-200 hover:bg-zinc-800/40 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">

            {/* File Meta Information */}
            <div className="flex min-w-0 items-center gap-4">

                <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400 transition-colors group-hover:border-amber-400/40 group-hover:bg-amber-400/20">
                    <FileText className="size-5" />
                </div>

                <div className="min-w-0 space-y-1">

                    <div className="flex flex-wrap items-center gap-2.5">

                        <h3 className="truncate text-xs font-bold text-white transition-colors group-hover:text-amber-300 sm:text-sm">
                            {resume.fileName}
                        </h3>

                        {/* Current Version Status */}
                        {currentVersion ? (
                            <ResumeStatus
                                resumeStatus={currentVersion.resumeStatus}
                                analysisStatus={currentVersion.analysisStatus}
                            />
                        ) : (
                            <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-800" />
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-zinc-400">

                        <span className="font-semibold uppercase text-zinc-300">
                            {isPdf
                                ? "PDF"
                                : "DOCX"}
                        </span>

                        <span className="text-zinc-600">
                            •
                        </span>

                        <span>
                            {formatFileSize(
                                resume.fileSize,
                            )}
                        </span>

                        <span className="text-zinc-600">
                            •
                        </span>

                        <span>
                            {formatDate(
                                resume.createdAt,
                            )}
                        </span>

                        {/* Current version number */}
                        {currentVersion && (
                            <>
                                <span className="text-zinc-600">
                                    •
                                </span>

                                <span className="text-amber-400/80">
                                    Version{" "}
                                    {
                                        currentVersion.versionNumber
                                    }
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-3 sm:shrink-0">

                <button
                    type="button"
                    onClick={() =>
                        onAnalyze(resume)
                    }
                    aria-label="Analyze resume"
                    disabled={
                        !canAnalyze
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-zinc-950 shadow-md shadow-amber-500/5 transition-all hover:bg-amber-300 active:scale-[0.98] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Sparkles className="size-3.5" />

                    Analyze
                </button>

                {/* Resume Options Menu */}
                <div
                    className={`relative ${
                        menuOpen
                            ? "z-30"
                            : "z-auto"
                    }`}
                >
                    <button
                        type="button"
                        aria-label="Resume options"
                        aria-expanded={
                            menuOpen
                        }
                        onClick={() =>
                            setMenuOpen(
                                (value) =>
                                    !value,
                            )
                        }
                        className="flex size-9 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                    >
                        <MoreHorizontal className="size-4" />
                    </button>

                    <ResumeMenu
                        menuOpen={menuOpen}
                        setMenuOpen={
                            setMenuOpen
                        }
                        onResumeView={
                            onResumeView
                                ? () =>
                                    onResumeView(
                                        resume,
                                    )
                                : undefined
                        }
                        onResumeDownload={
                            onResumeDownload
                                ? () =>
                                    onResumeDownload(
                                        resume,
                                    )
                                : undefined
                        }
                        onReplace={
                            onReplace
                                ? () =>
                                    onReplace(
                                        resume,
                                    )
                                : undefined
                        }
                        onVersionHistory={
                            onVersionHistory
                                ? () =>
                                    onVersionHistory(
                                        resume,
                                    )
                                : undefined
                        }
                        onDelete={() =>
                            onDelete(
                                resume,
                            )
                        }
                    />
                </div>
            </div>
        </div>
    );
}