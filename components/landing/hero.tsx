import {ArrowRight, Check, FileText, Sparkles} from "lucide-react";
import Link from "next/link";

function Feedback({type, title, description}: {
    type: "positive" | "warning"; title: string; description: string;
}) {
    return (
        <div className="flex gap-3 rounded-xl border border-border p-3">
            <div
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                    type === "positive"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                }`}
            >
                {type === "positive" ? (
                    <Check className="size-3" />
                ) : (
                    <span className="text-xs font-bold">!</span>
                )}
            </div>

            <div className="min-w-0">
                <p className="text-xs font-semibold">{title}</p>
                <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Score({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-border bg-background p-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-bold">{value}</p>
        </div>
    );
}

export default function Hero() {
    return (
        <section className="mx-auto max-w-7xl px-6 pb-20 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
            <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
                <div>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-xs font-semibold text-amber-400">
                        <Sparkles className="size-3.5" />
                        AI-powered resume optimization
                    </div>

                    <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl lg:text-7xl">
                        Make your resume{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">
                        match the job.
                      </span>
                    </h1>

                    <p className="mt-7 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                        Upload your resume, paste the job description, and get a
                        personalized AI analysis that shows you exactly what to improve
                        before you apply.
                    </p>

                    <div className="mt-9 flex flex-col gap-3.5  sm:flex-row">
                        <Link
                            href="/sign-up"
                            className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-300 active:scale-[0.98]"
                        >
                            Analyze my resume
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <a
                            href="#how-it-works"
                            className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 px-7 py-3.5 text-xs font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
                        >
                            See how it works
                        </a>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-400">
                      <span className="flex items-center gap-2">
                        <Check className="size-4 text-emerald-400" />
                        PDF & DOCX
                      </span>

                                <span className="flex items-center gap-2">
                        <Check className="size-4 text-emerald-400" />
                        Job-specific analysis
                      </span>

                                <span className="flex items-center gap-2">
                        <Check className="size-4 text-emerald-400" />
                        AI-powered suggestions
                      </span>
                    </div>
                </div>

                {/* Product Preview Card */}
                <div className="relative">
                    <div className="absolute -inset-4 rounded-2xl bg-amber-500/10 blur-3xl pointer-events-none" />

                    <div className="relative rounded-lg border border-zinc-800/80 bg-zinc-900/90 p-3 shadow-2xl backdrop-blur-xl">
                        <div className="rounded-[1.8rem] border border-zinc-800 bg-zinc-950/80 p-5 sm:p-7">

                            {/* Window Header */}
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400">
                                        <FileText className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-white">Resume analysis</p>
                                        <p className="text-[11px] font-medium text-zinc-400">
                                            Software Engineer · Acme Inc.
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
                                Strong match
                              </span>
                            </div>

                            {/* Main Score Widget */}
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-zinc-400">
                                            Resume match
                                        </p>

                                        <p className="mt-1 text-4xl font-extrabold tracking-tight text-white">
                                            87%
                                        </p>
                                    </div>

                                    <div className="relative flex size-20 items-center justify-center">
                                        <svg
                                            className="size-20 -rotate-90"
                                            viewBox="0 0 36 36"
                                        >
                                            <path
                                                className="text-zinc-800"
                                                stroke="currentColor"
                                                strokeWidth="3.5"
                                                fill="none"
                                                d="M18 2.0845
                                                 a 15.9155 15.9155 0 0 1 0 31.831
                                                 a 15.9155 15.9155 0 0 1 0-31.831"
                                            />

                                            <path
                                                className="text-amber-400"
                                                stroke="currentColor"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                                fill="none"
                                                strokeDasharray="87, 100"
                                                d="M18 2.0845
                                                 a 15.9155 15.9155 0 0 1 0 31.831
                                                 a 15.9155 15.9155 0 0 1 0-31.831"
                                            />
                                        </svg>

                                        <span className="absolute text-xs font-extrabold text-white">87</span>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-2.5">
                                    <Score label="ATS" value="92%" />
                                    <Score label="Keywords" value="81%" />
                                    <Score label="Skills" value="89%" />
                                </div>
                            </div>

                            {/* Feedback Stream */}
                            <div className="mt-4 space-y-2.5">
                                <Feedback
                                    type="positive"
                                    title="Strong experience match"
                                    description="Your project management experience aligns well."
                                />

                                <Feedback
                                    type="warning"
                                    title="3 important skills missing"
                                    description="TypeScript, Agile, and stakeholder management."
                                />

                                <Feedback
                                    type="warning"
                                    title="Improve your summary"
                                    description="Highlight your most relevant experience earlier."
                                />
                            </div>

                            <div className="mt-5 flex items-center justify-between rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-3">
                                  <span className="text-xs font-semibold text-amber-300">
                                    Ready to improve your resume?
                                  </span>

                                <ArrowRight className="size-4 text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}