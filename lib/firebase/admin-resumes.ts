import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "./admin";

export interface ServerResume {
    id: string;
    userId: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: "uploaded" | "processing" | "completed" | "failed";
    createdAt: string | null;
    updatedAt: string | null;
}

export async function createResumeDocument(
    userId: string,
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

    await resumeRef.set({
        userId,
        fileId: data.fileId,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        status: "uploaded",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    });

    return resumeRef.id;
}

export async function getUserResumes(
    userId: string,
): Promise<ServerResume[]> {
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
            createdAt: data.createdAt?.toDate()?.toISOString() ?? null,
            updatedAt: data.updatedAt?.toDate()?.toISOString() ?? null,
        };
    });
}