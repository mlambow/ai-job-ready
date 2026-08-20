"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Resume } from "@/utils/types";

interface DeleteResumeModalProps {
    open: boolean;
    resume: Resume | null;
    onClose: () => void;
    onConfirm: () => void;
}

export function DeleteResumeModal({
                                      open,
                                      resume,
                                      onClose,
                                      onConfirm,
                                  }: DeleteResumeModalProps) {
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch when using React Portals in Next.js
    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when modal is active
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // Handle Escape keypress
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && open) {
                onClose();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!mounted || !open || !resume) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200"
                aria-hidden="true"
            />

            {/* Modal Card Centered in Viewport */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-modal-title"
                className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-zinc-800/80 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8 font-sans text-zinc-100 animate-in zoom-in-95 duration-200"
            >
                {/* Ambient Top Red Glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-28 w-full -translate-x-1/2 bg-rose-500/10 blur-3xl" />

                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-6 top-6 flex size-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                    aria-label="Close modal"
                >
                    <X className="size-5" />
                </button>

                {/* Content Section */}
                <div className="space-y-4 text-center sm:text-left">
                    {/* Warning Icon Badge */}
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 sm:mx-0">
                        <AlertTriangle className="size-6" />
                    </div>

                    <div className="space-y-2">
                        <h3
                            id="delete-modal-title"
                            className="text-lg font-extrabold text-white"
                        >
                            Delete this resume?
                        </h3>

                        <p className="text-xs leading-relaxed text-zinc-400">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-zinc-200">
                {resume.fileName}
              </span>
                            ? This action is permanent and cannot be undone.
                        </p>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-full border border-zinc-800/80 bg-zinc-800/40 px-5 py-2.5 text-xs font-bold text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white sm:w-auto"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-500/30 bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-[0.98] sm:w-auto"
                    >
                        <Trash2 className="size-3.5" />
                        Delete resume
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}