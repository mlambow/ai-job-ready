"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    AlertCircle,
    Clock3,
    FileText,
    Loader2,
    X,
} from "lucide-react";
import { getResumeVersions } from "@/lib/api/resumes";
import { Resume } from "@/utils/types";

interface ResumeVersion {
    id: string;
    resumeId: string;
    userId: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    versionNumber: number;
    status: "uploaded" | "processing" | "completed" | "failed";
    createdAt: string | null;
    updatedAt: string | null;
}

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

function formatFileSize(bytes: number) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VersionHistoryModal({
                                        open,
                                        resume,
                                        onClose,
                                    }: VersionHistoryModalProps) {
    const [versions, setVersions] = useState<ResumeVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

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

        const resumeId = resume.id

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
                        className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                        aria-label="Close modal"
                    >
                        <X className="size-4" />
                    </button>
                </div>

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
                        <div className="relative space-y-3 pl-2 sm:pl-3">
                            {/* Vertical Timeline Guide Bar */}
                            <div className="absolute bottom-4 left-6 top-4 w-px bg-zinc-800/80 sm:left-7" />

                            {versions.map((version) => {
                                const isCurrent = version.fileId === resume.fileId;

                                return (
                                    <div
                                        key={version.id}
                                        className={`relative rounded-2xl border p-4 transition-all ${
                                            isCurrent
                                                ? "border-amber-400/40 bg-amber-400/5 shadow-lg shadow-amber-400/5"
                                                : "border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-800/40"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3.5">
                                            <div
                                                className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                                                    isCurrent
                                                        ? "border-amber-400/30 bg-amber-400/10 text-amber-400"
                                                        : "border-zinc-800 bg-zinc-900 text-zinc-400"
                                                }`}
                                            >
                                                <FileText className="size-4" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-xs font-extrabold text-white">
                                                        Version {version.versionNumber}
                                                    </p>

                                                    {isCurrent && (
                                                        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-400 shadow-sm shadow-amber-400/10">
                              Current
                            </span>
                                                    )}
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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