// MetricCard.tsx
import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    label: string;
    value: string | number;
    subtext: string;
    icon: LucideIcon;
    highlightColor?: string;
}

export function MetricCard({ label, value, subtext, icon: Icon }: MetricCardProps) {
    return (
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-amber-400/30">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</span>
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-2 text-amber-400">
                    <Icon className="size-4" />
                </div>
            </div>
            <div className="text-3xl font-extrabold text-white">{value}</div>
            <p className="text-xs text-zinc-500 mt-1">{subtext}</p>
        </div>
    );
}