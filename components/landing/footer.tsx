import {Sparkles} from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-zinc-800/80 bg-zinc-950">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs font-medium text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                <div className="flex items-center gap-2 text-white font-bold">
                    <div className="flex size-7 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-400">
                        <Sparkles className="size-4" />
                    </div>
                    AI Job Ready
                </div>

                <p>
                    Build a stronger resume. Apply with confidence.
                </p>
            </div>
        </footer>
    )
};