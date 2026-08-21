"use client";

import {getResumes, deleteResume, viewResume, downloadResume} from "@/lib/api/resumes";
import { useEffect, useMemo, useState } from "react";
import {FileText, Plus, Search, Sparkles, UploadCloud,} from "lucide-react";
import {Resume} from "@/utils/types";
import {ResumeRow} from "@/components/resumes/ResumeRow";
import {UploadResumeModal} from "@/components/resumes/UploadResumeModal";
import { DeleteResumeModal } from "@/components/resumes/DeleteResumeModal";
import { ReplaceResumeModal } from "@/components/resumes/ReplaceResumeModal";
import {VersionHistoryModal} from "@/components/resumes/VersionHistoryModal";

export function ResumesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
    const [replaceResume, setReplaceResume] = useState<Resume | null>(null);
    const [versionHistoryResume, setVersionHistoryResume] = useState<Resume | null>(null);

    async function loadResumes() {
        try {
            setLoading(true);
            setError(null);

            const data =
                await getResumes();

            setResumes(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load resumes.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteResume() {
        if (!deleteTarget) {
            return;
        }

        try {
            await deleteResume(
                deleteTarget.id,
            );

            setDeleteTarget(null);

            await loadResumes();
        } catch (error) {
            console.error(
                "Delete resume error:",
                error,
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to delete resume.",
            );
        }
    }

    useEffect(() => {
        loadResumes();
    }, []);

    const filteredResumes =
        useMemo(() => {
            const query =
                searchQuery.trim().toLowerCase();

            if (!query) {
                return resumes;
            }

            return resumes.filter((resume) =>
                resume.fileName
                    .toLowerCase()
                    .includes(query),
            );
        }, [resumes, searchQuery]);

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased px-6 py-10 selection:bg-amber-400 selection:text-zinc-950 relative overflow-hidden">
            {/* Ambient Radial Background Glows */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute left-1/2 top-[-10rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
                <div className="absolute right-[-10rem] top-[20rem] h-[25rem] w-[25rem] rounded-full bg-amber-400/5 blur-[140px]" />
            </div>

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
                        <Search
                            className="size-6 z-10 absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/50"
                        />

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search resumes by title or key skill..."
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-4 text-xs sm:text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 backdrop-blur-md"
                        />
                    </div>
                </div>

                {/* Resume List Container */}
                <div className="mt-8">
                    <div className="rounded-[2.5rem] border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-2xl">
                        <div className="border-b border-zinc-800/80 px-6 py-5 sm:px-8">
                            <h2 className="text-sm font-bold text-white">
                                Your uploaded documents
                            </h2>

                            <p className="mt-1 text-xs text-zinc-400">
                                Resumes ready for job-matching and automated ATS analysis.
                            </p>
                        </div>

                        {loading ? (
                            <div className="space-y-3 p-6">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                                    />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-10 text-center">
                                <p className="text-sm text-red-500">
                                    {error}
                                </p>
                            </div>
                        ) : filteredResumes.length === 0 ? (
                                // empty state
                            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                                <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
                                    <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-lg" />
                                    <FileText className="relative size-7" />
                                </div>

                                <h3 className="text-lg font-bold text-white">
                                    No resumes uploaded yet
                                </h3>

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
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredResumes.map((resume) => (
                                    <ResumeRow
                                        key={resume.id}
                                        resume={resume}

                                        onAnalyze={(id) => {
                                            console.log("Analyze resume:", id);
                                        }}

                                        onResumeView={async (resume) => {
                                            try {
                                                const blob = await viewResume(resume.id);

                                                const url = URL.createObjectURL(blob);

                                                window.open(url, "_blank");

                                                setTimeout(() => {
                                                    URL.revokeObjectURL(url);
                                                }, 60_000);
                                            } catch (error) {
                                                console.error("View resume error:", error,);
                                            }
                                        }}

                                        onResumeDownload={async (resume) => {
                                            try {
                                                const blob = await downloadResume(resume.id);

                                                const url = URL.createObjectURL(blob);

                                                const link = document.createElement("a");

                                                link.href = url;
                                                link.download = resume.fileName;

                                                document.body.appendChild(link);

                                                link.click();

                                                link.remove();

                                                URL.revokeObjectURL(url);
                                            } catch (error) {
                                                console.error(
                                                    "Download resume error:",
                                                    error,
                                                );
                                            }
                                        }}

                                        onReplace={(resume) =>
                                            setReplaceResume(resume)
                                        }

                                        onVersionHistory={(resume) =>
                                            setVersionHistoryResume(resume)
                                        }

                                        onDelete={(resume) => {
                                            setDeleteTarget(resume);
                                        }}
                                    />
                                ))}
                            </div>
                            )}
                    </div>
                    <UploadResumeModal
                        open={uploadOpen}
                        onClose={() => setUploadOpen(false)}
                        onUploaded={loadResumes}
                    />

                    <DeleteResumeModal
                        resume={deleteTarget}
                        open={deleteTarget !== null}
                        onClose={() => setDeleteTarget(null)}
                        onConfirm={handleDeleteResume}
                    />

                    <ReplaceResumeModal
                        open={replaceResume !== null}
                        resume={replaceResume}
                        onClose={() => setReplaceResume(null)}
                        onReplaced={loadResumes}
                    />

                    <VersionHistoryModal
                        open={versionHistoryResume !== null}
                        resume={versionHistoryResume}
                        onClose={() => setVersionHistoryResume(null)}
                    />

                </div>
            </div>
        </main>
    );
}