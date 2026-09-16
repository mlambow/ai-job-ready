import {motion} from "framer-motion";
import ScoreGauge from "@/components/analysis/ScoreGauge";

interface ScoreCardProps {
    title: string;
    score: number;
    description: string;
    delay?: number;
}

export default function ScoreCard({title, score, description, delay = 0}: ScoreCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="flex items-center justify-center rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl print:border-zinc-300 print:bg-white"
        >
            <ScoreGauge
                score={score}
                label={title}
                sublabel={description}
            />
        </motion.div>
    );
}