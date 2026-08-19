import {CheckCircle2, CircleAlert, Clock3, Loader2, type LucideIcon,} from "lucide-react";

type ResumeStatusType = "uploaded" | "processing" | "completed" | "failed";

interface ResumeStatusProps {
    status: ResumeStatusType;
}

const statusConfig: Record<
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
    completed: {
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

export function ResumeStatus({ status }: ResumeStatusProps) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-colors ${config.className}`}
        >
      <Icon
          className={`size-3 shrink-0 ${
              status === "processing" ? "animate-spin" : ""
          }`}
      />
            {config.label}
    </span>
    );
}