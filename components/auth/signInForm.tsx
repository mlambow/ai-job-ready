import {useRouter} from "next/navigation";
import {FormEvent, useState} from "react";
import {signInWithEmail, signInWithGoogle} from "@/lib/firebase/auth";
import {authErrorMessage} from "@/utils/authErrorMessage";
import GoogleIcon from "@/components/auth/googleIcon";
import {Loader2, Sparkles} from "lucide-react";
import Link from "next/link";

export function SignInForm() {
    const router = useRouter()

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        try{
            setError('')
            setLoading(true)

            await signInWithEmail(email, password)

            router.push('/dashboard')
        }catch(error) {
            console.log(error)
            setError(authErrorMessage(error))
        }finally {
            setLoading(false)
        }
    }

    async function handleGoogleSignIn() {
        try{
            setGoogleLoading(true)

            await signInWithGoogle()

            router.push('/dashboard')
        }catch(error) {
            console.log(error)
            setError(authErrorMessage(error))
        }finally {
            setGoogleLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md">
            <div className="mb-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Sparkles className="size-6" />
                </div>

                <h1 className="mt-6 text-3xl font-bold tracking-tight">
                    Welcome back
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Sign in to continue improving your resume.
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

                {googleLoading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    <div className="mb-2 flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium"
                        >
                            Password
                        </label>

                        <Link
                            href="/forgot-password"
                            className="text-sm text-primary hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <input
                        id="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
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
                    {loading || googleLoading && <Loader2 className="size-5 animate-spin" />}
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                    href="/sign-up"
                    className="font-semibold text-primary hover:underline"
                >
                    Create one
                </Link>
            </p>
        </div>
    )
}