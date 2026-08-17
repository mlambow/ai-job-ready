import { adminAuth } from "./admin";

export async function verifyFirebaseToken(
    request: Request,
) {
    const authorization =
        request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
        throw new Error("Missing authorization token");
    }

    const idToken = authorization.substring(7);

    return await adminAuth.verifyIdToken(idToken);
}