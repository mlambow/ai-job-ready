"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2, RefreshCw } from "lucide-react";

import { AnalysisHistorySection } from "@/components/dashboard/AnalysisHistorySection";
import { AnalysisAuditModal } from "@/components/dashboard/AnalysisAuditModal";
import { fetchAnalyses } from "@/lib/api/analyses";

import type { ServerResumeAnalysis } from "@/utils/types";

export default function AnalysisPage() {
    const [analyses, setAnalyses] = useState<ServerResumeAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAnalysis, setSelectedAnalysis] =
        useState<ServerResumeAnalysis | null>(null);


    useEffect(() => {
        let cancelled = false;

        async function loadAnalyses() {
            try {
                const results = await fetchAnalyses();

                if (!cancelled) {
                    setAnalyses(results);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load your analysis history."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadAnalyses();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        setError(null);

        try {
            const results = await fetchAnalyses();
            setAnalyses(results);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load your analysis history."
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Page header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-xs text-zinc-400 transition-colors hover:text-white"
                        >
                            <ArrowLeft className="size-4" />
                            Back to dashboard
                        </Link>

                        <h1 className="text-3xl font-bold tracking-tight text-white">
                            Analysis History
                        </h1>

                        <p className="max-w-2xl text-sm text-zinc-400">
                            Review your resume analyses, ATS scores, and job compatibility
                            results in one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleRefresh()}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`size-4 ${loading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </button>
                </header>

                {/* Loading state */}
                {loading && (
                    <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-400">
                        <Loader2 className="size-5 animate-spin" />
                        Loading your analysis history...
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div
                        role="alert"
                        className="flex flex-col gap-4 rounded-2xl border border-rose-900/50 bg-rose-950/20 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-400" />
                            <div>
                                <h2 className="font-semibold text-white">
                                    Unable to load analyses
                                </h2>
                                <p className="mt-1 text-sm text-zinc-400">{error}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => void handleRefresh()}
                            className="rounded-lg bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/20"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Analysis history */}
                {!loading && !error && (
                    <>
                        {analyses.length > 0 ? (
                            <AnalysisHistorySection
                                analyses={analyses}
                                onSelectAnalysis={setSelectedAnalysis}
                            />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 px-6 py-16 text-center">
                                <h3 className="text-lg font-semibold text-white">
                                    No analyses yet
                                </h3>
                                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
                                    Once you analyze a resume against a job description, your
                                    results will appear here.
                                </p>
                                <Link
                                    href="/resumes"
                                    className="mt-5 inline-flex rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
                                >
                                    View my resumes
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Selected analysis details */}
            <AnalysisAuditModal
                analysis={selectedAnalysis}
                onClose={() => setSelectedAnalysis(null)}
            />
        </main>
    );
}
