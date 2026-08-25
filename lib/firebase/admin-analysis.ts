import {FieldValue} from "firebase-admin/firestore";
import {adminDb} from "@/lib/firebase/admin";
import {CompleteResumeAnalysisData, ServerResumeAnalysis} from "@/utils/types";

export async function createResumeAnalysis(userId: string,
    data: {
        resumeId: string;
        versionId: string;
        jobTitle: string;
        companyName?: string;
        jobDescription: string;
    },
): Promise<string> {
    const analysisRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumeAnalyses")
        .doc();

    await analysisRef.set({
        userId,
        resumeId: data.resumeId,
        versionId: data.versionId,
        jobTitle: data.jobTitle,
        companyName: data.companyName?.trim() || null,
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

    return analysisRef.id;
}

export async function getResumeAnalysisById(userId: string, analysisId: string,
): Promise<ServerResumeAnalysis | null> {
    const analysisRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumeAnalyses")
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
        status: data.status,
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
    const analysisRef =
        adminDb
            .collection("users")
            .doc(userId)
            .collection("resumes")
            .doc(resumeId)
            .collection("analyses")
            .doc();

    await analysisRef.set({
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

    return analysisRef.id;
}

export async function completeAnalysis(userId: string, resumeId: string, analysisId: string,
    data: CompleteResumeAnalysisData,
) {
    const analysisRef =
        adminDb
            .collection("users")
            .doc(userId)
            .collection("resumes")
            .doc(resumeId)
            .collection("analyses")
            .doc(analysisId);

    await analysisRef.update({
        status: "completed",
        atsScore: data.atsScore,
        jobMatchScore: data.jobMatchScore,
        keywordAnalysis: data.keywordAnalysis,
        strengths: data.strengths,
        improvements: data.improvements,
        summary: data.summary,
        updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function failAnalysis(userId: string, resumeId: string, analysisId: string) {
    const analysisRef =
        adminDb
            .collection("users")
            .doc(userId)
            .collection("resumes")
            .doc(resumeId)
            .collection("analyses")
            .doc(analysisId);

    await analysisRef.update({
        status: "failed",
        updatedAt: FieldValue.serverTimestamp(),
    });
}