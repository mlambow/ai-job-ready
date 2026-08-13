import {ArrowRight, Sparkles} from "lucide-react";
import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className="mx-auto max-w-5xl px-6 py-24 text-center lg:px-8 lg:py-32">
            <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary px-6 py-16 text-primary-foreground shadow-2xl shadow-primary/20 sm:px-12">
                <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

                <div className="relative">
                    <Sparkles className="mx-auto size-8" />

                    <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                        Stop guessing what your resume is missing.
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg">
                        Upload your resume, add the job description, and get a clear plan
                        for making your application stronger.
                    </p>

                    <Link
                        href="/sign-up"
                        className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 font-semibold text-black shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white/90"
                    >
                        Analyze my resume
                        <ArrowRight className="size-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}