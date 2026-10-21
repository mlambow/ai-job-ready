"use client";

import {
    getResumes,
    deleteResume,
    viewResume,
    downloadResume,
    getResumeVersionById, getResumeAnalysisById,
} from "@/lib/api/resumes";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CheckCircle2,
    AlertCircle,
    FileText,
    Plus,
    Search,
    Sparkles,
    UploadCloud, ArrowLeft,
} from "lucide-react";

import {
    Resume,
    ResumeVersion,
} from "@/utils/types";

import { ResumeRow } from "@/components/resumes/ResumeRow";
import { UploadResumeModal } from "@/components/resumes/UploadResumeModal";
import { DeleteResumeModal } from "@/components/resumes/DeleteResumeModal";
import { ReplaceResumeModal } from "@/components/resumes/ReplaceResumeModal";
import { VersionHistoryModal } from "@/components/resumes/VersionHistoryModal";
import { AnalyzeResumeModal } from "@/components/resumes/AnalyzeResumeModal";

import Link from "next/link";

interface ToastNotification {
    id: string;
    type: "success" | "error";
    title: string;
    message?: string;
}

export function ResumesPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [currentResumeVersions, setCurrentResumeVersions] = useState<Record<string, ResumeVersion>>({});
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
    const [companyNames, setCompanyNames] = useState<Record<string, string | null>>({});


    const showToast = useCallback(
        (
            type: "success" | "error",
            title: string,
            message?: string,
        ) => {
            const id = Math.random().toString();

            setToast({
                id,
                type,
                title,
                message,
            });

            setTimeout(() => {
                setToast(null);
            }, 4000);
        },
        [],
    );



    async function fetchResumePageData() {
        const data: Resume[] = await getResumes();

        const versions = await Promise.all(
            data.map(async (resume) => {
                const version = await getResumeVersionById(
                    resume.id,
                    resume.currentVersionId,
                );

                return {
                    resumeId: resume.id,
                    version,
                };
            }),
        );

        const versionMap: Record<string, ResumeVersion> = {};

        versions.forEach(({ resumeId, version }) => {
            if (version) {
                versionMap[resumeId] = version;
            }
        });

        const analyses = await Promise.all(
            Object.values(versionMap).map(async (version) => {
                if (!version.analysisId) return null;

                try {
                    return await getResumeAnalysisById(
                        version.resumeId,
                        version.analysisId,
                    );
                } catch (error) {
                    console.error("Unable to load resume analysis:", error);
                    return null;
                }
            }),
        );

        const companyNameMap: Record<string, string | null> = {};

        analyses.forEach((analysis) => {
            if (analysis) {
                companyNameMap[analysis.resumeId] = analysis.companyName;
            }
        });

        return {
            resumes: data,
            versionMap,
            companyNameMap,
        };
    }

    async function loadResumes() {
        try {
            setLoading(true);
            setError(null);

            const data = await fetchResumePageData();

            setResumes(data.resumes);
            setCurrentResumeVersions(data.versionMap);
            setCompanyNames(data.companyNameMap);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
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

        const targetName = deleteTarget.fileName;
        const targetId = deleteTarget.id;

        try {
            setDeleting(true);
            setDeleteError(null);

            await deleteResume(targetId);

            // Remove resume immediately
            setResumes((prev) =>
                prev.filter(
                    (resume) =>
                        resume.id !== targetId,
                ),
            );

            // Remove its current version
            setCurrentResumeVersions(
                (prev) => {
                    const updated = {...prev};

                    delete updated[targetId];

                    return updated;
                },
            );

            setDeleteTarget(null);

            showToast(
                "success",
                "Resume deleted",
                `"${targetName}" has been removed.`,
            );

        } catch (err) {
            setDeleteError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete resume.",
            );
        } finally {
            setDeleting(false);
        }
    }

    const handleResumeView = useCallback(async (resume: { id: string }) => {
        try {
            const blob = await viewResume(resume.id);
            const url = URL.createObjectURL(blob);

            window.open(url, "_blank");

            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 60_000);
        } catch (err) {
            showToast(
                "error",
                "Unable to view resume",
                err instanceof Error ? err.message : undefined
            );
        }
    }, [showToast]);

    const handleResumeDownload = useCallback(async (resume: { id: string; fileName: string; }) => {
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
        } catch (err) {
            showToast(
                "error",
                "Download failed",
                err instanceof Error ? err.message : undefined
            );
        }
    }, [showToast]);

    const filteredResumes = useMemo(() => {
        const query =
            searchQuery
                .trim()
                .toLowerCase();

        if (!query) {
            return resumes;
        }

        return resumes.filter(
            (resume) =>
                resume.fileName
                    .toLowerCase()
                    .includes(query),
        );

    }, [resumes, searchQuery]);


    useEffect(() => {
        let cancelled = false;

        async function initializeResumes() {
            try {
                const data = await fetchResumePageData();

                if (cancelled) return;

                setResumes(data.resumes);
                setCurrentResumeVersions(data.versionMap);
                setCompanyNames(data.companyNameMap);
                setError(null);
            } catch (err) {
                if (cancelled) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load resumes.",
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void initializeResumes();

        return () => {
            cancelled = true;
        };
    }, []);


    return (
        <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-6 py-10 font-sans text-zinc-100 antialiased selection:bg-amber-400 selection:text-zinc-950">

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
                        <p className="font-bold text-white">
                            {toast.title}
                        </p>

                        {toast.message && (
                            <p className="text-[11px] font-medium text-zinc-400">
                                {toast.message}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-6xl">

                {/* Header */}

                <div className=''>
                    <Link
                        href="/dashboard"
                        className="group inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-amber-400"
                    >
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                        Back to dashboard
                    </Link>

                    <div className='flex items-center justify-between w-full'>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
                            <Sparkles className="size-3.5" />
                            Resume workspace
                        </div>
                    </div>
                </div>

                {/*Sub Header*/}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                            My Resumes
                        </h1>

                        <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                            Upload, manage, and analyze your
                            resumes against target job
                            descriptions with actionable AI
                            insights.
                        </p>
                    </div>

                    {resumes.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setUploadOpen(true)}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-300 active:scale-[0.98]"
                        >
                            <Plus className="size-4"/>
                            Upload Resume
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="mt-6">

                    <div className="relative sm:w-full md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 z-10 size-5 -translate-y-1/2 text-amber-400/50" />

                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            placeholder="Search resumes by title or key skill..."
                            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-3 pl-10 pr-4 text-xs text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 backdrop-blur-md sm:text-sm"
                        />
                    </div>
                </div>

                {/* Resume List */}
                <div className="mt-6">

                    <div className="relative rounded-[2.5rem] border border-zinc-800/80 bg-zinc-900/60 shadow-2xl backdrop-blur-xl">

                        {resumes.length > 0 && (
                            <div className="rounded-t-[2.5rem] border-b border-zinc-800/80 px-6 py-5 sm:px-8">
                                <h2 className="text-sm font-bold text-white">
                                    Your uploaded documents
                                </h2>

                                <p className="mt-1 text-xs text-zinc-400">
                                    Resumes ready for job-matching
                                    and automated ATS analysis.
                                </p>
                            </div>
                        )}

                        {loading ? (
                            <div className="space-y-3 p-6">
                                {[1, 2, 3].map(
                                    (item) => (
                                        <div
                                            key={item}
                                            className="h-20 animate-pulse rounded-2xl bg-zinc-800/50"
                                        />
                                    ),
                                )}
                            </div>

                        ) : error ? (

                            <div className="p-10 text-center">
                                <p className="text-sm text-rose-400">
                                    {error}
                                </p>
                            </div>

                        ) : filteredResumes.length === 0 ? (

                            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

                                <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
                                    <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-lg" />

                                    <FileText className="relative size-7" />
                                </div>

                                <h3 className="text-lg font-bold text-white">
                                    No resumes uploaded yet
                                </h3>

                                <p className="mt-2 max-w-sm text-xs leading-relaxed text-zinc-400">
                                    Upload your existing resume
                                    in PDF or DOCX format to unlock
                                    ATS scoring, keyword match
                                    analysis, and targeted
                                    suggestions.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => setUploadOpen(true)}
                                    className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-6 py-3 text-xs font-bold text-white transition-all hover:border-amber-400/40 hover:bg-zinc-700 active:scale-[0.98]"
                                >
                                    <UploadCloud className="size-4 text-amber-400" />
                                    Upload your first resume
                                </button>
                            </div>

                        ) : (

                            <div className="divide-y divide-zinc-800/60 rounded-b-[2.5rem]">

                                {filteredResumes.map(
                                    (resume) => (
                                        <ResumeRow
                                            key={resume.id}
                                            resume={resume}
                                            companyName={companyNames[resume.id]}
                                            currentVersion={currentResumeVersions[resume.id]}
                                            onAnalyze={(resume) => setAnalyzeResume(resume)}
                                            onResumeView={handleResumeView}
                                            onResumeDownload={handleResumeDownload}
                                            onReplace={(resume) =>
                                                setReplaceResume(resume)
                                            }
                                            onVersionHistory={(resume) =>
                                                setVersionHistoryResume(resume)
                                            }
                                            onDelete={(resume) =>
                                                setDeleteTarget(resume)
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </div>

                    {/* Upload Modal */}
                    <UploadResumeModal
                        open={uploadOpen}
                        onClose={() => setUploadOpen(false)}
                        onUploaded={() => {void loadResumes();
                            showToast(
                                "success",
                                "Resume uploaded",
                                "Your file is ready for analysis.",
                            );
                        }}
                    />

                    {/* Delete Modal */}
                    <DeleteResumeModal
                        resume={deleteTarget}
                        error={deleteError}
                        deleting={deleting}
                        open={deleteTarget !== null}
                        onClose={() => {
                            if (!deleting) {
                                setDeleteTarget(null);
                            }
                        }}
                        onConfirm={handleDeleteResume}
                    />

                    {/* Replace Modal */}
                    <ReplaceResumeModal
                        open={replaceResume !== null}
                        resume={replaceResume}
                        onClose={() => setReplaceResume(null)}
                        onReplaced={() => {void loadResumes();
                            showToast(
                                "success",
                                "Resume replaced",
                                "Version history updated successfully.",
                            );
                        }}
                    />

                    {/* Version History Modal */}
                    <VersionHistoryModal
                        open={versionHistoryResume !== null}
                        resume={versionHistoryResume}
                        onClose={() => setVersionHistoryResume(null)}
                    />

                    {/* Analyze Modal */}
                    <AnalyzeResumeModal
                        open={analyzeResume !== null}
                        resume={analyzeResume}
                        onClose={() => setAnalyzeResume(null)}
                        onAnalyze={() => {setAnalyzeResume(null);
                            // Refresh the current version
                            void loadResumes();
                            showToast(
                                "success",
                                "Resume analyzed",
                                "Your resume analysis is complete.",
                            );
                        }}
                    />
                </div>
            </div>
        </main>
    );
}