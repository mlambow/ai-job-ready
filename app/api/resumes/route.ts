import { NextResponse } from "next/server";

import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getUserResumes } from "@/lib/firebase/admin-resumes";

export async function GET(request: Request) {
    try {
        const decodedToken =
            await verifyFirebaseToken(request);

        const resumes =
            await getUserResumes(
                decodedToken.uid,
            );

        return NextResponse.json({
            success: true,
            resumes,
        });
    } catch (error) {
        console.error(
            "Get resumes error:",
            error,
        );

        const message =
            error instanceof Error
                ? error.message
                : "";

        if (
            message.includes("Missing authorization") ||
            message.includes("auth/id-token")
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

        return NextResponse.json(
            {
                error:
                    "Unable to load resumes.",
            },
            {
                status: 500,
            },
        );
    }
}