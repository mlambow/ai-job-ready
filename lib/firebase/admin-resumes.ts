import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import {ServerResume, ServerResumeAnalysis, ServerResumeVersion} from "@/utils/types";
import {cacheLife, cacheTag, revalidateTag} from "next/cache";
import {resumeListTag, resumeTag, resumeVersionsListTag, resumeVersionTag} from "@/lib/cache/resumeCache";

export async function createResumeDocument(userId: string,
    data: {
        fileId: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    },
) {
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(data.fileId);

    const versionRef = resumeRef
        .collection("versions")
        .doc();

    const now = FieldValue.serverTimestamp()

    await resumeRef.set({
        userId,
        currentVersionId: versionRef.id,
        currentVersionNumber: 1,
        fileId: data.fileId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        resumeStatus: "uploaded",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    await versionRef.set({
        resumeId: resumeRef.id,
        userId,
        versionNumber: 1,
        fileId: data.fileId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        resumeStatus: "uploaded",
        analysisStatus: null,
        analysisId: null,
        extractedText: null,
        createdAt: now,
        updatedAt: now,
    });

    // revalidateTag(resumeListTag(userId), 'max');

    return resumeRef.id;
}

export async function getUserResumes(userId: string): Promise<ServerResume[]> {
    "use cache";

    cacheTag(resumeListTag(userId));

    cacheLife('weeks')

    const snapshot = await adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .orderBy("createdAt", "desc")
        .get();

    return snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            userId: data.userId,
            fileId: data.fileId,
            fileName: data.fileName,
            fileType: data.fileType,
            fileSize: data.fileSize,
            resumeStatus: data.resumeStatus,
            analysisStatus: null,
            currentVersionId: data.currentVersionId,
            createdAt: data.createdAt?.toDate()?.toISOString() ?? null,
            updatedAt: data.updatedAt?.toDate()?.toISOString() ?? null,
        };
    });
}

export async function getResumeById(userId: string, resumeId: string,): Promise<ServerResume | null> {
    // 'use cache'
    //
    // cacheTag(resumeTag(userId, resumeId))

    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    const snapshot = await resumeRef.get();

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
        fileId: data.fileId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        resumeStatus: data.resumeStatus,
        analysisStatus: null,
        currentVersionId: data.currentVersionId,
        createdAt: data.createdAt?.toDate()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate()?.toISOString() ?? null,
    };
}

export async function createResumeVersion(userId: string, resumeId: string,
    data: {
        fileId: string;
        fileName: string;
        fileType: string;
        fileSize: number;
    },
) {
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    return await adminDb.runTransaction(
        async (transaction) => {
            // 1. Get the parent resume

            const resumeSnapshot = await transaction.get(resumeRef);

            if (!resumeSnapshot.exists) {
                throw new Error(
                    "Resume not found."
                );
            }

            const resumeData = resumeSnapshot.data();

            // 2. Determine next version number

            const currentVersionNumber = resumeData?.currentVersionNumber ?? 0;

            const versionNumber = currentVersionNumber + 1;

            // 3. Create version reference

            const versionRef =
                resumeRef
                    .collection("versions")
                    .doc();

            // 4. Create the new version

            transaction.set(
                versionRef,
                {
                    resumeId,
                    userId,
                    fileId: data.fileId,
                    fileName: data.fileName,
                    fileType: data.fileType,
                    fileSize: data.fileSize,
                    versionNumber,
                    resumeStatus: "uploaded",
                    extractedText: null,
                    analysisId: null,
                    analysisStatus: null,
                    createdAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                }
            );

            // 5. Update parent resume

            transaction.update(
                resumeRef,
                {
                    currentVersionId: versionRef.id,
                    currentVersionNumber: versionNumber,
                    fileId: data.fileId,
                    fileName: data.fileName,
                    fileType: data.fileType,
                    fileSize: data.fileSize,
                    resumeStatus: "uploaded",
                    analysisStatus: null,
                    updatedAt: FieldValue.serverTimestamp()
                }
            );

            // revalidateTag(resumeListTag(userId), "max");
            // revalidateTag(resumeVersionsListTag(userId, resumeId), "max")

            return {
                versionId:
                versionRef.id,
                versionNumber
            };
        }
    );
}

export async function getResumeVersions(userId: string, resumeId: string,
): Promise<ServerResumeVersion[]> {
    'use cache'
    cacheTag(resumeVersionsListTag(userId, resumeId))
    cacheLife("weeks")

    const versionsSnapshot =
        await adminDb
            .collection("users")
            .doc(userId)
            .collection("resumes")
            .doc(resumeId)
            .collection("versions")
            .orderBy(
                "versionNumber",
                "desc",
            )
            .get();

    return versionsSnapshot.docs.map(
        (doc) => {
            const data = doc.data();

            return {
                id: doc.id,
                resumeId: data.resumeId,
                analysisId: data.analysisId ?? null,
                userId: data.userId,
                versionNumber: data.versionNumber,
                fileId: data.fileId,
                fileName: data.fileName,
                fileType: data.fileType,
                fileSize: data.fileSize,
                resumeStatus: data.resumeStatus,
                analysisStatus: data.analysisStatus ?? null,
                extractedText: data.extractedText ?? null,
                createdAt: data.createdAt?.toDate()?.toISOString() ?? null,
                updatedAt: data.updatedAt?.toDate()?.toISOString() ?? null,
            };
        },
    );
}

export async function getDeletionData(userId: string, resumeId: string,): Promise<{
    resumeRef: FirebaseFirestore.DocumentReference;
    resume: ServerResume;
    versions: ServerResumeVersion[];
    analysis: ServerResumeAnalysis[];
}> {
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    const resumeSnapshot = await resumeRef.get();

    if (!resumeSnapshot.exists) {
        throw new Error("Resume not found.");
    }

    const resumeData = resumeSnapshot.data();

    if (!resumeData) {
        throw new Error("Resume data not found.");
    }

    const analysisSnapshot = await resumeRef
        .collection("analysis")
        .get();

    const versionsSnapshot = await resumeRef
        .collection("versions")
        .get();

    const analysis: ServerResumeAnalysis[] = analysisSnapshot.docs.map((doc) => {
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

            overallScore: data.overallScore ?? 0,

            ATS: data.ATS
                ? {
                    score: data.ATS.score ?? 0,
                    tips: data.ATS.tips ?? [],
                }
                : null,

            toneAndStyle: data.toneAndStyle
                ? {
                    score: data.toneAndStyle.score ?? 0,
                }
                : null,

            content: data.content
                ? {
                    score: data.content.score ?? 0,
                    tips: data.content.tips ?? [],
                }
                : null,

            structure: data.structure
                ? {
                    score: data.structure.score ?? 0,
                }
                : null,

            skills: data.skills
                ? {
                    score: data.skills.score ?? 0,
                    matchedSkills:
                        data.skills.matchedSkills ?? [],
                    missingSkills:
                        data.skills.missingSkills ?? [],
                    tips: data.skills.tips ?? [],
                }
                : null,

            experience: data.experience
                ? {
                    analysis:
                        data.experience.analysis ?? "",
                    recommendedMetrics:
                        data.experience.recommendedMetrics ?? [],
                }
                : null,

            keywords: data.keywords
                ? {
                    missingKeywords:
                        data.keywords.missingKeywords ?? "",
                    tips: data.keywords.tips ?? [],
                }
                : null,

            summary: data.summary
                ? {
                    alignmentScore:
                        data.summary.alignmentScore ?? 0,
                    tips: data.summary.tips ?? [],
                }
                : null,

            aiSuggestions: data.aiSuggestions
                ? {
                    improvedSummary:
                        data.aiSuggestions.improvedSummary ?? "",
                }
                : null,

            createdAt:
                data.createdAt?.toDate()?.toISOString() ?? null,

            updatedAt:
                data.updatedAt?.toDate()?.toISOString() ?? null,
        };
    });

    const versions: ServerResumeVersion[] = versionsSnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            resumeId: data.resumeId,
            analysisId: data.analysisId,
            userId: data.userId,
            versionNumber: data.versionNumber,
            fileId: data.fileId,
            fileName: data.fileName,
            fileType: data.fileType,
            fileSize: data.fileSize,
            resumeStatus: data.resumeStatus,
            analysisStatus: data.analysisStatus,
            extractedText: data.extractedText ?? null,
            createdAt:
                data.createdAt?.toDate()?.toISOString() ?? null,
            updatedAt:
                data.updatedAt?.toDate()?.toISOString() ?? null,
        };
    });

    const resume: ServerResume = {
        id: resumeSnapshot.id,
        userId: resumeData.userId,
        fileId: resumeData.fileId,
        fileName: resumeData.fileName,
        fileType: resumeData.fileType,
        fileSize: resumeData.fileSize,
        currentVersionId: resumeData.currentVersionId,
        resumeStatus: resumeData.resumeStatus,
        analysisStatus: resumeData.analysisStatus ?? null,
        createdAt: resumeData.createdAt?.toDate()?.toISOString() ?? null,
        updatedAt: resumeData.updatedAt?.toDate()?.toISOString() ?? null,
    };

    return {
        resumeRef,
        resume,
        versions,
        analysis,
    };
}

export async function getResumeVersionById(userId: string, resumeId: string, versionId: string,
): Promise<ServerResumeVersion | null> {
    "use cache";
    cacheTag(resumeVersionTag(userId, resumeId, versionId));
    cacheLife('weeks')

    const versionRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("versions")
        .doc(versionId);

    const snapshot = await versionRef.get();

    if (!snapshot.exists) {
        return null;
    }

    const data = snapshot.data();

    if (!data) {
        return null;
    }

    return {
        id: snapshot.id,
        resumeId: data.resumeId,
        userId: data.userId,
        fileId: data.fileId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        versionNumber: data.versionNumber,
        resumeStatus: data.resumeStatus,
        analysisId: data.analysisId ?? null,
        analysisStatus: data.analysisStatus ?? null,
        extractedText: data.extractedText ?? null,
        createdAt: data.createdAt?.toDate()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate()?.toISOString() ?? null,
    };
}

export async function markResumeVersionProcessing(
    userId: string,
    resumeId: string,
    versionId: string,
) {
    const versionRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("versions")
        .doc(versionId);

    await versionRef.update({
        resumeStatus: "processing",
        updatedAt: FieldValue.serverTimestamp(),
    });

    // update the parent resume
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    await resumeRef.update({
        resumeStatus: "processing",
        updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function completeResumeVersionProcessing(userId: string, resumeId: string, versionId: string, extractedText: string,) {
    const versionRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("versions")
        .doc(versionId);

    await versionRef.update({
        resumeStatus: "ready",
        extractedText,
        updatedAt: FieldValue.serverTimestamp(),
    });

    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    await resumeRef.update({
        resumeStatus: "ready",
        updatedAt: FieldValue.serverTimestamp(),
    });

    revalidateTag(resumeListTag(userId), "max");
    revalidateTag(resumeVersionsListTag(userId, resumeId), "max");
    revalidateTag(resumeVersionTag(userId, resumeId, versionId), "max");
}

export async function failResumeVersionProcessing(
    userId: string,
    resumeId: string,
    versionId: string,
) {
    const versionRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId)
        .collection("versions")
        .doc(versionId);

    await versionRef.update({
        resumeStatus: "failed",
        updatedAt: FieldValue.serverTimestamp(),
    });

    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    await resumeRef.update({
        resumeStatus: "failed",
        updatedAt: FieldValue.serverTimestamp(),
    });

    // revalidateTag(resumeListTag(userId), "max");
    // revalidateTag(resumeVersionTag(userId, resumeId, versionId), "max");
}