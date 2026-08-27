import {NextRequest, NextResponse} from "next/server";
import {verifyFirebaseToken} from "@/lib/firebase/verify-token";
import {getResumeAnalysisById} from "@/lib/firebase/admin-analysis";

export async function GET(request: NextRequest, {params}: { params: Promise<{ resumeId: string; analysisId: string }>; }) {
    try {
        const decodedToken = await verifyFirebaseToken(request);
        const userId = decodedToken.uid;

        if (!userId) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }

        const { resumeId, analysisId } = await params;

        const analysis = await getResumeAnalysisById(userId, resumeId, analysisId);

        if (!analysis) {
            return NextResponse.json(
                {error: "Analysis not found"},
                {status: 400}
            )
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Get resume analysis error", error);

        return NextResponse.json(
            {error: error instanceof Error ? error.message : "Failed to retrieve resume analysis"},
            {status: 500}

        )
    }
}