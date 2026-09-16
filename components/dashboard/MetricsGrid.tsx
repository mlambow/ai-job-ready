// MetricsGrid.tsx
import React, { useMemo } from "react";
import { FileText, Briefcase, BarChart3, Layers } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { ServerResume, ServerResumeAnalysis } from "@/utils/types";

interface MetricsGridProps {
    resumes: ServerResume[];
    analyses: ServerResumeAnalysis[];
}

export function MetricsGrid({ resumes, analyses }: MetricsGridProps) {
    const stats = useMemo(() => {
        const totalResumes = resumes.length;
        const totalAnalyses = analyses.length;

        const completedAnalyses = analyses.filter((a) => a.overallScore !== null);
        const avgOverall = completedAnalyses.length
            ? Math.round(
                completedAnalyses.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
                completedAnalyses.length
            )
            : 0;

        const avgATS = completedAnalyses.length
            ? Math.round(
                completedAnalyses.reduce((acc, curr) => acc + (curr.ATS?.score || 0), 0) /
                completedAnalyses.length
            )
            : 0;

        return { totalResumes, totalAnalyses, avgOverall, avgATS };
    }, [resumes, analyses]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                label="Total Resumes"
                value={stats.totalResumes}
                subtext="Uploaded document versions"
                icon={FileText}
            />
            <MetricCard
                label="Target Analyses"
                value={stats.totalAnalyses}
                subtext="Job comparisons completed"
                icon={Briefcase}
            />
            <MetricCard
                label="Avg Overall Score"
                value={`${stats.avgOverall}%`}
                subtext="Across all target roles"
                icon={BarChart3}
            />
            <MetricCard
                label="Avg ATS Readiness"
                value={`${stats.avgATS}%`}
                subtext="Keyword & structure match"
                icon={Layers}
            />
        </div>
    );
}