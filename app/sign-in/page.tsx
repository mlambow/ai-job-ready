import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignInPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full">
                <AuthForm mode='signin'/>
            </div>
        </main>
    );
}