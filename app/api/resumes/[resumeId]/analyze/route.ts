import {NextRequest, NextResponse} from "next/server";
import {completeAnalysis, createAnalysisDocument} from "@/lib/firebase/admin-analysis";
import {analyzeResumeWithAI} from "@/lib/gemini/analyze-resume";
import {getResumeById, getResumeVersionById} from "@/lib/firebase/admin-resumes";
import {verifyFirebaseToken} from "@/lib/firebase/verify-token";

export async function POST(request: NextRequest, {params}: { params: Promise<{ resumeId: string; }>; },) {
    try {
        //Authenticate the user
        const decodedToken = await verifyFirebaseToken(request);
        const userId = decodedToken.uid;

        //Get the resume
        const {resumeId} = await params

        const resume = await getResumeById(userId, resumeId,);

        if (!resume) {
            return NextResponse.json(
                {error: "Resume not found",},
                {status: 404}
            )
        }

        //Resume must be complete to analyze
        if (resume.resumeStatus !== "ready") {
            return NextResponse.json(
                {error: "Resume is not ready to be analyzed"},
                {status: 400}
            )
        }

        //Get the resume current version
        const versionId = resume.currentVersionId
        const version = await getResumeVersionById(
            userId, resumeId, versionId
        );

        if (!version) {
            return NextResponse.json(
                {error: "Current version does not exist"},
                {status: 401}
            )
        }

        //Check if the version is ready to be analyzed
        if (version.resumeStatus !== "ready" || version.extractedText == null) {
            return NextResponse.json(
                {error: "Current version is not ready to be analyzed"},
                {status: 400}
            )
        }

        //Get the body inputs
        const body = await request.json();
        const jobTitle = body.jobTitle.trim();
        const jobDescription = body.jobDescription.trim();
        const companyName = body.companyName.trim();

        if (!jobTitle) {
            return NextResponse.json(
                {error: "Job Title is required"},
                {status: 404}
            )
        }

        if (!jobDescription) {
            return NextResponse.json(
                {error: "Job Description is required"},
                {status: 404}
            )
        }

        //Create analysis document
        const analysisId = await createAnalysisDocument(
            userId, resumeId, {versionId, jobTitle, jobDescription, companyName},
        )

        //Analyze with Gemini
        const aiAnalysis = await analyzeResumeWithAI(
            version.extractedText,
            jobTitle, jobDescription, companyName || null
        )

        await completeAnalysis(userId, resumeId, analysisId, aiAnalysis)

        return NextResponse.json(
            {
                message: "Resume analysis completed.",
                analysisId,
                analysis: aiAnalysis,
            },
            {status: 201}
        )

    } catch (error) {
        console.error("Resume analysis error:", error,);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to analyze resume.",
            },
            {status: 500},
        );
    }
}