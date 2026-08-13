import Link from "next/link";
import { SignInForm } from "@/components/auth/signInForm";

export default function SignInPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full">
                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                        ← Back to AI Job Ready
                    </Link>
                </div>

                <SignInForm />
            </div>
        </main>
    );
}