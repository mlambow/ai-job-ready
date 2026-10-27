
import { NextRequest, NextResponse } from "next/server";

import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getResumeById } from "@/lib/firebase/admin-resumes";
import { getResumeAnalysis } from "@/lib/firebase/admin-analysis";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ resumeId: string }> },
) {
    try {
        const decodedToken = await verifyFirebaseToken(request);
        const userId = decodedToken?.uid;

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const { resumeId } = await params;

        // Ensure this resume belongs to the authenticated user.
        const resume = await getResumeById(userId, resumeId);

        if (!resume) {
            return NextResponse.json(
                { error: "Resume not found" },
                { status: 404 },
            );
        }

        // Retrieve every analysis belonging to this resume.
        const analyses = await getResumeAnalysis(userId, resumeId);

        return NextResponse.json({ analyses });
    } catch (error) {
        console.error("Failed to get resume analyses:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get resume analyses.",
            },
            { status: 500 },
        );
    }
}
