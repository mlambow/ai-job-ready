import { NextResponse } from "next/server";

import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getResumeById } from "@/lib/firebase/admin-resumes";
import { getResumeFile } from "@/lib/appwrite/storage";

export async function GET(
    request: Request,
    context: {
        params: Promise<{
            resumeId: string;
        }>;
    },
) {
    try {
        const decodedToken =
            await verifyFirebaseToken(request);

        const userId = decodedToken.uid;

        const { resumeId } =
            await context.params;

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

        const file =
            await getResumeFile(
                resume.fileId,
            );

        return new Response(file, {
            status: 200,
            headers: {
                "Content-Type":
                resume.fileType,

                "Content-Disposition":
                    `inline; filename="${resume.fileName}"`,

                "Cache-Control":
                    "private, no-store",
            },
        });
    } catch (error) {
        console.error(
            "View resume error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to view resume.",
            },
            {
                status: 500,
            },
        );
    }
}