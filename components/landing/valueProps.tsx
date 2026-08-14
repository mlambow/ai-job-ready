function ValueItem({title, description}: { title: string; description: string;}) {
    return (
        <div className="px-6 py-7 text-center sm:px-8">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

export default function  ValueProps() {
    return (
        <section className="border-y border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md">
            <div className="mx-auto grid max-w-7xl gap-px px-6 sm:grid-cols-3 lg:px-8">
                <ValueItem
                    title="ATS-focused"
                    description="Optimize for the automated systems screening your application."
                />

                <ValueItem
                    title="Job-specific"
                    description="Every recommendation is customized to the exact role you want."
                />

                <ValueItem
                    title="Actionable"
                    description="Get clear, tailored rewrite instructions instead of generic advice."
                />
            </div>
        </section>
    )
}