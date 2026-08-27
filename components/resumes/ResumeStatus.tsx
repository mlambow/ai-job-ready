import {CheckCircle2, CircleAlert, Clock3, Loader2, type LucideIcon,} from "lucide-react";
import { AnalysisStatus, ResumeStatusType } from "@/utils/types";

interface ResumeStatusProps {
    resumeStatus: ResumeStatusType;
    analysisStatus: AnalysisStatus | null;
}

const resumeStatusConfig: Record<
    ResumeStatusType,
    {
        label: string;
        className: string;
        icon: LucideIcon;
    }
> = {
    uploaded: {
        label: "Uploaded",
        className: "border-zinc-700 bg-zinc-800/80 text-zinc-300",
        icon: Clock3,
    },

    processing: {
        label: "Processing",
        className: "border-amber-400/30 bg-amber-400/10 text-amber-400",
        icon: Loader2,
    },

    ready: {
        label: "Ready",
        className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        icon: CheckCircle2,
    },

    failed: {
        label: "Failed",
        className: "border-rose-500/30 bg-rose-500/10 text-rose-400",
        icon: CircleAlert,
    },
};

export function ResumeStatus({
                                 resumeStatus,
                                 analysisStatus,
                             }: ResumeStatusProps) {

    const config = resumeStatusConfig[resumeStatus];

    let Icon = config.icon;
    let className = config.className;
    let label = config.label;

    // Analysis is currently processing
    if (analysisStatus === "processing") {
        label = "Analyzing";
        Icon = Loader2;
        className = "border-violet-400/30 bg-violet-400/10 text-violet-400";
    }

    // Analysis completed
    if (analysisStatus === "completed") {
        label = "Complete";
        Icon = CheckCircle2;
        className = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    // Analysis failed
    if (analysisStatus === "failed") {
        label = "Failed";
        Icon = CircleAlert;
        className =
            "border-rose-500/30 bg-rose-500/10 text-rose-400";
    }

    const isProcessing =
        resumeStatus === "processing" ||
        analysisStatus === "processing";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${className}`}
        >
            <Icon
                className={`size-3 shrink-0 ${
                    isProcessing ? "animate-spin" : ""
                }`}
            />

            {label}
        </span>
    );
}