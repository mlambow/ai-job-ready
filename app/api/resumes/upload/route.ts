import { NextResponse } from "next/server";

import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { uploadResume } from "@/lib/appwrite/storage";
import {createResumeDocument} from "@/lib/firebase/admin-resumes";

const ALLOWED_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE =
    10 * 1024 * 1024; // 10 MB

export async function POST(
    request: Request,
) {
    try {
        // 1. Verify Firebase user
        const decodedToken =
            await verifyFirebaseToken(request);

        const userId = decodedToken.uid;

        // 2. Read uploaded file
        const formData =
            await request.formData();

        const file =
            formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    error: "No resume file provided.",
                },
                { status: 400 },
            );
        }

        // 3. Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    error:
                        "Only PDF and DOCX files are supported.",
                },
                { status: 400 },
            );
        }

        // 4. Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    error:
                        "Resume must be smaller than 10 MB.",
                },
                { status: 400 },
            );
        }

        // 5. Upload to Appwrite
        const uploaded =
            await uploadResume(
                file,
            );

        await createResumeDocument(
            userId,
            {
                fileId: uploaded.fileId,
                fileName: uploaded.fileName,
                fileType: uploaded.mimeType,
                fileSize: uploaded.size,
            },
        );

        return NextResponse.json({
            success: true,
            file: uploaded,
        });
    } catch (error) {
        console.error(
            "Resume upload error:",
            error,
        );

        return NextResponse.json(
            {
                error:
                    "Unable to upload resume.",
            },
            { status: 500 },
        );
    }
}