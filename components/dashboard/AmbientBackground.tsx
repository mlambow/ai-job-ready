import React from "react";

export function AmbientBackground() {
    return (
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/2 top-[-10rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
            <div className="absolute right-[-10rem] top-[20rem] h-[25rem] w-[25rem] rounded-full bg-amber-400/5 blur-[140px]" />
        </div>
    );
}