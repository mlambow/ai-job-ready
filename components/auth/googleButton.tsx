"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase/auth";
import GoogleIcon from "@/components/auth/googleIcon";

interface GoogleButtonProps {
    onSuccess: () => void;
    onError: (error: unknown) => void;
}

export function GoogleButton({onSuccess, onError}: GoogleButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        try {
            setLoading(true);

            await signInWithGoogle();

            onSuccess();
        } catch (error) {
            onError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl hover:border hover:border-border cursor-pointer bg-background text-sm font-semibold transition-all hover:border-foreground/20 hover:bg-muted/50 active:scale-[0.99] disabled:opacity-60"
        >
            {loading ? (
                <Loader2 className="size-5 animate-spin" />
            ) : (
                <GoogleIcon />
            )}

            {loading
                ? "Connecting..."
                : "Continue with Google"}
        </button>
    );
}