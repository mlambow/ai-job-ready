import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "./admin";
import {ServerResume, ServerResumeVersion} from "@/utils/types";

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

    return resumeRef.id;
}

export async function getUserResumes(userId: string): Promise<ServerResume[]> {
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

export async function getDeletionData(userId: string, resumeId: string): Promise<{
    resumeRef: FirebaseFirestore.DocumentReference;
    resume: ServerResume;
    versions: ServerResumeVersion[];
}> {
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    const resumeSnapshot = await resumeRef.get();

    if(!resumeSnapshot.exists) {
        throw new Error("Resume not found.");
    }

    const resumeData = resumeSnapshot.data();

    if (!resumeData) {
        throw new Error(
            "Resume data not found.",
        );
    }

    const versionsSnapshot = await resumeRef
        .collection("versions")
        .get()

    const versions: ServerResumeVersion[] =
        versionsSnapshot.docs.map(
            (doc) => {
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
                    createdAt: data.createdAt?.toDate()?.toISOString() ?? null,
                    updatedAt: data.updatedAt?.toDate()?.toISOString() ?? null,
                };
            },
        );

    const resume: ServerResume = {
        id: resumeSnapshot.id,
        userId: resumeData.userId,
        fileId: resumeData.fileId,
        fileName: resumeData.fileName,
        fileType: resumeData.fileType,
        fileSize: resumeData.fileSize,
        currentVersionId: resumeData.currentVersionId,
        resumeStatus: resumeData.resumeStatus,
        analysisStatus: resumeData.analysisStatus,
        createdAt: resumeData.createdAt?.toDate()?.toISOString() ?? null,
        updatedAt: resumeData.updatedAt?.toDate()?.toISOString() ?? null,
    };

    return {
        resumeRef,
        resume,
        versions,
    };
}

export async function getResumeVersionById(userId: string, resumeId: string, versionId: string,
) {
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
}