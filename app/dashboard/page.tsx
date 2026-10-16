"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AmbientBackground } from "@/components/dashboard/AmbientBackground";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { AnalysisHistorySection } from "@/components/dashboard/AnalysisHistorySection";
import { AnalysisAuditModal } from "@/components/dashboard/AnalysisAuditModal";
import {
    DashboardResumeLogs,
    ResumeAuditLog
} from "@/components/dashboard/DashboardResumeLogs";

import { UploadResumeModal } from "@/components/resumes/UploadResumeModal";
import { DeleteResumeModal } from "@/components/resumes/DeleteResumeModal";
import { ReplaceResumeModal } from "@/components/resumes/ReplaceResumeModal";
import { VersionHistoryModal } from "@/components/resumes/VersionHistoryModal";
import { AnalyzeResumeModal } from "@/components/resumes/AnalyzeResumeModal";

import {
    getResumes,
    deleteResume,
    getResumeVersionById,
    getResumeAnalysisById,
} from "@/lib/api/resumes";

import { Resume, ResumeVersion, ServerResume, ServerResumeAnalysis } from "@/utils/types";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [currentResumeVersions, setCurrentResumeVersions] = useState<Record<string, ResumeVersion>>({});
    const [analyses, setAnalyses] = useState<ServerResumeAnalysis[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modals & Selection States
    const [uploadOpen, setUploadOpen] = useState(false);
    const [replaceResume, setReplaceResume] = useState<Resume | null>(null);
    const [versionHistoryResume, setVersionHistoryResume] = useState<Resume | null>(null);
    const [analyzeResume, setAnalyzeResume] = useState<Resume | null>(null);
    const [selectedAudit, setSelectedAudit] = useState<ServerResumeAnalysis | null>(null);

    const [toast, setToast] = useState<{ id: string; type: "success" | "error"; title: string; message?: string } | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. Fetch Resumes
            const data: Resume[] = await getResumes();
            setResumes(data);

            // 2. Fetch Versions
            const versions = await Promise.all(
                data.map(async (resume) => {
                    const version = await getResumeVersionById(resume.id, resume.currentVersionId);
                    return { resumeId: resume.id, version };
                })
            );

            const versionMap: Record<string, ResumeVersion> = {};
            versions.forEach(({ resumeId, version }) => {
                if (version) versionMap[resumeId] = version;
            });
            setCurrentResumeVersions(versionMap);

            // 3. Fetch Analyses
            const analysisList = await Promise.all(
                Object.values(versionMap).map(async (version) => {
                    if (!version.analysisId) return null;
                    try {
                        return await getResumeAnalysisById(version.resumeId, version.analysisId);
                    } catch {
                        return null;
                    }
                })
            );

            const validAnalyses = analysisList.filter(Boolean) as ServerResumeAnalysis[];
            setAnalyses(validAnalyses);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    // --- Transform state data to 2-in-a-row DashboardResumeLogs props ---
    const resumeAuditLogs = useMemo<ResumeAuditLog[]>(() => {
        return resumes.map((resume) => {
            const currentVersion = currentResumeVersions[resume.id];
            const matchingAnalysis = analyses.find((a) => a.resumeId === resume.id);

            // Status resolution logic
            let status: ResumeAuditLog["status"] = "ready";
            if (matchingAnalysis) {
                if (matchingAnalysis.analysisStatus === "completed") status = "completed";
                else if (matchingAnalysis.analysisStatus === "processing") status = "processing";
                else if (matchingAnalysis.analysisStatus === "failed") status = "failed";
            }

            return {
                id: resume.id,
                fileName: resume.fileName,
                uploadedAt: resume.createdAt
                    ? new Date(resume.createdAt).toLocaleDateString()
                    : "Recently",
                status,
                atsScore: matchingAnalysis?.ATS?.score,
                matchPercentage: matchingAnalysis?.overallScore ?? undefined,
                targetRole: matchingAnalysis?.jobTitle,
                version: currentVersion ? currentVersion.versionNumber?.toString() || "1.0" : "1.0",
            };
        });
    }, [resumes, currentResumeVersions, analyses]);

    return (
        <main className="relative min-h-screen bg-zinc-950 px-6 py-10 font-sans text-zinc-100 antialiased selection:bg-amber-400 selection:text-zinc-950">
            <AmbientBackground />

            {/* Global Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/95 px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
                    {toast.type === "success" ? (
                        <CheckCircle2 className="size-4 text-emerald-400" />
                    ) : (
                        <AlertCircle className="size-4 text-rose-400" />
                    )}
                    <div>
                        <p className="font-bold text-white">{toast.title}</p>
                        {toast.message && <p className="text-[11px] font-medium text-zinc-400">{toast.message}</p>}
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-6xl space-y-10">
                {/* Header */}
                <DashboardHeader
                    onUploadOpen={() => setUploadOpen(true)}
                    showUploadButton={resumes.length > 0}
                />

                {/* Aggregated KPI Metrics Grid */}
                <MetricsGrid resumes={resumes as unknown as ServerResume[]} analyses={analyses} />

                {/* --- 2-IN-A-ROW RESUME AUDIT LOGS SECTION --- */}

                <DashboardResumeLogs
                    resumes={resumeAuditLogs}
                    onSelectResume={(id) => {
                        const matchingAnalysis = analyses.find((a) => a.resumeId === id);
                        if (matchingAnalysis) {
                            setSelectedAudit(matchingAnalysis);
                        } else {
                            const targetResume = resumes.find((r) => r.id === id);
                            if (targetResume) setAnalyzeResume(targetResume);
                        }
                    }}
                    onViewAll={() => router.push("/resumes")}
                />

                {/* Audit Logs History Table */}
                <AnalysisHistorySection
                    analyses={analyses}
                    onSelectAnalysis={(a) => setSelectedAudit(a)}
                />
            </div>

            {/* Modals */}
            <UploadResumeModal open={uploadOpen} onClose={() => setUploadOpen(false)} onUploaded={loadData} />

            <ReplaceResumeModal open={replaceResume !== null} resume={replaceResume} onClose={() => setReplaceResume(null)} onReplaced={loadData} />
            <VersionHistoryModal open={versionHistoryResume !== null} resume={versionHistoryResume} onClose={() => setVersionHistoryResume(null)} />
            <AnalyzeResumeModal open={analyzeResume !== null} resume={analyzeResume} onClose={() => setAnalyzeResume(null)} onAnalyze={loadData} />
            <AnalysisAuditModal analysis={selectedAudit} onClose={() => setSelectedAudit(null)} />
        </main>
    );
}