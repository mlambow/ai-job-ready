import { auth } from "@/lib/firebase/client";
import {onAuthStateChanged} from "firebase/auth";
import {ResumeAnalysis, ResumeVersion} from "@/utils/types";

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

    formData.append("file", file,);

    const response = await fetch("/api/resumes/upload",
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

export async function deleteResume(resumeId: string) {
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

export async function replaceResume(resumeId: string, file: File) {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const formData = new FormData();

    formData.append("file", file,);

    const response = await fetch(`/api/resumes/${resumeId}/versions`,
        {
            method: "POST",
            headers: {Authorization: `Bearer ${idToken}`,},
            body: formData,
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to replace resume.",
        );
    }

    return data;
}

export async function getResumeVersions(resumeId: string) {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/resumes/${resumeId}/versions`,
        {
            method: "GET",
            headers: {Authorization: `Bearer ${idToken}`},
            cache: "no-store",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to load resume versions.",
        );
    }

    return data.versions;
}

export async function getResumeVersionById(resumeId: string, versionId: string,
): Promise<ResumeVersion> {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/resumes/${resumeId}/versions/${versionId}`,
        {
            method: "GET",
            headers: {Authorization: `Bearer ${idToken}`},
            cache: "no-store",
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to get resume version.",
        );
    }

    return data.version;
}

export async function viewResumeVersion(resumeId: string, versionId: string,) {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/resumes/${resumeId}/versions/${versionId}/view`,
        {
            headers: {
                Authorization:
                    `Bearer ${idToken}`,
            },
        },
    );

    if (!response.ok) {
        let message = "Unable to view resume version.";

        try {
            const data = await response.json();

            message = data.error || message;
        } catch {
            // Keep default message.
        }

        throw new Error(message);
    }

    return response.blob();
}

export async function downloadResumeVersion(resumeId: string, versionId: string,) {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/resumes/${resumeId}/versions/${versionId}/download`,
        {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        },
    );

    if (!response.ok) {
        let message = "Unable to download resume version.";

        try {
            const data = await response.json();

            message = data.error || message;
        } catch {
            // Keep default message.
        }

        throw new Error(message);
    }

    return response.blob();
}

export async function processResume(resumeId: string) {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/resumes/${resumeId}/process`,
        {
            method: "POST",
            headers: {Authorization: `Bearer ${idToken}`},
        },
    );

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
        const text = await response.text();

        console.error(
            "Non-JSON response:",
            {
                status: response.status,
                text,
            },
        );

        throw new Error(
            `Failed to process resume. Server returned status ${response.status}.`
        );
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Failed to process resume.");
    }

    return data;
}

export async function analyzeResume(resumeId: string,
    data: {
        jobTitle: string;
        companyName?: string;
        jobDescription: string;
    },
) {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(`/api/resumes/${resumeId}/analyze`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
            },

            body: JSON.stringify(data),
        },
    );

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(
            responseData.error ||
            "Failed to analyze resume.",
        );
    }

    return responseData;
}

export async function getResumeAnalysis(
    resumeId: string,
): Promise<ResumeAnalysis> {
    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(
        `/api/resumes/${resumeId}/analysis`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to get resume analysis.",
        );
    }

    return data.analysis;
}

export async function getResumeAnalysisById(resumeId: string, analysisId: string) {
    const user = await waitForUser();
    const idToken = await user.getIdToken()

    const response = await fetch(`/api/resumes/${resumeId}/analysis/${analysisId}`, {
        method: "GET",
        headers: {Authorization: `Bearer ${idToken}`},
    })

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error || "Failed to load resume analysis by id"
        );
    }

    return data;
}