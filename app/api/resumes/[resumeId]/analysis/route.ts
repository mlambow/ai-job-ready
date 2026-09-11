import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getResumeById } from "@/lib/firebase/admin-resumes";
import { getResumeAnalysis } from "@/lib/firebase/admin-analysis";

export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{ resumeId: string }>;
    },
) {
    try {
        const decodedToken = await verifyFirebaseToken(request);

        const userId = decodedToken?.uid;

        if (!userId) {
            return NextResponse.json(
                {error: "Unauthorized",},
                {status: 401,},
            );
        }

        const { resumeId } = await params;

        const resume = await getResumeById(userId, resumeId);

        if (!resume) {
            return NextResponse.json(
                {error: "Resume not found",},
                {status: 404},
            );
        }

        const analysis =
            await getResumeAnalysis(
                userId,
                resumeId,
            );

        if (!analysis) {
            return NextResponse.json(
                {error: "Analysis not found",},
                {status: 404,},
            );
        }

        return NextResponse.json({analysis});
    } catch (error) {
        console.error("Failed to get resume analysis:", error,);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get resume analysis.",
            },
            {status: 500,},
        );
    }
}