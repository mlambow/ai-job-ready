import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import {CompleteResumeAnalysisData, ServerResumeAnalysis} from "@/utils/types";
import {cacheLife, cacheTag, revalidateTag} from "next/cache";
import {resumeAnalysisByIdTag, resumeAnalysisTag} from "@/lib/cache/resumeCache";

export async function getResumeAnalysisById(
    userId: string,
    resumeId: string,
    analysisId: string,
): Promise<ServerResumeAnalysis | null> {
    'use cache'
    cacheTag(resumeAnalysisByIdTag(userId, resumeId, analysisId));
    cacheLife("weeks");

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

        analysisStatus: data.analysisStatus,

        overallScore: data.overallScore ?? null,

        ats: {
            score: data.ats?.score ?? 0,
            tips: data.ats?.tips ?? [],
        },

        toneAndStyle: {
            score: data.toneAndStyle?.score ?? 0,
        },

        content: {
            score: data.content?.score ?? 0,
            tips: data.content?.tips ?? [],
        },

        structure: {
            score: data.structure?.score ?? 0,
        },

        skills: {
            score: data.skills?.score ?? 0,
            matchedSkills: data.skills?.matchedSkills ?? [],
            missingSkills: data.skills?.missingSkills ?? [],
            tips: data.skills?.tips ?? [],
        },

        experience: {
            analysis: data.experience?.analysis ?? "",
            recommendedMetrics:
                data.experience?.recommendedMetrics ?? [],
        },

        keywords: {
            missingKeywords:
                data.keywords?.missingKeywords ?? [],
            tips: data.keywords?.tips ?? [],
        },

        summary: {
            alignmentScore:
                data.summary?.alignmentScore ?? 0,
            tips: data.summary?.tips ?? [],
        },

        aiSuggestions: {
            improvedSummary:
                data.aiSuggestions?.improvedSummary ?? "",
        },

        createdAt:
            data.createdAt?.toDate()?.toISOString() ?? null,

        updatedAt:
            data.updatedAt?.toDate()?.toISOString() ?? null,
    };
}

export async function getResumeAnalysis(
    userId: string,
    resumeId: string,
): Promise<ServerResumeAnalysis[]> {
    "use cache";

    // cacheTag(resumeAnalysisTag(userId, resumeId));

    const snapshot = await adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("analysis")
        .orderBy("createdAt", "desc")
        .get();

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

            analysisStatus: data.analysisStatus,

            overallScore: data.overallScore ?? null,

            ats: {
                score: data.ats?.score ?? 0,
                tips: data.ats?.tips ?? [],
            },

            toneAndStyle: {
                score: data.toneAndStyle?.score ?? 0,
            },

            content: {
                score: data.content?.score ?? 0,
                tips: data.content?.tips ?? [],
            },

            structure: {
                score: data.structure?.score ?? 0,
            },

            skills: {
                score: data.skills?.score ?? 0,
                matchedSkills:
                    data.skills?.matchedSkills ?? [],
                missingSkills:
                    data.skills?.missingSkills ?? [],
                tips: data.skills?.tips ?? [],
            },

            experience: {
                analysis:
                    data.experience?.analysis ?? "",
                recommendedMetrics:
                    data.experience?.recommendedMetrics ?? [],
            },

            keywords: {
                missingKeywords:
                    data.keywords?.missingKeywords ?? [],
                tips:
                    data.keywords?.tips ?? [],
            },

            summary: {
                alignmentScore:
                    data.summary?.alignmentScore ?? 0,
                tips:
                    data.summary?.tips ?? [],
            },

            aiSuggestions: {
                improvedSummary:
                    data.aiSuggestions?.improvedSummary ?? "",
            },

            createdAt:
                data.createdAt?.toDate()?.toISOString() ?? null,

            updatedAt:
                data.updatedAt?.toDate()?.toISOString() ?? null,
        };
    });
}

export async function createAnalysisDocument(
    userId: string,
    resumeId: string,
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

        analysisStatus: "processing",

        overallScore: null,

        ats: {
            score: 0,
            tips: [],
        },

        toneAndStyle: {
            score: 0,
        },

        content: {
            score: 0,
            tips: [],
        },

        structure: {
            score: 0,
        },

        skills: {
            score: 0,
            matchedSkills: [],
            missingSkills: [],
            tips: [],
        },

        experience: {
            analysis: "",
            recommendedMetrics: [],
        },

        keywords: {
            missingKeywords: [],
            tips: [],
        },

        summary: {
            alignmentScore: 0,
            tips: [],
        },

        aiSuggestions: {
            improvedSummary: "",
        },

        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    // Update the resume version
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

    // Get analysis to find the linked version
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

        overallScore: data.overallScore,

        ats: data.ats,

        toneAndStyle: data.toneAndStyle,

        content: data.content,

        structure: data.structure,

        skills: data.skills,

        experience: data.experience,

        keywords: data.keywords,

        summary: data.summary,

        aiSuggestions: data.aiSuggestions,

        updatedAt: FieldValue.serverTimestamp(),
    });

    // Update the linked version
    batch.update(versionRef, {
        analysisStatus: "completed",
        updatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();

    // revalidateTag(resumeListTag(userId), "max");
    revalidateTag(resumeAnalysisTag(userId, resumeId), "max");
}

export async function failAnalysis(
    userId: string,
    resumeId: string,
    analysisId: string,
) {
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    const analysisRef = resumeRef
        .collection("analysis")
        .doc(analysisId);

    const analysisSnapshot = await analysisRef.get();

    if (!analysisSnapshot.exists) {
        return;
    }

    const analysisData = analysisSnapshot.data();

    const versionId = analysisData?.versionId;

    const batch = adminDb.batch();

    batch.update(analysisRef, {
        analysisStatus: "failed",
        updatedAt: FieldValue.serverTimestamp(),
    });

    if (versionId) {
        const versionRef = resumeRef
            .collection("versions")
            .doc(versionId);

        batch.update(versionRef, {
            analysisStatus: "failed",
            updatedAt: FieldValue.serverTimestamp(),
        });
    }

    await batch.commit();

    // revalidateTag(resumeListTag(userId), "max");
    // revalidateTag(resumeAnalysisTag(userId, resumeId), "max");
}

export class AnalysisRetryError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "AnalysisRetryError";
    }
}

export async function claimAnalysisRetry(
    userId: string,
    resumeId: string,
    analysisId: string,
) {
    const analysisRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("analysis")
        .doc(analysisId);

    return adminDb.runTransaction(async (transaction) => {
        const analysisSnapshot = await transaction.get(analysisRef);

        if (!analysisSnapshot.exists) {
            throw new AnalysisRetryError("Analysis not found.", 404);
        }

        const analysisData = analysisSnapshot.data();

        if (!analysisData) {
            throw new AnalysisRetryError("Analysis data is not found", 404);
        }

        if (analysisData.analysisStatus !== "failed") {
            throw new AnalysisRetryError(
                "Only failed analyses can be retried.", 409
            );
        }

        const versionId = analysisData.versionId;

        if (!versionId) {
            throw new Error("Analysis is missing its resume version.");
        }

        const versionRef = adminDb
            .collection("users")
            .doc(userId)
            .collection("resumes")
            .doc(resumeId)
            .collection("versions")
            .doc(versionId);

        const versionSnapshot = await transaction.get(versionRef);

        if (!versionSnapshot.exists) {
            throw new Error("The linked resume version was not found.");
        }

        const now = new Date();

        transaction.update(analysisRef, {
            analysisStatus: "processing",
            overallScore: null,
            ats: null,
            toneAndStyle: null,
            content: null,
            structure: null,
            skills: null,
            experience: null,
            keywords: null,
            summary: null,
            aiSuggestions: null,
            updatedAt: now,
        });

        transaction.update(versionRef, {
            analysisStatus: "processing",
            updatedAt: now,
        });

        return {
            versionId,
            jobTitle: analysisData.jobTitle,
            companyName: analysisData.companyName ?? null,
            jobDescription: analysisData.jobDescription,
        };
    });
}