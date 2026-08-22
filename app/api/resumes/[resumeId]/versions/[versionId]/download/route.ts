import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import {
    getResumeById,
    getResumeVersionById,
} from "@/lib/firebase/admin-resumes";
import { appwriteStorage } from "@/lib/appwrite/server";

const BUCKET_ID =
    process.env.APPWRITE_BUCKET_ID!;

export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            resumeId: string;
            versionId: string;
        }>;
    },
) {
    try {
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

        const {
            resumeId,
            versionId,
        } = await params;

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

        const version =
            await getResumeVersionById(
                userId,
                resumeId,
                versionId,
            );

        if (!version) {
            return NextResponse.json(
                {
                    error:
                        "Resume version not found.",
                },
                {
                    status: 404,
                },
            );
        }

        const file =
            await appwriteStorage.getFileDownload({
                bucketId: BUCKET_ID,
                fileId: version.fileId,
            });

        return new NextResponse(file, {
            status: 200,
            headers: {
                "Content-Type":
                version.fileType,

                "Content-Disposition":
                    `attachment; filename="${encodeURIComponent(
                        version.fileName,
                    )}"`,

                "Cache-Control":
                    "private, no-store",
            },
        });
    } catch (error) {
        console.error(
            "Download resume version error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Unable to download resume version.",
            },
            {
                status: 500,
            },
        );
    }
}