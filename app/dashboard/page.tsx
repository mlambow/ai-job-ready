import Link from "next/link";


export default function Dashboard() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
            <div className="w-full">
                This is a Dashboard
                <Link href="/resumes">
                    Resumes
                </Link>
            </div>
        </main>
    );
}