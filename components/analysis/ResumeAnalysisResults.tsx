"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    AlertTriangle,
    Building2,
    CheckCircle2,
    CircleX,
    FileText,
    Lightbulb,
    Printer,
    RotateCcw,
    Sparkles,
    Target,
    WandSparkles,
} from "lucide-react";

import { ServerResumeAnalysis } from "@/utils/types";
import ScoreCard from "@/components/analysis/ScoreCard";
import AnalysisSection from "@/components/analysis/AnalysisSection";
import ScoreGauge from "@/components/analysis/ScoreGauge";

interface ResumeAnalysisResultsProps {
    analysis: ServerResumeAnalysis;
    onReanalyze?: () => void;
}

export function ResumeAnalysisResults({analysis, onReanalyze,}: ResumeAnalysisResultsProps) {
    const [skillsTab, setSkillsTab] = useState<"matched" | "missing">("matched");

    const handlePrint = () => {
        window.print();
    };

    // Safely extract scores & data arrays with fallbacks
    const atsScore = analysis.ATS?.score ?? 0;
    const contentScore = analysis.content?.score ?? 0;
    const skillsScore = analysis.skills?.score ?? 0;
    const structureScore = analysis.structure?.score ?? 0;
    const toneScore = analysis.toneAndStyle?.score ?? 0;

    const matchedSkills = analysis.skills?.matchedSkills ?? [];
    const missingSkills = analysis.skills?.missingSkills ?? [];

    return (
        <div className="w-full space-y-6 text-zinc-100 print:bg-white print:text-zinc-900">

            <style>{`
                @media print {
                    body {
                        background: white !important;
                        color: black !important;
                    }

                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Header */}

            <div className="flex flex-col gap-5 rounded-3xl border border-zinc-800/80 bg-zinc-950/90 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between print:rounded-none print:border-b print:p-0 print:pb-5">

                <div className="space-y-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                        <Sparkles className="size-3" />
                        AI Resume Analysis
                    </span>

                    <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl print:text-zinc-900">
                        {analysis.jobTitle}
                    </h1>

                    {analysis.companyName && (
                        <p className="flex items-center gap-1.5 text-xs text-zinc-400 print:text-zinc-600">
                            <Building2 className="size-3.5" />

                            Target Company:
                            {" "}
                            {analysis.companyName}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2.5 no-print">

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
                    >
                        <Printer className="size-3.5" />
                        Export PDF
                    </button>

                    {onReanalyze && (
                        <button
                            type="button"
                            onClick={onReanalyze}
                            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                        >
                            <RotateCcw className="size-3.5" />
                            Re-analyze
                        </button>
                    )}
                </div>
            </div>

            {/* Overall Score */}

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6"
            >
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_1fr]">

                    <div className="flex justify-center">
                        <ScoreGauge
                            score={analysis.overallScore ?? 0}
                            label="Overall Resume Score"
                            sublabel="Overall AI evaluation"
                        />
                    </div>

                    <div className="space-y-4">

                        <div>
                            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                                <Target className="size-4 text-amber-400" />
                                Resume Overview
                            </h2>

                            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                                Your overall score combines ATS compatibility,
                                content quality, structure, skills,
                                tone and style, and job alignment.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-400">
                                ATS: {atsScore}%
                            </span>

                            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-400">
                                Content: {contentScore}%
                            </span>

                            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-400">
                                Skills: {skillsScore}%
                            </span>

                            <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-[11px] text-zinc-400">
                                Structure: {structureScore}%
                            </span>
                        </div>

                    </div>
                </div>
            </motion.div>

            {/* Scorecards */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <ScoreCard
                    title="ATS Score"
                    score={atsScore}
                    description="ATS suitability"
                />

                <ScoreCard
                    title="Tone & Style"
                    score={toneScore}
                    description="Professional writing quality"
                    delay={0.05}
                />

                <ScoreCard
                    title="Content"
                    score={contentScore}
                    description="Content relevance"
                    delay={0.1}
                />

                <ScoreCard
                    title="Structure"
                    score={structureScore}
                    description="Resume organization"
                    delay={0.15}
                />

            </div>

            {/* ATS Feedback */}

            {analysis.ATS && (
                <AnalysisSection
                    title={`ATS Feedback — ${atsScore}%`}
                    icon={
                        <FileText className="size-4 text-amber-400" />
                    }
                >
                    <div className="space-y-3">

                        {analysis.ATS.tips?.map((item, index) => {

                            const isGood = item.type === "good";
                            const isImprove = item.type === "improve";

                            return (
                                <div
                                    key={index}
                                    className={`rounded-2xl border p-4 ${
                                        isGood
                                            ? "border-emerald-500/20 bg-emerald-500/10"
                                            : isImprove
                                                ? "border-amber-500/20 bg-amber-500/10"
                                                : "border-rose-500/20 bg-rose-500/10"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">

                                        {isGood ? (
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                                        ) : isImprove ? (
                                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                                        ) : (
                                            <CircleX className="mt-0.5 size-4 shrink-0 text-rose-400" />
                                        )}

                                        <p className="text-xs leading-relaxed text-zinc-300">
                                            {item.tip}
                                        </p>

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </AnalysisSection>
            )}

            {/* Content Analysis */}

            {analysis.content && (
                <AnalysisSection
                    title={`Content Analysis — ${contentScore}%`}
                    icon={
                        <Lightbulb className="size-4 text-blue-400" />
                    }
                >
                    <div className="space-y-3">

                        {analysis.content.tips?.map((item, index) => {

                            const isGood = item.type === "good";
                            const isImprove = item.type === "improve";

                            return (
                                <div
                                    key={index}
                                    className={`rounded-2xl border p-4 ${
                                        isGood
                                            ? "border-emerald-500/20 bg-emerald-500/10"
                                            : isImprove
                                                ? "border-amber-500/20 bg-amber-500/10"
                                                : "border-rose-500/20 bg-rose-500/10"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">

                                        {isGood ? (
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                                        ) : isImprove ? (
                                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
                                        ) : (
                                            <CircleX className="mt-0.5 size-4 shrink-0 text-rose-400" />
                                        )}

                                        <p className="text-xs leading-relaxed text-zinc-300">
                                            {item.explanation}
                                        </p>

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </AnalysisSection>
            )}

            {/* Skills */}

            {analysis.skills && (
                <AnalysisSection
                    title={`Skills Analysis — ${skillsScore}%`}
                    icon={
                        <Target className="size-4 text-purple-400" />
                    }
                >
                    <div className="space-y-6">

                        <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/80 p-1 no-print">

                            <button
                                type="button"
                                onClick={() => setSkillsTab("matched")}
                                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
                                    skillsTab === "matched"
                                        ? "bg-emerald-500 text-white"
                                        : "text-zinc-400"
                                }`}
                            >
                                Matched Skills (
                                {matchedSkills.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setSkillsTab("missing")}
                                className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium ${
                                    skillsTab === "missing"
                                        ? "bg-rose-500 text-white"
                                        : "text-zinc-400"
                                }`}
                            >
                                Missing Skills (
                                {missingSkills.length})
                            </button>

                        </div>

                        <AnimatePresence mode="wait">

                            <motion.div
                                key={skillsTab}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="flex flex-wrap gap-2"
                            >

                                {(skillsTab === "matched"
                                        ? matchedSkills
                                        : missingSkills
                                ).map((skill, index) => (

                                    <span
                                        key={index}
                                        className={`rounded-xl border px-3 py-1.5 text-xs ${
                                            skillsTab === "matched"
                                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                                        }`}
                                    >
                                        {skill}
                                    </span>

                                ))}

                            </motion.div>

                        </AnimatePresence>

                        {/* Skills Tips */}

                        {analysis.skills.tips && analysis.skills.tips.length > 0 && (
                            <div className="border-t border-zinc-800 pt-5">

                                <h3 className="mb-4 text-xs font-bold text-white">
                                    Skills Recommendations
                                </h3>

                                <div className="space-y-3">

                                    {analysis.skills.tips.map((item, index) => (

                                        <div
                                            key={index}
                                            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
                                        >
                                            <p className="text-xs leading-relaxed text-zinc-300">
                                                {item.explanation}
                                            </p>
                                        </div>

                                    ))}

                                </div>
                            </div>
                        )}

                    </div>
                </AnalysisSection>
            )}

            {/* Experience */}

            {analysis.experience && (
                <AnalysisSection
                    title="Experience Analysis"
                    icon={
                        <CheckCircle2 className="size-4 text-emerald-400" />
                    }
                >
                    <div className="space-y-5">

                        <p className="text-xs leading-relaxed text-zinc-300">
                            {analysis.experience.analysis}
                        </p>

                        {analysis.experience.recommendedMetrics && analysis.experience.recommendedMetrics.length > 0 && (
                            <div>

                                <h3 className="mb-3 text-xs font-bold text-white">
                                    Recommended Metrics
                                </h3>

                                <ul className="space-y-2">

                                    {analysis.experience.recommendedMetrics.map(
                                        (metric, index) => (

                                            <li
                                                key={index}
                                                className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300"
                                            >
                                                <span className="text-amber-400">
                                                    •
                                                </span>

                                                {metric}
                                            </li>

                                        ),
                                    )}

                                </ul>

                            </div>
                        )}

                    </div>
                </AnalysisSection>
            )}

            {/* Keywords */}

            {analysis.keywords && (
                <AnalysisSection
                    title="Keyword Recommendations"
                    icon={
                        <Sparkles className="size-4 text-amber-400" />
                    }
                >
                    <div className="space-y-5">

                        {analysis.keywords.missingKeywords && (
                            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">

                                <h3 className="mb-2 text-xs font-bold text-rose-400">
                                    Missing Keywords
                                </h3>

                                <p className="text-xs leading-relaxed text-zinc-300">
                                    {Array.isArray(analysis.keywords.missingKeywords)
                                        ? analysis.keywords.missingKeywords.join(", ")
                                        : analysis.keywords.missingKeywords}
                                </p>

                            </div>
                        )}

                        {analysis.keywords.tips && analysis.keywords.tips.length > 0 && (
                            <div>

                                <h3 className="mb-3 text-xs font-bold text-white">
                                    Keyword Optimization Tips
                                </h3>

                                <ul className="space-y-2">

                                    {analysis.keywords.tips.map(
                                        (tip, index) => (

                                            <li
                                                key={index}
                                                className="flex items-start gap-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300"
                                            >
                                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-amber-400" />

                                                {tip}
                                            </li>

                                        ),
                                    )}

                                </ul>

                            </div>
                        )}

                    </div>
                </AnalysisSection>
            )}

            {/* Summary */}

            {analysis.summary && (
                <AnalysisSection
                    title={`Resume Summary — ${analysis.summary.alignmentScore ?? 0}%`}
                    icon={
                        <FileText className="size-4 text-blue-400" />
                    }
                >
                    <div className="space-y-3">

                        {analysis.summary.tips?.map((item, index) => {

                            const isGood = item.type === "good";
                            const isImprove = item.type === "improve";

                            return (
                                <div
                                    key={index}
                                    className={`rounded-2xl border p-4 ${
                                        isGood
                                            ? "border-emerald-500/20 bg-emerald-500/10"
                                            : isImprove
                                                ? "border-amber-500/20 bg-amber-500/10"
                                                : "border-rose-500/20 bg-rose-500/10"
                                    }`}
                                >
                                    <p className="text-xs leading-relaxed text-zinc-300">
                                        {item.explanation}
                                    </p>
                                </div>
                            );
                        })}

                    </div>
                </AnalysisSection>
            )}

            {/* AI Improved Summary */}

            {analysis.aiSuggestions?.improvedSummary && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-6"
                >

                    <div className="mb-4 flex items-center gap-3">

                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10">
                            <WandSparkles className="size-5 text-amber-400" />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-white">
                                AI Improved Resume Summary
                            </h2>

                            <p className="text-[11px] text-zinc-500">
                                A suggested professional summary based on your
                                resume and target role.
                            </p>
                        </div>

                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">

                        <p className="text-xs leading-relaxed text-zinc-300">
                            {analysis.aiSuggestions.improvedSummary}
                        </p>

                    </div>

                </motion.div>
            )}

        </div>
    );
}