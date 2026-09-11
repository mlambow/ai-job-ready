"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Resume } from "@/utils/types";
import {analyzeResume} from "@/lib/api/resumes";

interface AnalyzeResumeModalProps {
    open: boolean;
    resume: Resume | null;
    onClose: () => void;
    onAnalyze?: () => void;
}

export function AnalyzeResumeModal({
                                       open,
                                       resume,
                                       onClose,
                                       onAnalyze,
                                   }: AnalyzeResumeModalProps) {
    const [jobTitle, setJobTitle] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if(!resume) {
            setError("No resume selected!")
            return
        }

        if (!jobTitle.trim() || !jobDescription.trim()) {
            setError("Job title and job description are required.");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const result = await analyzeResume(resume?.id,
                {
                    jobTitle: jobTitle.trim(),
                    companyName: companyName.trim(),
                    jobDescription: jobDescription.trim(),
                }
            );

            onAnalyze?.()
            onClose()

            router.push(`/resumes/${resume.id}/analysis/${result.analysisId}`,);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to start resume analysis."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AnimatePresence>
            {open && resume && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !submitting) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-950/90 shadow-2xl shadow-black/50 backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                                    <Sparkles className="size-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold tracking-tight text-zinc-100">
                                        Analyze Resume
                                    </h2>
                                    <p className="text-xs text-zinc-400">
                                        Get AI-powered ATS and job match insights.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="flex size-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        {/* Selected Resume Pill */}
                        <div className="border-b border-zinc-800/80 bg-zinc-900/40 px-6 py-3.5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/50 text-amber-400">
                                    <FileText className="size-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-zinc-200">
                                        {resume.fileName}
                                    </p>
                                    <p className="text-[11px] text-zinc-500">
                                        Ready for analysis
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form
                            onSubmit={handleAnalyze}
                            className="min-h-0 flex-1 overflow-y-auto px-6 py-5"
                        >
                            <div className="space-y-4">
                                {/* Job Title */}
                                <div>
                                    <label
                                        htmlFor="jobTitle"
                                        className="mb-1.5 block text-xs font-medium text-zinc-300"
                                    >
                                        Job Title <span className="text-amber-400">*</span>
                                    </label>
                                    <input
                                        id="jobTitle"
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder="e.g. Senior Frontend Engineer"
                                        disabled={submitting}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-amber-500/50 focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                {/* Company Name */}
                                <div>
                                    <label
                                        htmlFor="companyName"
                                        className="mb-1.5 block text-xs font-medium text-zinc-300"
                                    >
                                        Company Name
                                    </label>
                                    <input
                                        id="companyName"
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Stripe"
                                        disabled={submitting}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-amber-500/50 focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                {/* Job Description */}
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label
                                            htmlFor="jobDescription"
                                            className="text-xs font-medium text-zinc-300"
                                        >
                                            Job Description <span className="text-amber-400">*</span>
                                        </label>
                                    </div>
                                    <textarea
                                        id="jobDescription"
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the full job description here..."
                                        disabled={submitting}
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-amber-500/50 focus:bg-zinc-900 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>

                                {/* Error Banner */}
                                {error && (
                                    <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3">
                                        <p className="text-xs font-medium text-rose-400">{error}</p>
                                    </div>
                                )}

                                {/* Footer Controls */}
                                <div className="flex items-center justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={submitting}
                                        className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-medium text-zinc-950 transition-all hover:bg-amber-300 active:scale-[0.98] hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="size-4 animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="size-4" />
                                                Analyze Resume
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}