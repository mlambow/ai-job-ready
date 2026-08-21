import { NextRequest, NextResponse } from "next/server";

import { adminAuth } from "@/lib/firebase/admin";
import {getResumeById, createResumeVersion, getResumeVersions} from "@/lib/firebase/admin-resumes";
import {uploadResume, deleteResumeFile} from "@/lib/appwrite/storage";

export async function POST(request: NextRequest,
    {params}: {
        params: Promise<{ resumeId: string; }>;
    },
) {
    let uploadedFileId: string | null = null;

    try {
        // 1. Get authentication token

        const authorization = request.headers.get("Authorization");

        if (
            !authorization ||
            !authorization.startsWith(
                "Bearer ",
            )
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

        const idToken = authorization.substring("Bearer ".length);

        // 2. Verify Firebase user

        const decodedToken = await adminAuth.verifyIdToken(idToken);

        const userId = decodedToken.uid;

        // 3. Get resume ID

        const { resumeId } = await params;

        // 4. Verify resume ownership

        const resume = await getResumeById(userId, resumeId);

        if (!resume) {
            return NextResponse.json(
                {
                    error:
                        "Resume not found.",
                },
                {
                    status: 404,
                },
            );
        }

        // 5. Get uploaded file

        const formData = await request.formData();

        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    error:
                        "Resume file is required.",
                },
                {
                    status: 400,
                },
            );
        }

        // 6. Validate file

        const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    error:
                        "Only PDF and DOCX files are supported.",
                },
                {
                    status: 400,
                },
            );
        }

        // 7. Upload new file to Appwrite

        const uploadedFile = await uploadResume(file);

        uploadedFileId = uploadedFile.fileId;

        // 8. Create new version

        const version =
            await createResumeVersion(userId, resumeId,
                {
                    fileId: uploadedFile.fileId,
                    fileName: uploadedFile.fileName,
                    fileType: uploadedFile.mimeType,
                    fileSize: uploadedFile.size,
                },
            );

        // 9. Return result

        return NextResponse.json(
            {
                success: true,
                resumeId,
                versionId: version.versionId,
                versionNumber: version.versionNumber,
                fileId: uploadedFile.fileId,
                fileName: uploadedFile.fileName,
            },
            {status: 201}
        );
    } catch (error) {
        console.error("Replace resume error:", error);

        // Cleanup Appwrite file if
        // Firestore operation failed

        if (uploadedFileId) {
            try {
                await deleteResumeFile(uploadedFileId);
            } catch (cleanupError) {
                console.error(
                    "Failed to clean up uploaded file:",
                    cleanupError,
                );
            }
        }

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to replace resume.",
            },
            {status: 500},
        );
    }
}

export async function GET(request: NextRequest,
    {params,}: { params: Promise<{ resumeId: string; }>; },
) {
    try {
        const authorization = request.headers.get("Authorization",);

        if (
            !authorization ||
            !authorization.startsWith(
                "Bearer ",
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Unauthorized.",
                },
                {
                    status: 401,
                },
            );
        }

        const idToken = authorization.substring("Bearer ".length);

        const decodedToken = await adminAuth.verifyIdToken(idToken);

        const userId = decodedToken.uid;

        const { resumeId } = await params;

        const resume =
            await getResumeById(
                userId,
                resumeId,
            );

        if (!resume) {
            return NextResponse.json(
                {
                    error:
                        "Resume not found.",
                },
                {
                    status: 404,
                },
            );
        }

        const versions = await getResumeVersions(userId, resumeId);

        return NextResponse.json({versions});
    } catch (error) {
        console.error("Get resume versions error:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to load resume versions.",
            },
            {
                status: 500,
            },
        );
    }
}