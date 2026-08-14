import {ArrowRight, Sparkles} from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="mx-auto max-w-5xl px-6 py-24 text-center lg:px-8 lg:py-32">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-amber-400/20 bg-zinc-900 px-6 py-16 text-white shadow-2xl sm:px-12">
                <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                        <Sparkles className="size-6" />
                    </div>

                    <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Stop guessing what your resume is missing.
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm leading-relaxed text-zinc-400">
                        Upload your resume, add the job description, and receive an instant breakdown for making your application stand out.
                    </p>

                    <Link
                        href="/sign-up"
                        className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-300 active:scale-[0.98]"
                    >
                        Analyze my resume
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}