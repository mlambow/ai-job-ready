import { NextRequest, NextResponse } from "next/server";
import {
    AnalysisRetryError,
    claimAnalysisRetry,
    completeAnalysis,
    failAnalysis,
} from "@/lib/firebase/admin-analysis";
import { analyzeResumeWithAI } from "@/lib/gemini/analyze-resume";
import { getResumeVersionById } from "@/lib/firebase/admin-resumes";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";

export async function POST(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            resumeId: string;
            analysisId: string;
        }>;
    },
) {
    let userId: string | undefined;
    let resumeId: string | undefined;
    let analysisId: string | undefined;
    let retryClaimed = false;

    try {
        // Authenticate the user
        const decodedToken = await verifyFirebaseToken(request);
        userId = decodedToken.uid;

        // Get route parameters
        const routeParams = await params;
        resumeId = routeParams.resumeId;
        analysisId = routeParams.analysisId;

        // Claim the failed analysis for retry
        const retryData = await claimAnalysisRetry(
            userId,
            resumeId,
            analysisId,
        );

        retryClaimed = true;

        // Retrieve the exact resume version linked to this analysis
        const version = await getResumeVersionById(
            userId,
            resumeId,
            retryData.versionId,
        );

        if (!version || !version.extractedText) {
            throw new AnalysisRetryError(
                "The linked resume version or its extracted text could not be found.",
            404
            );
        }

        // Run the analysis again using the stored information
        const aiAnalysis = await analyzeResumeWithAI(
            version.extractedText,
            retryData.jobTitle,
            retryData.companyName,
            retryData.jobDescription,
        );

        // Save the completed analysis
        await completeAnalysis(
            userId,
            resumeId,
            analysisId,
            aiAnalysis,
        );

        return NextResponse.json(
            {
                message: "Resume analysis completed successfully.",
                analysisId,
                analysis: aiAnalysis,
                status: "completed",
            },
            { status: 200 },
        );
    } catch (error) {
        console.error("Resume analysis retry error:", error);

        // Only mark the analysis as failed if this request claimed it
        if (retryClaimed && userId && resumeId && analysisId) {
            try {
                await failAnalysis(userId, resumeId, analysisId);
            } catch (failureError) {
                console.error(
                    "Failed to mark analysis as failed:",
                    failureError,
                );
            }
        }

        const status =
            error instanceof AnalysisRetryError
                ? error.statusCode
                : !userId
                    ? 401
                    : 500;

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to retry resume analysis.",
            },
            { status },
        );
    }
}