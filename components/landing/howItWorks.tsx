import Link from "next/link";
import {ArrowRight} from "lucide-react";

const steps = [
    {
        number: "01",
        title: "Upload your resume",
        description:
            "Upload your existing resume as a PDF or DOCX. We take care of the rest.",
    },
    {
        number: "02",
        title: "Add the job description",
        description: "Paste the job you're applying for so the analysis is tailored to the role.",
    },
    {
        number: "03",
        title: "Get your personalized report",
        description: "See your score, missing keywords, weaknesses, and exactly what to improve.",
    },
];

export default function HowItWorks() {
    return(
        <section
            id="how-it-works"
            className="border-y border-zinc-800/80 bg-zinc-900/30"
        >
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
                <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <div className="lg:sticky lg:top-10">
                        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                            How it works
                        </p>

                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
                            One resume.
                            <br />
                            One job.
                            <br />
                            One better application.
                        </h2>

                        <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-400">
                            Provide your resume alongside the target job description. We'll
                            analyze both and output clear, step-by-step improvements.
                        </p>

                        <Link
                            href="/sign-up"
                            className="group mt-8 inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                        >
                            Get started
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="flex gap-5 rounded-[28px] border border-zinc-800/80 bg-zinc-900/70 p-6 sm:p-8 backdrop-blur-sm"
                            >
                                  <span className="text-xs font-extrabold text-amber-400">
                                    {step.number}
                                  </span>

                                <div>
                                    <h3 className="text-base font-bold text-white">{step.title}</h3>

                                    <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}