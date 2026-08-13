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
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                        <Sparkles className="size-4" />
                        AI-powered resume optimization
                    </div>

                    <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                        Make your resume{" "}
                        <span className="text-primary">match the job.</span>
                    </h1>

                    <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                        Upload your resume, paste the job description, and get a
                        personalized AI analysis that shows you exactly what to improve
                        before you apply.
                    </p>

                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <Link
                            href="/sign-up"
                            className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-white/90 hover:text-black"
                        >
                            Analyze my resume
                            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <a
                            href="#how-it-works"
                            className="inline-flex h-13 items-center justify-center rounded-full border border-border bg-background/80 px-7 text-base font-semibold transition-colors hover:bg-muted"
                        >
                            See how it works
                        </a>
                    </div>

                    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Check className="size-4 text-emerald-500" />
                            PDF & DOCX
                          </span>

                        <span className="flex items-center gap-2">
                            <Check className="size-4 text-emerald-500" />
                            Job-specific analysis
                          </span>

                        <span className="flex items-center gap-2">
                            <Check className="size-4 text-emerald-500" />
                            AI-powered suggestions
                          </span>
                    </div>
                </div>

                {/* Product preview */}
                <div className="relative">
                    <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />

                    <div className="relative rounded-[2rem] border border-border/80 bg-card p-3 shadow-2xl shadow-primary/10">
                        <div className="rounded-[1.4rem] border border-border bg-background p-5 sm:p-7">
                            {/* Window header */}
                            <div className="mb-7 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <FileText className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">Resume analysis</p>
                                        <p className="text-xs text-muted-foreground">
                                            Software Engineer · Acme Inc.
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    Strong match
                                </span>
                            </div>

                            {/* Score */}
                            <div className="rounded-2xl border border-border bg-muted/30 p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Resume match
                                        </p>

                                        <p className="mt-1 text-4xl font-bold tracking-tight">
                                            87%
                                        </p>
                                    </div>

                                    <div className="relative flex size-20 items-center justify-center">
                                        <svg
                                            className="size-20 -rotate-90"
                                            viewBox="0 0 36 36"
                                        >
                                            <path
                                                className="text-muted"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                fill="none"
                                                d="M18 2.0845
                                                     a 15.9155 15.9155 0 0 1 0 31.831
                                                     a 15.9155 15.9155 0 0 1 0-31.831"
                                            />

                                            <path
                                                className="text-primary"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                fill="none"
                                                strokeDasharray="87, 100"
                                                d="M18 2.0845
                                                     a 15.9155 15.9155 0 0 1 0 31.831
                                                     a 15.9155 15.9155 0 0 1 0-31.831"
                                            />
                                        </svg>

                                        <span className="absolute text-xs font-bold">87</span>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-3 gap-3">
                                    <Score label="ATS" value="92%" />
                                    <Score label="Keywords" value="81%" />
                                    <Score label="Skills" value="89%" />
                                </div>
                            </div>

                            {/* Feedback */}
                            <div className="mt-5 space-y-3">
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

                            <div className="mt-5 flex items-center justify-between rounded-xl bg-primary/5 px-4 py-3">
                                  <span className="text-sm font-medium">
                                    Ready to improve your resume?
                                  </span>
                                <ArrowRight className="size-4 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}