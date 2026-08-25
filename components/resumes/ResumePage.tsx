"use client";

import { getResumes, deleteResume, viewResume, downloadResume } from "@/lib/api/resumes";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, FileText, Plus, Search, Sparkles, UploadCloud } from "lucide-react";
import { Resume } from "@/utils/types";
import { ResumeRow } from "@/components/resumes/ResumeRow";
import { UploadResumeModal } from "@/components/resumes/UploadResumeModal";
import { DeleteResumeModal } from "@/components/resumes/DeleteResumeModal";
import { ReplaceResumeModal } from "@/components/resumes/ReplaceResumeModal";
import { VersionHistoryModal } from "@/components/resumes/VersionHistoryModal";
import { AnalyzeResumeModal } from "@/components/resumes/AnalyzeResumeModal";
import { useRouter } from "next/navigation";
import {signOutUser} from "@/lib/firebase/auth";

interface ToastNotification {
    id: string;
    type: "success" | "error";
    title: string;
    message?: string;
}

export function ResumesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
    const [replaceResume, setReplaceResume] = useState<Resume | null>(null);
    const [versionHistoryResume, setVersionHistoryResume] = useState<Resume | null>(null);
    const [toast, setToast] = useState<ToastNotification | null>(null);
    const [analyzeResume, setAnalyzeResume] = useState<Resume | null>(null);

    const router = useRouter();

    function showToast(type: "success" | "error", title: string, message?: string) {
        const id = Math.random().toString();
        setToast({ id, type, title, message });
        setTimeout(() => setToast(null), 4000);
    }

    async function loadResumes() {
        try {
            setLoading(true);
            setError(null);
            const data = await getResumes();
            setResumes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unable to load resumes.");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteResume() {
        if (!deleteTarget) return;

        const targetName = deleteTarget.fileName;
        const targetId = deleteTarget.id;

        try {
            setDeleting(true);
            setDeleteError(null);

            await deleteResume(targetId);

            // Optimistic update: Remove immediately from local state
            setResumes((prev) => prev.filter((r) => r.id !== targetId));
            setDeleteTarget(null);

            showToast("success", "Resume deleted", `"${targetName}" has been removed.`);
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Unable to delete resume.");
        } finally {
            setDeleting(false);
        }
    }

    useEffect(() => {
        loadResumes();
    }, []);

    async function handleSignOut() {
        try {
            await signOutUser();
            router.push("/");
        } catch (error) {
            console.error("Failed to sign out:", error);
            // Optionally alert the user or show a toast notification
        }
    }

    const filteredResumes = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return resumes;
        return resumes.filter((resume) => resume.fileName.toLowerCase().includes(query));
    }, [resumes, searchQuery]);

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased px-6 py-10 selection:bg-amber-400 selection:text-zinc-950 relative overflow-hidden">
            {/* Ambient Radial Background Glows */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute left-1/2 top-[-10rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
                <div className="absolute right-[-10rem] top-[20rem] h-[25rem] w-[25rem] rounded-full bg-amber-400/5 blur-[140px]" />
            </div>

            {/* Global Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/95 px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-200">
                    {toast.type === "success" ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                    ) : (
                        <AlertCircle className="size-4 shrink-0 text-rose-400" />
                    )}
                    <div>
                        <p className="font-bold text-white">{toast.title}</p>
                        {toast.message && <p className="text-[11px] font-medium text-zinc-400">{toast.message}</p>}
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-6xl">
                {/* Header Section */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
                            <Sparkles className="size-3.5" />
                            Resume workspace
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            My Resumes
                        </h1>

                        <p className="mt-2 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400">
                            Upload, manage, and analyze your resumes against target job descriptions with actionable AI insights.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setUploadOpen(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-300 active:scale-[0.98] cursor-pointer"
                    >
                        <Plus className="size-4" />
                        Upload Resume
                    </button>
                </div>

                {/* Search Input Bar */}
                <div className="mt-8">
                    <div className="relative max-w-md">
                        <Search className="size-5 z-10 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/50" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search resumes by title or key skill..."
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-4 text-xs sm:text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 backdrop-blur-md"
                        />
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="bg-rose-500/40 cursor-pointer px-4 py-2 rounded-xl text-red-400"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Resume List Container */}
                <div className="mt-8">
                    {/* REMOVED overflow-hidden HERE to prevent clipping action menus */}
                    <div className="rounded-[2.5rem] border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-2xl relative">
                        <div className="border-b border-zinc-800/80 px-6 py-5 sm:px-8 rounded-t-[2.5rem]">
                            <h2 className="text-sm font-bold text-white">Your uploaded documents</h2>
                            <p className="mt-1 text-xs text-zinc-400">
                                Resumes ready for job-matching and automated ATS analysis.
                            </p>
                        </div>

                        {loading ? (
                            <div className="space-y-3 p-6">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="h-20 animate-pulse rounded-2xl bg-zinc-800/50" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-rose-400">{error}</p>
                            </div>
                        ) : filteredResumes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                                <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
                                    <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-lg" />
                                    <FileText className="relative size-7" />
                                </div>
                                <h3 className="text-lg font-bold text-white">No resumes uploaded yet</h3>
                                <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-400">
                                    Upload your existing resume in PDF or DOCX format to unlock ATS scoring, keyword match analysis, and targeted suggestions.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setUploadOpen(true)}
                                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-6 py-3 text-xs font-bold text-white transition-all hover:border-amber-400/40 hover:bg-zinc-700 active:scale-[0.98] cursor-pointer"
                                >
                                    <UploadCloud className="size-4 text-amber-400" />
                                    Upload your first resume
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-800/60 rounded-b-[2.5rem]">
                                {filteredResumes.map((resume) => (
                                    <ResumeRow
                                        key={resume.id}
                                        resume={resume}
                                        onAnalyze={(resume) => setAnalyzeResume(resume)}
                                        onResumeView={async (res) => {
                                            try {
                                                const blob = await viewResume(res.id);
                                                const url = URL.createObjectURL(blob);
                                                window.open(url, "_blank");
                                                setTimeout(() => URL.revokeObjectURL(url), 60_000);
                                            } catch (err) {
                                                showToast("error", "Unable to view resume", err instanceof Error ? err.message : undefined);
                                            }
                                        }}
                                        onResumeDownload={async (res) => {
                                            try {
                                                const blob = await downloadResume(res.id);
                                                const url = URL.createObjectURL(blob);
                                                const link = document.createElement("a");
                                                link.href = url;
                                                link.download = res.fileName;
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                                URL.revokeObjectURL(url);
                                            } catch (err) {
                                                showToast("error", "Download failed", err instanceof Error ? err.message : undefined);
                                            }
                                        }}
                                        onReplace={(res) => setReplaceResume(res)}
                                        onVersionHistory={(res) => setVersionHistoryResume(res)}
                                        onDelete={(res) => setDeleteTarget(res)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <UploadResumeModal
                        open={uploadOpen}
                        onClose={() => setUploadOpen(false)}
                        onUploaded={() => {
                            loadResumes();
                            showToast("success", "Resume uploaded", "Your file is ready for analysis.");
                        }}
                    />

                    <DeleteResumeModal
                        resume={deleteTarget}
                        error={deleteError}
                        deleting={deleting}
                        open={deleteTarget !== null}
                        onClose={() => {
                            if (!deleting) setDeleteTarget(null);
                        }}
                        onConfirm={handleDeleteResume}
                    />

                    <ReplaceResumeModal
                        open={replaceResume !== null}
                        resume={replaceResume}
                        onClose={() => setReplaceResume(null)}
                        onReplaced={() => {
                            loadResumes();
                            showToast("success", "Resume replaced", "Version history updated successfully.");
                        }}
                    />

                    <VersionHistoryModal
                        open={versionHistoryResume !== null}
                        resume={versionHistoryResume}
                        onClose={() => setVersionHistoryResume(null)}
                    />

                    <AnalyzeResumeModal
                        open={analyzeResume !== null}
                        resume={analyzeResume}
                        onClose={() => setAnalyzeResume(null)}
                        onAnalyze={async (data) => {
                            console.log("Resume:", analyzeResume);
                            console.log("Current version:", analyzeResume?.currentVersionId);
                            console.log("Analysis data:", data);
                        }}
                    />
                </div>
            </div>
        </main>
    );
}