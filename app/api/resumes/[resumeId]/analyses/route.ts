import {NextRequest, NextResponse} from "next/server";
import {verifyFirebaseToken} from "@/lib/firebase/verify-token";
import {getResumeById, getResumeVersionById} from "@/lib/firebase/admin-resumes";
import {completeAnalysis, createAnalysisDocument, getResumeAnalysis} from "@/lib/firebase/admin-analysis";
import {analyzeResumeWithAI} from "@/lib/gemini/analyze-resume";

export async function GET(request: NextRequest, {params}: { params: Promise<{ resumeId: string; }>; }) {
    try {
        const decodedToken = await verifyFirebaseToken(request);
        const userId = decodedToken.uid;

        if (!userId) {
            return NextResponse.json(
                {error: "Unauthorized"},
                {status: 401}
            )
        }

        const { resumeId } = await params;
        const analyses = await getResumeAnalysis(userId, resumeId);

        if (!analyses) {
            return NextResponse.json(
                {error: "Analyses not found"},
                {status: 400}
            )
        }

        return NextResponse.json(analyses)
    }catch (error) {
        console.log("Get resume error", error);

        return NextResponse.json(
            {error: error instanceof Error ? error.message : "Failed to retrieve analyses.",},
            {status: 500},
        );
    }
}