import { motion } from "framer-motion";

interface ScoreGaugeProps {
    score: number;
    label: string;
    sublabel: string;
    size?: number;
    strokeWidth?: number;
}

export default function ScoreGauge({
                               score,
                               label,
                               sublabel,
                               size = 140,
                               strokeWidth = 10,
                           }: ScoreGaugeProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getStrokeColor = (val: number) => {
        if (val >= 80) return "stroke-emerald-400";
        if (val >= 60) return "stroke-amber-400";
        return "stroke-rose-400";
    };

    const getBadgeBg = (val: number) => {
        if (val >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
        if (val >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="rotate-[-90deg]">
                    {/* Track Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        className="stroke-zinc-800"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Animated Value Circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        className={`transition-all duration-1000 ease-out ${getStrokeColor(score)}`}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        strokeLinecap="round"
                        fill="transparent"
                    />
                </svg>

                {/* Center Text */}
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white">{score}%</span>
                    <span className={`mt-0.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getBadgeBg(score)}`}>
                    {score >= 80 ? "Excellent" : score >= 60 ? "Moderate" : "Needs Work"}
                  </span>
                </div>
            </div>

            <h3 className="mt-3 text-sm font-semibold text-zinc-200">{label}</h3>
            <p className="mt-0.5 text-[11px] text-zinc-500 max-w-[160px]">{sublabel}</p>
        </div>
    );
}