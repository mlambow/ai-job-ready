import Link from "next/link";
import {Sparkles} from "lucide-react";

export default function Navbar() {
    return (
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
            <Link
                href="/"
                className="flex items-center gap-2 text-lg font-bold tracking-tight"
            >
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Sparkles className="size-5" />
                </div>

                <span>AI Job Ready</span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
                <a
                    href="#features"
                    className="transition-colors hover:text-foreground"
                >
                    Features
                </a>

                <a
                    href="#how-it-works"
                    className="transition-colors hover:text-foreground"
                >
                    How it works
                </a>
            </nav>

            <div className="flex items-center gap-3">
                <Link
                    href="/sign-in"
                    className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                    Sign in
                </Link>

                <Link
                    href="/sign-up"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
                >
                    Get started
                </Link>
            </div>
        </header>
    )
}