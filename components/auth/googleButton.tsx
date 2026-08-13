'use client'

import {useRouter} from "next/navigation";
import {useState} from "react";
import {signInWithGoogle} from "@/lib/firebase/auth";
import {Loader2} from "lucide-react";
import GoogleIcon from './googleIcon'

export default function GoogleButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    async function handleGoogleSignIn() {
        try {
            setLoading(true);
            await signInWithGoogle()
            router.push("/dashboard")
        }catch (error) {
            console.error('Google sign in failed', error);
        }finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
            {loading ? (
                <Loader2 className="size-5 animate-spin" />
            ) : (
                <GoogleIcon />
            )}

            {loading ? "Signing in..." : "Continue with Google"}
        </button>
    );
}