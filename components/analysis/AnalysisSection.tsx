import {useState} from "react";
import {ChevronDown} from "lucide-react";
import {AnimatePresence, motion} from "framer-motion";

interface SectionProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export default function AnalysisSection({title, icon, children, defaultOpen = true}: SectionProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-6 backdrop-blur-xl print:border-zinc-300 print:bg-white">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between text-left no-print"
            >
                <div className="flex items-center gap-2.5">
                    {icon}

                    <h2 className="text-sm font-semibold text-white">
                        {title}
                    </h2>
                </div>

                <ChevronDown
                    className={`size-4 text-zinc-400 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            <div className="mb-4 hidden items-center gap-2 print:flex">
                {icon}

                <h2 className="text-sm font-semibold text-zinc-900">
                    {title}
                </h2>
            </div>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{
                            height: 0,
                            opacity: 0,
                        }}
                        animate={{
                            height: "auto",
                            opacity: 1,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        className="overflow-hidden no-print"
                    >
                        <div className="mt-5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="hidden print:block">
                {children}
            </div>
        </div>
    );
}