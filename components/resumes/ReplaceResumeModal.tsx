"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    Loader2,
    UploadCloud,
    X,
} from "lucide-react";
import { replaceResume } from "@/lib/api/resumes";
import { Resume } from "@/utils/types";

interface ReplaceResumeModalProps {
    open: boolean;
    resume?: Resume | null;
    onClose: () => void;
    onReplaced?: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function ReplaceResumeModal({
                                       open,
                                       resume,
                                       onClose,
                                       onReplaced,
                                   }: ReplaceResumeModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatches with React Portal
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
            if (e.key === "Escape" && open && !uploading) {
                handleClose();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, uploading]);

    if (!mounted || !open || !resume) {
        return null;
    }

    function resetState() {
        setFile(null);
        setError(null);
        setUploading(false);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    }

    function handleClose() {
        if (uploading) {
            return;
        }

        resetState();
        onClose();
    }

    function handleFileChange(selectedFile: File | undefined) {
        setError(null);

        if (!selectedFile) {
            return;
        }

        if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
            setError("Please select a PDF or DOCX file.");
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError("The resume must be smaller than 10 MB.");
            return;
        }

        setFile(selectedFile);
    }

    async function handleReplace() {
        if (!file || !resume) {
            setError("Please select a new resume first.");
            return;
        }

        try {
            setUploading(true);
            setError(null);

            await replaceResume(resume.id, file);

            resetState();
            onClose();
            onReplaced?.();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to replace resume."
            );
        } finally {
            setUploading(false);
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                onClick={handleClose}
                className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200"
                aria-hidden="true"
            />

            {/* Modal Card */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="replace-modal-title"
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-zinc-800/80 bg-zinc-900/95 shadow-2xl backdrop-blur-xl font-sans text-zinc-100 animate-in zoom-in-95 duration-200"
            >
                {/* Ambient Top Amber Glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-full -translate-x-1/2 bg-amber-400/10 blur-3xl" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-5 sm:px-8">
                    <div>
                        <h2 id="replace-modal-title" className="text-base font-extrabold text-white">
                            Replace resume
                        </h2>

                        <p className="mt-0.5 text-xs text-zinc-400">
                            Upload an updated version of your resume.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={uploading}
                        className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close modal"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-5 p-6 sm:p-8">
                    {/* Current resume */}
                    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            Current resume
                        </p>

                        <div className="mt-2 flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                                <FileText className="size-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-white">
                                    {resume.fileName}
                                </p>

                                <p className="mt-0.5 text-[10px] text-zinc-500">
                                    This version will remain in your version history.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Upload Dropzone */}
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => inputRef.current?.click()}
                        className={`group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                            file
                                ? "border-amber-400/50 bg-amber-400/5 hover:bg-amber-400/10"
                                : "border-zinc-800 bg-zinc-950/30 hover:border-amber-400/40 hover:bg-zinc-800/40"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        <div
                            className={`mb-3 flex size-12 items-center justify-center rounded-2xl border transition-transform duration-200 group-hover:scale-105 ${
                                file
                                    ? "border-amber-400/30 bg-amber-400/20 text-amber-300"
                                    : "border-zinc-800 bg-zinc-800/50 text-zinc-400 group-hover:border-amber-400/30 group-hover:bg-amber-400/10 group-hover:text-amber-400"
                            }`}
                        >
                            {file ? (
                                <CheckCircle2 className="size-6 text-amber-400" />
                            ) : (
                                <UploadCloud className="size-6 group-hover:text-amber-400" />
                            )}
                        </div>

                        {file ? (
                            <div className="max-w-full px-4">
                                <p className="truncate text-xs font-bold text-amber-300">
                                    {file.name}
                                </p>

                                <p className="mt-1 text-[11px] font-medium text-zinc-400">
                                    Click to choose a different file
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xs font-bold text-zinc-200 group-hover:text-white px-4">
                                    Choose your updated resume
                                </p>

                                <p className="mt-1 text-[11px] font-medium text-zinc-500">
                                    PDF or DOCX · Maximum 10 MB
                                </p>
                            </div>
                        )}
                    </button>

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={(event) => handleFileChange(event.target.files?.[0])}
                    />

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-rose-400">
                            <AlertCircle className="size-4 shrink-0" />
                            <p className="text-xs font-semibold">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-zinc-800/80 px-6 py-5 sm:px-8">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={uploading}
                        className="rounded-full border border-zinc-800/80 bg-zinc-800/40 px-5 py-2.5 text-xs font-bold text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleReplace}
                        disabled={!file || uploading}
                        className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400 px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-400/10 transition-all hover:bg-amber-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="size-3.5 animate-spin" />
                                Replacing...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="size-3.5" />
                                Replace resume
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}