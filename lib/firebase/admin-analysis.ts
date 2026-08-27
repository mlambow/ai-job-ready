import {FieldValue} from "firebase-admin/firestore";
import {adminDb} from "@/lib/firebase/admin";
import {CompleteResumeAnalysisData, ServerResumeAnalysis} from "@/utils/types";

export async function getResumeAnalysisById(userId: string, resumeId: string, analysisId: string,
): Promise<ServerResumeAnalysis | null> {
    const analysisRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("analysis")
        .doc(analysisId);

    const snapshot = await analysisRef.get();

    if (!snapshot.exists) {
        return null;
    }

    const data = snapshot.data();

    if (!data) {
        return null;
    }

    return {
        id: snapshot.id,
        userId: data.userId,
        resumeId: data.resumeId,
        versionId: data.versionId,
        jobTitle: data.jobTitle,
        companyName: data.companyName ?? null,
        jobDescription: data.jobDescription,
        analysisStatus: data.status,
        atsScore: data.atsScore ?? null,
        jobMatchScore: data.jobMatchScore ?? null,
        keywordAnalysis: data.keywordAnalysis
                ? {
                    matched: data.keywordAnalysis.matched ?? [],
                    missing: data.keywordAnalysis.missing ?? [],
                }
                : null,
        strengths: data.strengths ?? [],
        improvements: data.improvements ?? [],
        summary: data.summary ?? null,
        createdAt: data.createdAt?.toDate()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate()?.toISOString() ?? null,
    };
}

export async function createAnalysisDocument(userId: string, resumeId: string,
    data: {
        versionId: string;
        jobTitle: string;
        companyName?: string | null;
        jobDescription: string;
    },
) {
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    const analysisRef = resumeRef
        .collection("analysis")
        .doc();

    const versionRef = resumeRef
        .collection("versions")
        .doc(data.versionId);

    const batch = adminDb.batch();

    // Create the analysis document
    batch.set(analysisRef, {
        userId,
        resumeId,
        versionId: data.versionId,
        jobTitle: data.jobTitle,
        companyName: data.companyName ?? null,
        jobDescription: data.jobDescription,

        status: "processing",

        atsScore: null,
        jobMatchScore: null,
        keywordAnalysis: null,
        strengths: [],
        improvements: [],
        summary: null,

        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Update the specific resume version
    batch.update(versionRef, {
        analysisId: analysisRef.id,
        analysisStatus: "processing",
        updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return analysisRef.id;
}

export async function completeAnalysis(
    userId: string,
    resumeId: string,
    analysisId: string,
    data: CompleteResumeAnalysisData,
) {
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    const analysisRef = resumeRef
        .collection("analysis")
        .doc(analysisId);

    // Get the analysis so we know its versionId
    const analysisSnapshot = await analysisRef.get();

    if (!analysisSnapshot.exists) {
        throw new Error("Analysis not found.");
    }

    const analysisData = analysisSnapshot.data();

    const versionId = analysisData?.versionId;

    if (!versionId) {
        throw new Error(
            "Analysis is not linked to a resume version.",
        );
    }

    const versionRef = resumeRef
        .collection("versions")
        .doc(versionId);

    const batch = adminDb.batch();

    // Complete the analysis
    batch.update(analysisRef, {
        analysisStatus: "completed",
        atsScore: data.atsScore,
        jobMatchScore: data.jobMatchScore,
        keywordAnalysis: data.keywordAnalysis,
        strengths: data.strengths,
        improvements: data.improvements,
        summary: data.summary,
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Update the specific version
    batch.update(versionRef, {
        analysisStatus: "completed",
        updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
}

export async function failAnalysis(userId: string, resumeId: string, analysisId: string) {
    const analysisRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("analysis")
        .doc(analysisId);

    await analysisRef.update({
        status: "failed",
        updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function getResumeAnalysis(userId: string, resumeId: string): Promise<ServerResumeAnalysis[]> {
    const snapshot = await adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("analysis")
        .orderBy("createdAt", "desc")
        .get()

    return snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            userId: data.userId,
            resumeId: data.resumeId,
            versionId: data.versionId,
            jobTitle: data.jobTitle,
            companyName: data.companyName ?? null,
            jobDescription: data.jobDescription,
            analysisStatus: data.status,
            atsScore: data.atsScore ?? null,
            jobMatchScore: data.jobMatchScore ?? null,
            keywordAnalysis: data.keywordAnalysis ?? null,
            strengths: data.strengths ?? [],
            improvements: data.improvements ?? [],
            summary: data.summary ?? null,
            createdAt: data.createdAt?.toDate()?.toISOString() ?? null,
            updatedAt: data.updatedAt?.toDate()?.toISOString() ?? null,
        };
    });
}