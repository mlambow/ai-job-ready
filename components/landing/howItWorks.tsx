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
            className="border-y border-border bg-muted/20"
        >
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
                <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                    <div className="lg:sticky lg:top-10">
                        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                            How it works
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                            One resume.
                            <br />
                            One job.
                            <br />
                            One better application.
                        </h2>

                        <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
                            Give the AI your resume and the job description. We'll compare
                            them and turn the results into practical improvements.
                        </p>

                        <Link
                            href="/sign-up"
                            className="group mt-8 h-12 inline-flex items-center gap-2 font-semibold text-primary bg-white px-7 rounded-full text-black"
                        >
                            Get started
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="space-y-5">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="flex gap-5 rounded-3xl border border-border bg-card p-6 sm:p-8"
                            >
                                  <span className="text-sm font-bold text-primary">
                                    {step.number}
                                  </span>

                                <div>
                                    <h3 className="text-xl font-semibold">{step.title}</h3>

                                    <p className="mt-2 max-w-xl leading-7 text-muted-foreground">
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