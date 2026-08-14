import Link from "next/link";
import {Sparkles} from "lucide-react";

export default function Navbar() {
    return (
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
            <Link
                href="/"
                className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
            >
                <div className="relative flex size-9 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shadow-sm">
                    <div className="absolute inset-0 rounded-xl bg-amber-400/10 blur-md" />
                    <Sparkles className="relative size-5" />
                </div>

                <span className="font-bold text-white">AI Job Ready</span>
            </Link>

            <nav className="hidden items-center gap-8 text-xs font-semibold text-zinc-400 md:flex">
                <a
                    href="#features"
                    className="transition-colors hover:text-white"
                >
                    Features
                </a>

                <a
                    href="#how-it-works"
                    className="transition-colors hover:text-white"
                >
                    How it works
                </a>
            </nav>

            <div className="flex items-center gap-4">
                <Link
                    href="/sign-in"
                    className="hidden text-xs font-semibold text-zinc-300 transition-colors hover:text-white sm:block"
                >
                    Sign in
                </Link>

                <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-300 active:scale-[0.98]"
                >
                    Get started
                </Link>
            </div>
        </header>
    )
}