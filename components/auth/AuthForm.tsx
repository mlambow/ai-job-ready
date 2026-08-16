"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, AlertCircle, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Import both sign in and sign up functions from your firebase auth helper
import { signInWithEmail, signUpWithEmail } from "@/lib/firebase/auth";
import { GoogleButton } from "@/components/auth/googleButton";
import { authErrorMessage } from "@/utils/authErrorMessage";
import RedirectingState from "@/components/auth/RedirectingState";

interface AuthFormProps {
    mode?: "signin" | "signup";
}

export function AuthForm({ mode = "signin" }: AuthFormProps) {
    const router = useRouter();
    const isSignUp = mode === "signup";

    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI State
    const [showPassword, setShowPassword] = useState(false);
    const [fullNameFocused, setFullNameFocused] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (isSuccess) {
        return <RedirectingState mode={authMode}/>;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!email || !password || (isSignUp && !fullName)) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            setError("");
            setLoading(true);

            if (isSignUp) {
                // Handle Sign Up
                const cleanEmail = email.replace(/\s+/g, '');
                await signUpWithEmail(fullName, cleanEmail, password);

                setAuthMode('signup')
                setIsSuccess(true);
                router.push("/dashboard");
            } else {
                // Handle Sign In
                await signInWithEmail(email, password);

                setAuthMode('signin')
                setIsSuccess(true)
                router.push("/dashboard");
            }
        } catch (err) {
            setError(authErrorMessage(err));
            setLoading(false);
        }
    }

    return (
        <div className="relative mx-auto w-full max-w-[390px] overflow-hidden rounded-[40px] border border-zinc-800/80 bg-zinc-900/90 p-7 shadow-2xl backdrop-blur-2xl">
            {/* Ambient Warm Amber Radial Glows */}
            <div className="pointer-events-none absolute -top-24 -left-20 size-60 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-20 size-60 rounded-full bg-amber-400/10 blur-3xl" />

            {/* Header & Logo */}
            <div className="relative mb-7 text-center">
                <div className="relative mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-400 shadow-sm">
                    <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-md" />
                    <Sparkles className="relative size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                    {isSignUp ? "Create account" : "Welcome back"}
                </h1>
                <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-400">
                    {isSignUp
                        ? "Sign up to start refining your resume"
                        : "Sign in to continue refining your resume"}
                </p>
            </div>

            <div className="relative space-y-5">
                {/* Social Login */}
                <GoogleButton
                    onSuccess={() => router.push("/dashboard")}
                    onError={(err) => setError(authErrorMessage(err))}
                />

                {/* Divider */}
                <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800" />
                    </div>
                    <span className="relative bg-zinc-900 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        or with email
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name Input (Sign Up Mode Only) */}
                    {isSignUp && (
                        <div className="space-y-1">
                            <label
                                htmlFor="fullName"
                                className="ml-2 block text-[11px] font-medium tracking-wide text-zinc-400"
                            >
                                Full Name
                            </label>
                            <div
                                className={`group relative flex items-center rounded-full border bg-zinc-950/80 px-4 py-1 transition-all duration-200 ${
                                    fullNameFocused
                                        ? "border-amber-400/80 ring-2 ring-amber-400/20"
                                        : "border-zinc-800/80 hover:border-zinc-700"
                                }`}
                            >
                                <User className={`size-4 shrink-0 transition-colors ${fullNameFocused ? "text-amber-400" : "text-zinc-500"}`} />
                                <input
                                    id="fullName"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onFocus={() => setFullNameFocused(true)}
                                    onBlur={() => setFullNameFocused(false)}
                                    placeholder="John Doe"
                                    required={isSignUp}
                                    disabled={loading}
                                    className="w-full bg-transparent px-3 py-2.5 text-xs font-medium placeholder-zinc-600 focus:outline-none disabled:opacity-50"
                                />
                            </div>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-1">
                        <label
                            htmlFor="email"
                            className="ml-2 block text-[11px] font-medium tracking-wide text-zinc-400"
                        >
                            Email address
                        </label>
                        <div
                            className={`group relative flex items-center rounded-full border bg-zinc-950/80 px-4 py-1 transition-all duration-200 ${
                                emailFocused
                                    ? "border-amber-400/80 ring-2 ring-amber-400/20"
                                    : "border-zinc-800/80 hover:border-zinc-700"
                            }`}
                        >
                            <Mail className={`size-4 shrink-0 transition-colors ${emailFocused ? "text-amber-400" : "text-zinc-500"}`} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                placeholder="you@example.com"
                                required
                                disabled={loading}
                                className="w-full bg-transparent px-3 py-2.5 text-xs font-medium  placeholder-zinc-600 focus:outline-none disabled:opacity-50"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between px-2">
                            <label
                                htmlFor="password"
                                className="block text-[11px] font-medium tracking-wide text-zinc-400"
                            >
                                Password
                            </label>
                            {!isSignUp && (
                                <Link
                                    href="/forgot-password"
                                    className="text-xs font-semibold text-amber-400 transition-colors hover:text-amber-300 focus:outline-none"
                                >
                                    Forgot Password?
                                </Link>
                            )}
                        </div>
                        <div
                            className={`group relative flex items-center rounded-full border bg-zinc-950/80 px-4 py-1 transition-all duration-200 ${
                                passwordFocused
                                    ? "border-amber-400/80 ring-2 ring-amber-400/20"
                                    : "border-zinc-800/80 hover:border-zinc-700"
                            }`}
                        >
                            <Lock className={`size-4 shrink-0 transition-colors ${passwordFocused ? "text-amber-400" : "text-zinc-500"}`} />
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                className="w-full bg-transparent px-3 py-2.5 text-xs font-medium  placeholder-zinc-600 focus:outline-none disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-zinc-500 transition-colors hover:text-zinc-300 focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Dynamic Error State */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -6, height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-400"
                            >
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                        whileHover={{ scale: loading ? 1 : 1.01 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="group relative mt-3 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-amber-400 px-4 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/10 transition-all duration-200 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-zinc-950 cursor-pointer disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="size-4 animate-spin text-zinc-950" />
                                <span>{isSignUp ? "Creating account..." : "Signing in..."}</span>
                            </>
                        ) : (
                            <span>{isSignUp ? "Create account" : "Sign in"}</span>
                        )}
                    </motion.button>
                </form>

                {/* Footer Route Navigation */}
                <p className="pt-1 text-center text-xs font-medium text-zinc-400">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <Link
                        href={isSignUp ? "/sign-in" : "/sign-up"}
                        className="font-bold text-amber-400 transition-colors hover:underline"
                    >
                        {isSignUp ? "Sign in" : "Create account"}
                    </Link>
                </p>
            </div>
        </div>
    );
}