import { adminDb } from "@/lib/firebase/admin";
import {ServerResume, ServerResumeAnalysis} from "@/utils/types";

interface DashboardData {
    resumes: ServerResume[];
    analyses: ServerResumeAnalysis[];
}

export async function getDashboardData(
    userId: string,
): Promise<DashboardData> {

    const resumesSnapshot = await adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .orderBy("createdAt", "desc")
        .get();

    const resumes: ServerResume[] = resumesSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            userId: data.userId,
            fileId: data.fileId,
            fileName: data.fileName,
            fileType: data.fileType,
            fileSize: data.fileSize,
            resumeStatus: data.resumeStatus,
            analysisStatus: data.analysisStatus ?? null,
            currentVersionId: data.currentVersionId,
            createdAt:
                data.createdAt?.toDate()?.toISOString() ?? null,
            updatedAt:
                data.updatedAt?.toDate()?.toISOString() ?? null,
        };
    });

    const analysisResults = await Promise.all(
        resumes.map(async (resume) => {

            const snapshot = await adminDb
                .collection("users")
                .doc(userId)
                .collection("resumes")
                .doc(resume.id)
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

                    overallScore:
                        data.overallScore ?? null,

                    ATS: {
                        score: data.ats?.score ?? 0,
                        tips: data.ats?.tips ?? [],
                    },

                    toneAndStyle: {
                        score:
                            data.toneAndStyle?.score ?? 0,
                    },

                    content: {
                        score:
                            data.content?.score ?? 0,
                        tips:
                            data.content?.tips ?? [],
                    },

                    structure: {
                        score:
                            data.structure?.score ?? 0,
                    },

                    skills: {
                        score:
                            data.skills?.score ?? 0,
                        matchedSkills:
                            data.skills?.matchedSkills ?? [],
                        missingSkills:
                            data.skills?.missingSkills ?? [],
                        tips:
                            data.skills?.tips ?? [],
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
                        data.createdAt
                            ?.toDate()
                            ?.toISOString() ?? null,

                    updatedAt:
                        data.updatedAt
                            ?.toDate()
                            ?.toISOString() ?? null,
                } satisfies ServerResumeAnalysis;
            });
        }),
    );

    const analyses = analysisResults
        .flat()
        .sort((a, b) => {
            const aDate = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;

            const bDate = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;

            return bDate - aDate;
        });

    return {
        resumes,
        analyses,
    };
}