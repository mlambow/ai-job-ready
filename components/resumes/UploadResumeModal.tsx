"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { AlertCircle, FileText, Loader2, Sparkles, Upload, X } from "lucide-react";

import { uploadResume } from "@/lib/api/resumes";

interface UploadResumeModalProps {
    open: boolean;
    onClose: () => void;
    onUploaded: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function UploadResumeModal({
                                      open,
                                      onClose,
                                      onUploaded,
                                  }: UploadResumeModalProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!open) {
        return null;
    }

    function validateFile(selectedFile: File) {
        if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
            return "Please upload a PDF or DOCX file.";
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            return "Your resume must be smaller than 10 MB.";
        }

        return null;
    }

    function handleFile(selectedFile: File) {
        setError(null);

        const validationError = validateFile(selectedFile);

        if (validationError) {
            setFile(null);
            setError(validationError);
            return;
        }

        setFile(selectedFile);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            handleFile(selectedFile);
        }
    }

    function handleDragOver(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(true);
    }

    function handleDragLeave(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);
    }

    function handleDrop(event: DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);

        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) {
            handleFile(droppedFile);
        }
    }

    async function handleUpload() {
        if (!file || uploading) {
            return;
        }

        try {
            setUploading(true);
            setError(null);

            await uploadResume(file);

            setFile(null);

            onUploaded();
            onClose();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to upload resume.",
            );
        } finally {
            setUploading(false);
        }
    }

    function handleClose() {
        if (uploading) {
            return;
        }

        setFile(null);
        setError(null);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 px-4 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-zinc-800/80 bg-zinc-900/90 shadow-2xl backdrop-blur-xl font-sans text-zinc-100 selection:bg-amber-400 selection:text-zinc-950 animate-in zoom-in-95 duration-200">

                {/* Ambient Top Glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-full -translate-x-1/2 bg-amber-500/10 blur-3xl" />

                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-zinc-800/80 px-6 py-5 sm:px-8">
                    <div>
                        <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                            <Sparkles className="size-3" />
                            ATS Scanner
                        </div>
                        <h2 className="text-lg font-extrabold text-white">
                            Upload Resume
                        </h2>
                        <p className="text-xs text-zinc-400">
                            Upload your PDF or DOCX resume to analyze.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={uploading}
                        aria-label="Close"
                        className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8">
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleInputChange}
                        className="hidden"
                    />

                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className={[
                                "group cursor-pointer rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200",
                                dragging
                                    ? "border-amber-400 bg-amber-400/10"
                                    : "border-zinc-800 bg-zinc-900/40 hover:border-amber-400/50 hover:bg-zinc-800/40",
                            ].join(" ")}
                        >
                            <div className="relative mx-auto flex size-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400 transition-colors group-hover:border-amber-400/50 group-hover:bg-amber-400/20">
                                <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-md" />
                                <Upload className="relative size-6" />
                            </div>

                            <h3 className="mt-4 text-xs sm:text-sm font-bold text-white transition-colors group-hover:text-amber-300">
                                Drop your resume here
                            </h3>

                            <p className="mt-1 text-xs text-zinc-400">
                                or click to browse your files
                            </p>

                            <p className="mt-4 text-[11px] font-medium text-zinc-500">
                                PDF or DOCX · Maximum 10 MB
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
                                    <FileText className="size-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs sm:text-sm font-bold text-white">
                                        {file.name}
                                    </p>

                                    <p className="mt-0.5 text-[11px] font-medium text-zinc-400">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </p>
                                </div>

                                {!uploading && (
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-400">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-zinc-800/80 px-6 py-4 sm:px-8">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={uploading}
                        className="rounded-full px-5 py-2.5 text-xs font-bold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-300 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 className="size-4 animate-spin text-zinc-950" />
                        ) : null}

                        {uploading ? "Uploading..." : "Upload Resume"}
                    </button>
                </div>
            </div>
        </div>
    );
}