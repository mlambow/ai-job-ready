"use client";

import { useEffect, useState } from "react";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { getResumes } from "@/lib/api/resumes";
import { getResumeAnalysis } from "@/lib/api/resumes";
import { ServerResume, ServerResumeAnalysis } from "@/utils/types";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const [resumes, setResumes] = useState<ServerResume[]>([]);
    const [analyses, setAnalyses] = useState<ServerResumeAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                setLoading(true);
                setError(null);

                // Step 1: Fetch all user resumes
                const fetchedResumes: ServerResume[] = await getResumes();
                setResumes(fetchedResumes);

                // Step 2: Extract resumeId from each resume and fetch its analysis concurrently
                const analysisResults = await Promise.allSettled(
                    fetchedResumes.map(async (resume) => {
                        // Pass resume.id directly to your getResumeAnalysis function
                        return await getResumeAnalysis(resume.id);
                    })
                );

                // Step 3: Filter out any failed requests and keep successful analyses
                const successfulAnalyses: ServerResumeAnalysis[] = analysisResults
                    .filter(
                        (result): result is PromiseFulfilledResult<ServerResumeAnalysis> =>
                            result.status === "fulfilled" && result.value !== null
                    )
                    .map((result) => result.value);

                setAnalyses(successfulAnalyses);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 px-6 py-4">
                    <Loader2 className="size-5 animate-spin text-amber-400" />
                    <span className="text-xs font-semibold text-zinc-300">
                        Loading your dashboard...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-white">
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-6 py-4 text-center">
                    <p className="text-xs font-bold text-rose-400">{error}</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-3 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return <DashboardClient resumes={resumes} analyses={analyses} />;
}