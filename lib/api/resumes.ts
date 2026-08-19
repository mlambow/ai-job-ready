import { auth } from "@/lib/firebase/client";
import {onAuthStateChanged} from "firebase/auth";
import {Resume} from "@/utils/types";

function waitForUser() {

    return new Promise<NonNullable<typeof auth.currentUser>>(
        (resolve, reject) => {
            const unsubscribe = onAuthStateChanged(
                auth,
                (user) => {
                    unsubscribe();

                    if (!user) {
                        reject(new Error("You must be signed in."));
                        return;
                    }

                    resolve(user);
                },
                reject,
            );
        },
    );
}

export async function uploadResume(file: File) {
    const user = await waitForUser()

    const idToken = await user.getIdToken();

    const formData = new FormData();

    formData.append(
        "file",
        file,
    );

    const response =
        await fetch(
            "/api/resumes/upload",
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${idToken}`,
                },

                body: formData,
            },
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to upload resume.",
        );
    }

    return data;
}

export async function getResumes() {
    const user = await waitForUser()

    const idToken = await user.getIdToken();

    const response = await fetch("/api/resumes",
        {method: "GET",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            cache: "no-store",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to load resumes.",
        );
    }

    return data.resumes;
}

export async function deleteResume(
    resumeId: string,
) {
    const user = await waitForUser();

    const idToken =
        await user.getIdToken();

    const response = await fetch(
        `/api/resumes/${resumeId}`,
        {
            method: "DELETE",

            headers: {
                Authorization:
                    `Bearer ${idToken}`,
            },

            cache: "no-store",
        },
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to delete resume.",
        );
    }

    return data;
}

export async function viewResume(resumeId: string) {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response =
        await fetch(
            `/api/resumes/${resumeId}/view`,
            {
                headers: {
                    Authorization:
                        `Bearer ${idToken}`,
                },
            },
        );

    if (!response.ok) {
        const data = await response.json();

        throw new Error(
            data.error ||
            "Unable to view resume.",
        );
    }

    return response.blob();
}

export async function downloadResume(resumeId: string) {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/resumes/${resumeId}/download`,
            {
                headers: {
                    Authorization:
                        `Bearer ${idToken}`,
                },
            },
        );

    if (!response.ok) {
        let message = "Unable to download resume.";

        try {
            const data = await response.json();

            message = data.error || message;
        } catch {
            // Keep default message.
            throw new Error(message);
        }

    }

    return response.blob();
}