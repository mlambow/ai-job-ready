import {CheckCircle2, Loader2, LogIn} from "lucide-react";

interface RedirectingStateProps {
    mode: "signup" | "signin";
}

export default function RedirectingState({mode}: RedirectingStateProps) {
    const isNewUser = mode === "signup";

    return (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="relative mb-4 flex size-20 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400">
                <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md animate-pulse" />
                {isNewUser ? (
                    <CheckCircle2 className="relative size-20 text-amber-400" />
                    ) : (
                    <LogIn className='relative size-14 text-amber-400' />
                )}
            </div>

            <h3 className="text-lg font-bold text-white">
                {isNewUser ? 'Account created successfully!' : 'Welcome back!'}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
                {isNewUser ? 'Setting up your workspace, redirecting you now...' : 'Authenticating your session, taking you to dashboard...'}
            </p>

            <div className="mt-6 flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-5 py-3.5 text-xs font-semibold text-zinc-300 shadow-inner">
                <Loader2 className="size-3.5 animate-spin text-amber-400" />
                <span>{isNewUser ? "Loading workspace" : "Entering dashboard"}</span>
            </div>
        </div>
    );
}