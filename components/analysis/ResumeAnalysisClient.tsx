"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {AlertCircle, Loader2} from "lucide-react";

import { ServerResumeAnalysis } from "@/utils/types";
import { ResumeAnalysisResults } from "@/components/analysis/ResumeAnalysisResults";
import { fetchAnalysisById } from "@/lib/api/analyses";

interface AnalysisPageProps {
    params: Promise<{
        resumeId: string;
        analysisId: string;
    }>;
}

export default function ResumeAnalysisClient({
                                                 params,
                                             }: AnalysisPageProps) {
    const { resumeId, analysisId } = use(params);

    const router = useRouter();

    const [analysis, setAnalysis] =
        useState<ServerResumeAnalysis | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        let cancelled = false;

        async function loadAnalysis() {
            try {
                const data = await fetchAnalysisById(
                    resumeId,
                    analysisId
                );

                if (!cancelled) {
                    setAnalysis(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load analysis results."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        if (resumeId && analysisId) {
            void loadAnalysis();
        }

        return () => {
            cancelled = true;
        };
    }, [resumeId, analysisId]);


    if (loading) {
        return (
            <div className="flex min-h-[60vh] w-full flex-col items-center justify-center space-y-4">
                <Loader2 className="size-8 animate-spin text-amber-400" />

                <p className="text-xs text-zinc-400">
                    Loading analysis results...
                </p>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center p-4">
                <div className="w-full max-w-xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center shadow-lg">
                    <AlertCircle className="mx-auto size-12 text-rose-400" />

                    <h2 className="mt-4 text-xl font-semibold text-white">
                        Error Loading Report
                    </h2>

                    <p className="mt-2 text-base text-rose-300">
                        {error || "Analysis report not found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => router.push("/dashboard")}
                        className="mt-6 cursor-pointer rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <ResumeAnalysisResults analysis={analysis} />
        </main>
    );
}