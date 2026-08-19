export function authErrorMessage(error: unknown): string {
    const code =
        typeof error === "object" &&
        error !== null &&
        "code" in error
            ? String(error.code)
            : "";

    switch (code) {
        case "auth/email-already-in-use":
            return "An account already exists with this email. Please sign in";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/weak-password":
            return "Please choose a stronger password.";

        case "auth/popup-closed-by-user":
            return "Google sign-in was cancelled.";

        case "auth/invalid-password":
            return "Please enter a valid password";

        default:
            return "Something went wrong. Please try again.";
    }
}
