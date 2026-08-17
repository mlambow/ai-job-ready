import { auth } from "@/lib/firebase/client";
import {onAuthStateChanged} from "firebase/auth";

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

    const idToken =
        await user.getIdToken();

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