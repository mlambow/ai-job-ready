import { waitForUser } from "@/lib/firebase/auth";

import {
    ServerResume,
    ServerResumeAnalysis,
} from "@/utils/types";

interface DashboardResponse {
    resumes: ServerResume[];
    analyses: ServerResumeAnalysis[];
}

export async function getDashboardData(): Promise<DashboardResponse> {

    const user = await waitForUser();

    const idToken = await user.getIdToken();

    const response = await fetch(
        "/api/dashboard",
        {
            method: "GET",
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
            "Failed to load dashboard.",
        );
    }

    return {
        resumes: data.resumes ?? [],
        analyses: data.analyses ?? [],
    };
}