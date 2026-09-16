"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Plus, Menu, X, LogOut } from "lucide-react";
import { signOutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
    onUploadOpen: () => void;
    showUploadButton?: boolean;
}

export function DashboardHeader({ onUploadOpen, showUploadButton = true }: DashboardHeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();

    async function handleSignOut() {
        await signOutUser();
        router.push("/");
    }

    return (
        <header className="space-y-4 mb-6">
            <div className="flex items-center justify-between w-full">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition-colors hover:text-amber-400"
                >
                    <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
                    Back to home
                </Link>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="shrink-0 items-center justify-center text-amber-400 hover:cursor-pointer rounded-full transition-colors duration-200 hover:bg-amber-400/20 p-2"
                    >
                        {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
                            <button
                                onClick={handleSignOut}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut className="size-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
                        <Sparkles className="size-3.5" />
                        AI Resume & ATS Workspace
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Dashboard Overview
                    </h1>
                    <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
                        Monitor resume performance, run ATS match audits against target jobs, and review AI recommendations.
                    </p>
                </div>

                {showUploadButton && (
                    <button
                        type="button"
                        onClick={onUploadOpen}
                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-xs font-bold text-zinc-950 shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-300 active:scale-[0.98]"
                    >
                        <Plus className="size-4" />
                        Upload Resume
                    </button>
                )}
            </div>
        </header>
    );
}