import {FileSearch, Target, WandSparkles} from "lucide-react";

const features = [
    {
        icon: Target,
        title: "ATS & match score",
        description: "See how closely your resume matches the job before you apply.",
    },
    {
        icon: FileSearch,
        title: "Find what's missing",
        description: "Identify important keywords, skills, and experience gaps.",
    },
    {
        icon: WandSparkles,
        title: "Improve your resume",
        description:
            "Get specific suggestions and stronger versions of your content.",
    },
];

export default function Features() {
    return (
        <section
            id="features"
            className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32"
        >
            <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                    Everything you need
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Know exactly what to change.
                </h2>

                <p className="mt-4 text-lg leading-8 text-muted-foreground">
                    Stop guessing why your applications aren't getting through. Get
                    clear, practical feedback based on the job you're actually
                    applying for.
                </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
                {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <div
                            key={feature.title}
                            className="group rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                        >
                            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                <Icon className="size-6" />
                            </div>

                            <h3 className="mt-6 text-xl font-semibold">
                                {feature.title}
                            </h3>

                            <p className="mt-3 leading-7 text-muted-foreground">
                                {feature.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    )
}