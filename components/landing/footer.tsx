import {Sparkles} from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
                <div className="flex items-center gap-2 font-medium text-foreground">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Sparkles className="size-4" />
                    </div>
                    AI Job Ready
                </div>

                <p>
                    Build a stronger resume. Apply with confidence.
                </p>
            </div>
        </footer>
    )
};