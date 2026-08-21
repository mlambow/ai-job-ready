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
        status: "uploaded",
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
        status: "uploaded",
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
            status: data.status,
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
        status: data.status,
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

            const resumeSnapshot = await transaction.get(resumeRef,);

            if (!resumeSnapshot.exists) {
                throw new Error(
                    "Resume not found.",
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
                    status: "uploaded",
                    createdAt: FieldValue.serverTimestamp(),
                    updatedAt: FieldValue.serverTimestamp(),
                },
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
                    status: "uploaded",
                    updatedAt: FieldValue.serverTimestamp(),
                },
            );

            return {
                versionId:
                versionRef.id,

                versionNumber,
            };
        },
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
                userId: data.userId,
                versionNumber: data.versionNumber,
                fileId: data.fileId,
                fileName: data.fileName,
                fileType: data.fileType,
                fileSize: data.fileSize,
                status: data.status,
                createdAt:
                    data.createdAt
                        ?.toDate()
                        ?.toISOString() ??
                    null,

                updatedAt:
                    data.updatedAt
                        ?.toDate()
                        ?.toISOString() ??
                    null,
            };
        },
    );
}

export async function deleteResume(userId: string, resumeId: string) {
    const resumeRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("resumes")
        .doc(resumeId);

    await resumeRef.delete();
}