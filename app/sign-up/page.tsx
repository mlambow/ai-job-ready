import Link from "next/link";
import {AuthForm} from "@/components/auth/AuthForm";

export default function SignUpPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full">
                <AuthForm mode='signup'/>
            </div>
        </main>
    );
}