"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import {
    signInWithGoogle,
    signUpWithEmail,
} from "@/lib/firebase/auth";
import GoogleIcon from "@/components/auth/googleIcon";
import {authErrorMessage} from "@/utils/authErrorMessage";

export function SignUpForm() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            setError("");
            setLoading(true);

            await signUpWithEmail(name, email, password);

            router.push("/dashboard");
        } catch (error) {
            console.error(error);

            setError(authErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        try {
            setError("");
            setGoogleLoading(true);

            await signInWithGoogle();

            router.push("/dashboard");
        } catch (error) {
            console.error(error);

            setError(authErrorMessage(error));
        } finally {
            setGoogleLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="mb-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Sparkles className="size-6" />
                </div>

                <h1 className="mt-6 text-3xl font-bold tracking-tight">
                    Create your account
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Start building stronger, job-ready resumes.
                </p>
            </div>

            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-background font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
                {googleLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    <GoogleIcon />
                )}

                {googleLoading ? "Creating account..." : "Continue with Google"}
            </button>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium"
                    >
                        Name
                    </label>

                    <input
                        id="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="John Doe"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium"
                    >
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium"
                    >
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="At least 8 characters"
                        className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {error && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading && <Loader2 className="size-5 animate-spin" />}
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/sign-in"
                    className="font-semibold text-primary hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}