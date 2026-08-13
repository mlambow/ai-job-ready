'use client'

import Hero from "@/components/landing/hero";
import Navbar from "@/components/landing/navbar";
import ValueProps from "@/components/landing/valueProps";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/howItWorks";
import FinalCTA from "@/components/landing/finalCTA";
import Footer from "@/components/landing/footer";

export default function LandingPage() {
    return (
        <main className="min-h-screen overflow-hidden bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute left-1/2 top-[-20rem] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute right-[-15rem] top-[30rem] h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-3xl" />
            </div>

            <Navbar />
            <Hero />
            <ValueProps />
            <Features />
            <HowItWorks />
            <FinalCTA />
            <Footer />
        </main>
    );
}