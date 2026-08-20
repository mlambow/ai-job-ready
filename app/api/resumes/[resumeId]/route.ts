import { NextResponse } from "next/server";

import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import {getResumeById, deleteResume} from "@/lib/firebase/admin-resumes";
import { deleteResumeFile } from "@/lib/appwrite/storage";

export async function DELETE(
    request: Request,
    context: { params: Promise<{ resumeId: string; }>; },
) {
    try {
        const decodedToken =
            await verifyFirebaseToken(request);

        const userId = decodedToken.uid;

        const { resumeId } =
            await context.params;

        // 1. Find the resume and verify ownership
        const resume =
            await getResumeById(
                userId,
                resumeId,
            );

        if (!resume) {
            return NextResponse.json(
                {
                    error: "Resume not found.",
                },
                {
                    status: 404,
                },
            );
        }

        // 2. Delete the file from Appwrite
        await deleteResumeFile(
            resume.fileId,
        );

        // 3. Delete the Firestore document
        await deleteResume(
            userId,
            resumeId,
        );

        return NextResponse.json({
            success: true,
            message: "Resume deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete resume error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to delete resume.",
            },
            {
                status: 500,
            },
        );
    }
}