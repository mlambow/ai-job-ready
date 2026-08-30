"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { ServerResumeAnalysis } from "@/utils/types";
import { getResumeAnalysisById } from "@/lib/api/resumes"; // Adjust import path
import { ResumeAnalysisResults } from "@/components/analysis/ResumeAnalysisResults";

interface AnalysisPageProps {
    params: Promise<{
        resumeId: string;
        analysisId: string;
    }>;
}

export default function ResumeAnalysisPage({ params }: AnalysisPageProps) {
    const { resumeId, analysisId } = use(params);
    const router = useRouter();

    const [analysis, setAnalysis] = useState<ServerResumeAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadAnalysis() {
            try {
                setLoading(true);
                setError(null);
                const data = await getResumeAnalysisById(resumeId, analysisId);
                setAnalysis(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load analysis results."
                );
            } finally {
                setLoading(false);
            }
        }

        if (resumeId && analysisId) {
            loadAnalysis();
        }
    }, [resumeId, analysisId]);


    if (loading) {
        return (
            <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4">
                <Loader2 className="size-8 animate-spin text-amber-400" />
                <p className="text-xs text-zinc-400">Loading analysis results...</p>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="mx-auto max-w-lg rounded-3xl border border-rose-500/20 bg-rose-500/10 p-6 text-center">
                <AlertCircle className="mx-auto size-8 text-rose-400" />
                <h2 className="mt-2 text-sm font-semibold text-white">Error Loading Report</h2>
                <p className="mt-1 text-xs text-rose-300">{error || "Analysis report not found."}</p>
                <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                >
                    Return to Dashboard
                </button>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <ResumeAnalysisResults
                analysis={analysis}
                onReanalyze={() => router.push(`/resumes/${resumeId}`)}
            />
        </main>
    );
}