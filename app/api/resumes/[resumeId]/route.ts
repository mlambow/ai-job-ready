import { NextRequest, NextResponse } from "next/server";

import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import {getDeletionData,} from "@/lib/firebase/admin-resumes";
import {deleteResumeFile} from "@/lib/appwrite/storage";
import { adminDb } from "@/lib/firebase/admin";

export async function DELETE(request: NextRequest,
    {params,}: { params: Promise<{ resumeId: string; }>; },
) {
    try {
        const decodedToken = await verifyFirebaseToken(request);

        const userId = decodedToken.uid;

        const { resumeId } = await params;

         //Get resume and versions

        const result = await getDeletionData(userId, resumeId);

        //2. Get all unique Appwrite file IDs

        const fileIds = new Set<string>();

        if (result.resume?.fileId) {
            fileIds.add(result.resume.fileId);
        }

        result.versions.forEach(
            (version) => {
                if (version.fileId) {
                    fileIds.add(version.fileId,);
                }
            },
        );

         //3. Delete files from Appwrite

        await Promise.all(
            [...fileIds].map(
                async (fileId) => {
                    await deleteResumeFile(fileId,);
                },
            ),
        );

         //4. Delete all version documents

        const versionsRef =
            adminDb
                .collection("users")
                .doc(userId)
                .collection("resumes")
                .doc(resumeId)
                .collection("versions");

        const versionsSnapshot = await versionsRef.get();

        const batch = adminDb.batch();

        versionsSnapshot.docs.forEach(
            (doc) => {
                batch.delete(doc.ref);
            },
        );

        //5. Delete parent resume

        batch.delete(
            result.resumeRef,
        );

        await batch.commit();

        return NextResponse.json({
            message:
                "Resume deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete resume error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete resume.",
            },
            {
                status: 500,
            },
        );
    }
}