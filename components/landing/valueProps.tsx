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
        <section className="border-y border-border bg-muted/20">
            <div className="mx-auto grid max-w-7xl gap-px px-6 sm:grid-cols-3 lg:px-8">
                <ValueItem
                    title="ATS-focused"
                    description="Optimize for the systems screening your application."
                />

                <ValueItem
                    title="Job-specific"
                    description="Every recommendation is based on the role you want."
                />

                <ValueItem
                    title="Actionable"
                    description="Get specific changes instead of generic resume advice."
                />
            </div>
        </section>
    )
}