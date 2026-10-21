import {NextResponse, NextRequest} from "next/server";
import{verifyFirebaseToken} from '@/lib/firebase/verify-token'
//import {adminDb} from "@/lib/firebase/admin";

export async function DELETE (request: NextRequest) {
    try {
        const decodedToken = await verifyFirebaseToken(request)
        const userId = decodedToken.uid

        if (!userId) {
            return NextResponse.json(
                {error: "User not found", status: "401"}
            )
        }

        // const userRef = adminDb
        //     .collection("users")
        //     .doc(userId)


    } catch (error) {
        console.log(error);
    }
}