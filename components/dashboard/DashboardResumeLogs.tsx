import React from 'react';
import {
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    BarChart2,
    Sparkles,
    Upload
} from 'lucide-react';

export interface ResumeAuditLog {
    id: string;
    fileName: string;
    uploadedAt: string;
    status: 'ready' | 'completed' | 'processing' | 'failed';
    atsScore?: number;
    matchPercentage?: number;
    targetRole?: string;
    version: string;
}

interface DashboardResumeLogsProps {
    resumes?: ResumeAuditLog[];
    onSelectResume: (id: string) => void;
    onViewAll?: () => void;
    onUpload?: () => void;
}

export const DashboardResumeLogs: React.FC<DashboardResumeLogsProps> = ({
                                                                            resumes = [],
                                                                            onSelectResume,
                                                                            onViewAll,
                                                                            onUpload,
                                                                        }) => {
    const getStatusBadge = (status: ResumeAuditLog['status']) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                    </span>
                );
            case 'ready':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/10">
                        <Sparkles className="w-3.5 h-3.5" />
                        Ready
                    </span>
                );
            case 'processing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        Analyzing
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Failed
                    </span>
                );
        }
    };

    const getScoreColor = (score?: number) => {
        if (!score) return 'text-slate-400 border-slate-700 bg-slate-800/50';
        if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
        if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    };

    const hasResumes = resumes && resumes.length > 0;

    return (
        <div className="w-full space-y-4 mt-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-400" />
                        Resume Audit History Logs
                    </h3>
                    <p className="text-xs text-slate-400">
                        Recent resume scan evaluations and status snapshots
                    </p>
                </div>
                {hasResumes && onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 hover:cursor-pointer"
                    >
                        View Full List
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Resume Content or Empty State */}
            {!hasResumes ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-12 text-center backdrop-blur-xl">
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/80 text-zinc-400 mb-4">
                        <FileText className="size-6 text-zinc-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-zinc-200">No resumes found</h4>
                    <p className="mt-1 text-xs text-zinc-400 max-w-sm">
                        You haven't uploaded any resumes yet. Upload a resume to get ATS evaluation scores and job matching insights.
                    </p>
                    {onUpload && (
                        <button
                            onClick={onUpload}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all cursor-pointer"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Resume
                        </button>
                    )}
                </div>
            ) : (
                /* 2-in-a-Row Grid Audit Log */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumes.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onSelectResume(item.id)}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-zinc-900/90 hover:shadow-xl hover:shadow-amber-500/5 cursor-pointer"
                        >
                            {/* Hover Accent Glow */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/0 to-transparent transition-opacity duration-300 group-hover:via-amber-400/40" />

                            {/* Top Bar: Icon, Info & Status Badge */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/60 text-zinc-400 transition-colors duration-200 group-hover:border-amber-500/30 group-hover:bg-amber-400/10 group-hover:text-amber-400">
                                        <FileText className="size-5" />
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <h4 className="truncate text-sm font-semibold tracking-tight text-zinc-100 transition-colors group-hover:text-amber-300">
                                            {item.fileName}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-400">
                                            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-zinc-300">
                                                v{item.version}
                                            </span>
                                            <span className="size-1 rounded-full bg-zinc-700" />
                                            <span>{item.uploadedAt}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0">{getStatusBadge(item.status)}</div>
                            </div>

                            {/* Target Role Tag */}
                            {item.targetRole && (
                                <div className="my-3 flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-400">
                                    <span className="text-zinc-400 font-normal">Targeting</span>
                                    <span className="truncate font-semibold text-zinc-200">{item.targetRole}</span>
                                </div>
                            )}

                            {/* Bottom Audit Metrics */}
                            <div className="mt-2 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-zinc-400">ATS Score</span>
                                        <span className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold ${getScoreColor(item.atsScore)}`}>
                                            {item.atsScore !== undefined ? `${item.atsScore}%` : 'Pending'}
                                        </span>
                                    </div>

                                    {item.matchPercentage !== undefined && (
                                        <div className="flex items-center gap-1 text-zinc-400">
                                            <span className="gap-3">Match:</span>
                                            <span className="font-semibold text-zinc-200">{item.matchPercentage}%</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex size-7 items-center justify-center rounded-lg text-zinc-400 transition-colors duration-200 group-hover:bg-zinc-800 group-hover:text-zinc-100">
                                    <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};