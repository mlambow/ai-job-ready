import { motion } from "framer-motion";
import {AlertTriangle, Building2, CheckCircle2, ChevronDown, Printer, RotateCcw, Sparkles, XCircle, X} from "lucide-react";
import {ScoreGauge} from "@/components/analysis/ScoreGauge";
import {useRef, useState} from "react";
import {ServerResumeAnalysis} from "@/utils/types";

interface ResumeAnalysisResultsProps {
    analysis: ServerResumeAnalysis;
    onReanalyze?: () => void;
}

export function ResumeAnalysisResults({
                                          analysis,
                                          onReanalyze,
                                      }: ResumeAnalysisResultsProps) {
    const [keywordTab, setKeywordTab] = useState<"matched" | "missing">("matched");
    const [expandedStrengths, setExpandedStrengths] = useState(true);
    const [expandedImprovements, setExpandedImprovements] = useState(true);

    const printRef = useRef<HTMLDivElement>(null);

    const atsScore = analysis.atsScore ?? 0;
    const matchScore = analysis.jobMatchScore ?? 0;
    const matchedKeywords = analysis.keywordAnalysis?.matched ?? [];
    const missingKeywords = analysis.keywordAnalysis?.missing ?? [];

    // Printable PDF Export Handler
    const handlePrint = () => {
        window.print();
    };

    return (
        <div ref={printRef} className="w-full space-y-6 text-zinc-100 print:bg-white print:text-zinc-900 print:p-0">

            {/* Printable CSS overrides */}
            <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
          .print-border { border: 1px solid #e4e4e7 !important; background: transparent !important; }
          .print-text { color: #18181b !important; }
          .print-subtext { color: #52525b !important; }
        }
      `}</style>

            {/* Top Banner / Header Info */}
            <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800/80 bg-zinc-950/90 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between print:rounded-none print:border-b print:p-0 print:pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 print:border-amber-600 print:text-amber-800">
                          <Sparkles className="size-3 no-print" /> ATS Analysis Report
                        </span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl print:text-zinc-900">
                        {analysis.jobTitle}
                    </h1>
                    {analysis.companyName && (
                        <p className="flex items-center gap-1.5 text-xs text-zinc-400 print:text-zinc-600">
                            <Building2 className="size-3.5 no-print" />
                            Target Company: {analysis.companyName}
                        </p>
                    )}
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 no-print">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
                    >
                        <Printer className="size-3.5" />
                        Export PDF / Print
                    </button>

                    {onReanalyze && (
                        <button
                            type="button"
                            onClick={onReanalyze}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                        >
                            <RotateCcw className="size-3.5" />
                            Re-analyze
                        </button>
                    )}
                </div>
            </div>

            {/* Gauges Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl print:border-zinc-300 print:bg-white"
                >
                    <ScoreGauge
                        score={atsScore}
                        label="ATS Compatibility"
                        sublabel="Formatting & readability optimization score"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex items-center justify-center rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl print:border-zinc-300 print:bg-white"
                >
                    <ScoreGauge
                        score={matchScore}
                        label="Job Match Score"
                        sublabel="Relevance to targeted skills and experience"
                    />
                </motion.div>
            </div>

            {/* Summary Box */}
            {analysis.summary && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl print:border-zinc-300 print:bg-white"
                >
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400 print:text-amber-800">
                        Executive Summary
                    </h2>
                    <p className="text-xs leading-relaxed text-zinc-300 print:text-zinc-800">
                        {analysis.summary}
                    </p>
                </motion.div>
            )}

            {/* Keywords Breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl print:border-zinc-300 print:bg-white"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-100 print:text-zinc-900">
                        Keyword Analysis
                    </h2>

                    {/* Screen Tabs */}
                    <div className="flex rounded-xl bg-zinc-900/80 p-1 border border-zinc-800 no-print">
                        <button
                            type="button"
                            onClick={() => setKeywordTab("matched")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                                keywordTab === "matched"
                                    ? "bg-amber-400 text-zinc-950 shadow"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            <CheckCircle2 className="size-3.5" /> Matched ({matchedKeywords.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setKeywordTab("missing")}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                                keywordTab === "missing"
                                    ? "bg-rose-500 text-white shadow"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            <X className="size-3.5" /> Missing ({missingKeywords.length})
                        </button>
                    </div>
                </div>

                {/* Screen Interactive view vs Print Full view */}
                <div className="no-print flex flex-wrap gap-2">
                    {keywordTab === "matched" ? (
                        matchedKeywords.map((kw, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="size-3.5" /> {kw}
              </span>
                        ))
                    ) : (
                        missingKeywords.map((kw, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400">
                <XCircle className="size-3.5" /> {kw}
              </span>
                        ))
                    )}
                </div>

                {/* Print Layout: Shows both matched and missing keywords side by side */}
                <div className="hidden print:grid print:grid-cols-2 print:gap-4">
                    <div>
                        <h4 className="mb-2 text-xs font-bold text-emerald-700">Matched ({matchedKeywords.length})</h4>
                        <div className="flex flex-wrap gap-1">
                            {matchedKeywords.map((kw, idx) => (
                                <span key={idx} className="text-[10px] border border-emerald-300 bg-emerald-50 px-2 py-0.5 rounded text-emerald-800">
                                  ✓ {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="mb-2 text-xs font-bold text-rose-700">Missing ({missingKeywords.length})</h4>
                        <div className="flex flex-wrap gap-1">
                            {missingKeywords.map((kw, idx) => (
                                <span key={idx} className="text-[10px] border border-rose-300 bg-rose-50 px-2 py-0.5 rounded text-rose-800">
                                  ✕ {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Accordion Lists */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Strengths */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl print:border-zinc-300 print:bg-white"
                >
                    <button
                        type="button"
                        onClick={() => setExpandedStrengths(!expandedStrengths)}
                        className="flex w-full items-center justify-between no-print"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4 text-emerald-400" />
                            <h2 className="text-sm font-semibold text-zinc-100">
                                Key Strengths ({analysis.strengths.length})
                            </h2>
                        </div>
                        <ChevronDown className={`size-4 text-zinc-400 transition-transform ${expandedStrengths ? "rotate-180" : ""}`} />
                    </button>

                    <h2 className="hidden print:block text-sm font-semibold text-zinc-900 mb-2">Key Strengths</h2>

                    {(expandedStrengths || typeof window === "undefined") && (
                        <ul className="mt-4 space-y-3 print:mt-2">
                            {analysis.strengths.map((strength, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300 print:border-zinc-200 print:bg-zinc-50 print:text-zinc-900">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] text-emerald-400 print:bg-emerald-100 print:text-emerald-800">
                    ✓
                  </span>
                                    {strength}
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>

                {/* Improvements */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl print:border-zinc-300 print:bg-white"
                >
                    <button
                        type="button"
                        onClick={() => setExpandedImprovements(!expandedImprovements)}
                        className="flex w-full items-center justify-between no-print"
                    >
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="size-4 text-amber-400" />
                            <h2 className="text-sm font-semibold text-zinc-100">
                                Areas for Improvement ({analysis.improvements.length})
                            </h2>
                        </div>
                        <ChevronDown className={`size-4 text-zinc-400 transition-transform ${expandedImprovements ? "rotate-180" : ""}`} />
                    </button>

                    <h2 className="hidden print:block text-sm font-semibold text-zinc-900 mb-2">Areas for Improvement</h2>

                    {(expandedImprovements || typeof window === "undefined") && (
                        <ul className="mt-4 space-y-3 print:mt-2">
                            {analysis.improvements.map((improvement, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 rounded-2xl border border-zinc-800/50 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300 print:border-zinc-200 print:bg-zinc-50 print:text-zinc-900">
                                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] text-amber-400 print:bg-amber-100 print:text-amber-800">
                                    !
                                  </span>
                                    {improvement}
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </div>
        </div>
    );
}