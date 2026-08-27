import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getResumeVersionById } from "@/lib/firebase/admin-resumes";

export async function GET(request: NextRequest,
    {params}: {
        params: Promise<{
            resumeId: string;
            versionId: string;
        }>;
    },
) {
    try {
        const decodedToken = await verifyFirebaseToken(request);

        const userId = decodedToken?.uid;

        if (!userId) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401},
            );
        }

        const {resumeId, versionId} = await params;

        const version =
            await getResumeVersionById(
                userId,
                resumeId,
                versionId,
            );

        if (!version) {
            return NextResponse.json(
                {error: "Resume version not found."},
                {status: 404,},
            );
        }

        return NextResponse.json({version});

    } catch (error) {
        console.error("Failed to get resume version:", error,);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to get resume version.",
            },
            {
                status: 500,
            },
        );
    }
}