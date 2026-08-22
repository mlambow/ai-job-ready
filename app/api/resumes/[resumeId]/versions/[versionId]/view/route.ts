import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import {getResumeById, getResumeVersionById} from "@/lib/firebase/admin-resumes";
import { appwriteStorage } from "@/lib/appwrite/server";

const BUCKET_ID =
    process.env.APPWRITE_BUCKET_ID!;

export async function GET(
    request: NextRequest,
    {params,}: {
        params: Promise<{ resumeId: string; versionId: string; }>;
    },
) {
    try {
        // 1. Authenticate user

        const authorization =
            request.headers.get("Authorization");

        if (
            !authorization ||
            !authorization.startsWith("Bearer ")
        ) {
            return NextResponse.json(
                {
                    error: "Unauthorized.",
                },
                {
                    status: 401,
                },
            );
        }

        const idToken =
            authorization.substring(
                "Bearer ".length,
            );

        const decodedToken =
            await adminAuth.verifyIdToken(
                idToken,
            );

        const userId = decodedToken.uid;

        // 2. Get route parameters

        const {resumeId, versionId} = await params;

        // 3. Verify resume ownership

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

        // 4. Get requested version

        const version =
            await getResumeVersionById(
                userId,
                resumeId,
                versionId,
            );

        if (!version) {
            return NextResponse.json(
                {
                    error: "Resume version not found.",
                },
                {
                    status: 404,
                },
            );
        }

        // 5. Get file from Appwrite

        const file =
            await appwriteStorage.getFileView({
                bucketId: BUCKET_ID,
                fileId: version.fileId,
            });

        // 6. Return file

        return new NextResponse(file, {
            status: 200,
            headers: {
                "Content-Type": version.fileType,

                "Content-Disposition":
                    `inline; filename="${encodeURIComponent(
                        version.fileName,
                    )}"`,

                "Cache-Control": "private, no-store",
            },
        });
    } catch (error) {
        console.error("View resume version error:", error,);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to view resume version.",
            },
            {
                status: 500,
            },
        );
    }
}