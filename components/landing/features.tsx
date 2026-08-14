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
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                    Everything you need
                </p>

                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Know exactly what to change.
                </h2>

                <p className="mt-4 text-base leading-relaxed text-zinc-400">
                    Stop guessing why your applications aren't getting responses. Get
                    practical feedback tailored to the target role.
                </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
                {features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                        <div
                            key={feature.title}
                            className="group rounded-[32px] border border-zinc-800/80 bg-zinc-900/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-zinc-900/90 hover:shadow-2xl hover:shadow-amber-500/5"
                        >
                            <div className="flex size-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400 transition-colors group-hover:bg-amber-400 group-hover:text-zinc-950">
                                <Icon className="size-6" />
                            </div>

                            <h3 className="mt-6 text-lg font-bold text-white">
                                {feature.title}
                            </h3>

                            <p className="mt-2.5 text-xs leading-relaxed text-zinc-400">
                                {feature.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    )
}