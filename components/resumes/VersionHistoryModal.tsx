"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    AlertCircle,
    Clock3,
    Eye,
    Download,
    FileText,
    Loader2,
    X,
} from "lucide-react";
import { getResumeVersions, viewResumeVersion, downloadResumeVersion } from "@/lib/api/resumes";
import { Resume, ResumeVersion } from "@/utils/types";
import Link from "next/link";

interface VersionHistoryModalProps {
    open: boolean;
    resume: Resume | null;
    onClose: () => void;
}

function formatDate(date: string | null) {
    if (!date) {
        return "Recently";
    }

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}

function capitalize(status: string | null) {
    if (!status) {
        return "";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VersionHistoryModal({open, resume, onClose}: VersionHistoryModalProps) {
    const [versions, setVersions] = useState<ResumeVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);
    const [downloadingVersionId, setDownloadingVersionId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    async function handleViewVersion(version: ResumeVersion) {
        if (!resume) return;

        try {
            setViewingVersionId(version.id);
            setActionError(null);

            const blob =
                await viewResumeVersion(
                    resume.id,
                    version.id,
                );

            const url =
                URL.createObjectURL(blob);

            window.open(
                url,
                "_blank",
                "noopener,noreferrer",
            );

            window.setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 60_000);
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to view resume version.",
            );
        } finally {
            setViewingVersionId(null);
        }
    }

    async function handleDownloadVersion(version: ResumeVersion) {
        if (!resume) return;

        try {
            setDownloadingVersionId(version.id);
            setActionError(null);

            const blob =
                await downloadResumeVersion(
                    resume.id,
                    version.id,
                );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                version.fileName;

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);
        } catch (error) {
            setActionError(
                error instanceof Error
                    ? error.message
                    : "Unable to download resume version.",
            );
        } finally {
            setDownloadingVersionId(null);
        }
    }

    // Avoid hydration mismatch when using React Portals in Next.js
    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when modal is active
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // Handle Escape keypress
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && open) {
                onClose();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (!open || !resume) {
            return;
        }

        const resumeId = resume.id;

        async function loadVersions() {
            try {
                setLoading(true);
                setError(null);

                const data = await getResumeVersions(resumeId);

                setVersions(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load version history."
                );
            } finally {
                setLoading(false);
            }
        }

        loadVersions();
    }, [open, resume]);

    if (!mounted || !open || !resume) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200"
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="version-history-title"
                className="relative z-10 flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-zinc-800/80 bg-zinc-900/95 shadow-2xl backdrop-blur-xl font-sans text-zinc-100 animate-in zoom-in-95 duration-200"
            >
                {/* Ambient Top Glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-full -translate-x-1/2 bg-amber-400/10 blur-3xl" />

                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 px-6 py-5 sm:px-8">
                    <div className="min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                            <div className="flex size-7 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-400">
                                <Clock3 className="size-4" />
                            </div>
                            <h2
                                id="version-history-title"
                                className="text-base font-extrabold text-white"
                            >
                                Version history
                            </h2>
                        </div>

                        <p className="mt-1 truncate text-xs text-zinc-400">
                            {resume.fileName}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white hover:cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Action Error Alert State */}
                {actionError && (
                    <div className="mx-6 mt-4 flex items-center justify-between gap-4 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 sm:mx-8">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="size-4 shrink-0 text-rose-400" />
                            <p className="text-xs font-semibold text-rose-400">
                                {actionError}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActionError(null)}
                            className="text-xs font-bold text-rose-300 hover:text-rose-200"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Content Body */}
                <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
                    {loading ? (
                        <div className="flex min-h-52 flex-col items-center justify-center text-center">
                            <Loader2 className="size-8 animate-spin text-amber-400" />
                            <p className="mt-3 text-xs font-semibold text-zinc-400">
                                Loading version history...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-52 flex-col items-center justify-center text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
                                <AlertCircle className="size-6" />
                            </div>
                            <p className="mt-3 text-sm font-bold text-rose-400">
                                Unable to load versions
                            </p>
                            <p className="mt-1 max-w-sm text-xs text-zinc-500">{error}</p>
                        </div>
                    ) : versions.length === 0 ? (
                        <div className="flex min-h-52 flex-col items-center justify-center text-center">
                            <div className="flex size-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/60 text-zinc-600">
                                <FileText className="size-6" />
                            </div>
                            <p className="mt-3 text-sm font-bold text-white">
                                No versions found
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                                This resume does not have any stored versions yet.
                            </p>
                        </div>
                    ) : (
                        <div className="relative space-y-4 pl-8 sm:pl-10">
                            {/* Vertical Timeline Gradient Spine Line */}
                            <div className="absolute bottom-6 left-3.5 top-6 w-0.5 -translate-x-1/2 bg-gradient-to-b from-amber-400/40 via-zinc-800 to-zinc-800/20 sm:left-4" />

                            {versions.map((version) => {
                                const isCurrent = version.fileId === resume.fileId;
                                const hasAnalysis = Boolean(version.analysisId);

                                const content = (
                                    <>
                                        {/* Numbered Timeline Node Badge */}
                                        <div
                                            className={`absolute -left-8 top-4 flex size-7 -translate-x-1/2 items-center justify-center rounded-full border text-[10px] font-black transition-all sm:-left-10 ${
                                                isCurrent
                                                    ? "border-amber-400 bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20"
                                                    : "border-zinc-700 bg-zinc-900 text-zinc-400 group-hover:border-zinc-500 group-hover:text-zinc-200"
                                            }`}
                                        >
                                            v{version.versionNumber}
                                        </div>

                                        {/* Version Card */}
                                        <div
                                            className={`rounded-2xl border p-4 transition-all ${
                                                isCurrent
                                                    ? "border-amber-400/40 bg-amber-400/5 shadow-lg shadow-amber-400/5"
                                                    : "border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-800/40"
                                            }`}
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div
                                                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                                                        isCurrent
                                                            ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                                                            : "border-zinc-800 bg-zinc-900 text-zinc-400"
                                                    }`}
                                                >
                                                    <FileText className="size-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-extrabold text-white">
                                                                Version {version.versionNumber}
                                                            </p>

                                                            {isCurrent && (
                                                                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400 shadow-sm shadow-amber-400/10">
                                                                    Current
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons Top Right */}
                                                        <div className="flex items-center gap-1.5">
                                                            {/* View Version */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewVersion(version)}
                                                                disabled={viewingVersionId === version.id || downloadingVersionId === version.id}
                                                                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[10px] font-bold text-zinc-300 transition-all hover:bg-amber-400/10 hover:border-amber-400/30  hover:text-amber-400   disabled:cursor-not-allowed hover:cursor-pointer disabled:opacity-50"
                                                            >
                                                                {viewingVersionId === version.id ? (
                                                                    <Loader2 className="size-3 animate-spin text-amber-400" />
                                                                ) : (
                                                                    <Eye className="size-3" />
                                                                )}
                                                                {viewingVersionId === version.id ? "Opening..." : "View"}
                                                            </button>

                                                            {/* Download Version */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDownloadVersion(version)}
                                                                disabled={downloadingVersionId === version.id || viewingVersionId === version.id}
                                                                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800  bg-zinc-900/80 px-2.5 py-1 text-[10px] font-bold text-zinc-300 transition-all hover:bg-amber-400/10 hover:border-amber-400/30  hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer"
                                                            >
                                                                {downloadingVersionId === version.id ? (
                                                                    <Loader2 className="size-3 animate-spin text-amber-400" />
                                                                ) : (
                                                                    <Download className="size-3" />
                                                                )}
                                                                {downloadingVersionId === version.id ? "Downloading..." : "Download"}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <p className="mt-1 truncate text-xs font-semibold text-zinc-300">
                                                        {version.fileName}
                                                    </p>

                                                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[10px] font-medium text-zinc-400">
                                                        <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5">
                                                            {formatDate(version.createdAt)}
                                                        </span>

                                                        <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5">
                                                            {formatFileSize(version.fileSize)}
                                                        </span>

                                                        <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 uppercase tracking-wider text-zinc-300">
                                                            {version.fileType.includes("pdf") ? "PDF" : "DOCX"}
                                                        </span>

                                                        <span className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 capitalize">
                                                            {capitalize(version.analysisId ? version.analysisStatus : version.resumeStatus)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                );

                                if (!hasAnalysis) {
                                    return (
                                        <div key={version.id} className="group relative">
                                            {content}
                                        </div>
                                    );
                                }

                                return (
                                    <Link
                                        key={version.id}
                                        href={`/resumes/${version.resumeId}/analysis/${version.analysisId}`}
                                        className="group relative block"
                                    >
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}