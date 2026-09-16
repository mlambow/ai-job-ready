import { NextRequest, NextResponse } from "next/server";

import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { getDashboardData } from "@/lib/firebase/admin-dashboard";

export async function GET(request: NextRequest) {
    try {
        const decodedToken =
            await verifyFirebaseToken(request);

        const userId = decodedToken.uid;

        const dashboard =
            await getDashboardData(userId);

        return NextResponse.json({
            success: true,
            ...dashboard,
        });

    } catch (error) {
        console.error(
            "Get dashboard error:",
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
                    "Unable to load dashboard data.",
            },
            {
                status: 500,
            },
        );
    }
}