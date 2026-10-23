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
import { ReplaceResumeModal } from "@/components/resumes/ReplaceResumeModal";
import { VersionHistoryModal } from "@/components/resumes/VersionHistoryModal";
import { AnalyzeResumeModal } from "@/components/resumes/AnalyzeResumeModal";

import { fetchAnalysisData } from "@/lib/api/analyses";

import { Resume, ResumeVersion, ServerResumeAnalysis } from "@/utils/types";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [currentResumeVersions, setCurrentResumeVersions] = useState<Record<string, ResumeVersion>>({});
    const [analyses, setAnalyses] = useState<ServerResumeAnalysis[]>([]);


    // Modals & Selection States
    const [uploadOpen, setUploadOpen] = useState(false);
    const [replaceResume, setReplaceResume] = useState<Resume | null>(null);
    const [versionHistoryResume, setVersionHistoryResume] = useState<Resume | null>(null);
    const [analyzeResume, setAnalyzeResume] = useState<Resume | null>(null);
    const [selectedAudit, setSelectedAudit] = useState<ServerResumeAnalysis | null>(null);


    const loadData = useCallback(async () => {
        try {
            const data = await fetchAnalysisData();

            setResumes(data.resumes);
            setCurrentResumeVersions(data.currentResumeVersions);
            setAnalyses(data.analyses);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        }
    }, []);



    useEffect(() => {
        let cancelled = false;

        async function initializeDashboard() {
            try {
                const data = await fetchAnalysisData();

                if (cancelled) return;

                setResumes(data.resumes);
                setCurrentResumeVersions(data.currentResumeVersions);
                setAnalyses(data.analyses);
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to load dashboard data:", error);
                }
            }
        }

        void initializeDashboard();

        return () => {
            cancelled = true;
        };
    }, []);


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

            <div className="mx-auto max-w-6xl space-y-10">
                {/* Header */}
                <DashboardHeader
                    onUploadOpen={() => setUploadOpen(true)}
                    showUploadButton={resumes.length > 0}
                />

                <MetricsGrid resumes={resumes} analyses={analyses} />

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
                    onSelectAnalysis={(analysis) => setSelectedAudit(analysis)}
                    showHeader
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