import {doc, getDoc, setDoc, updateDoc} from 'firebase/firestore';
import { db } from '@/lib/firebase/client'
import {serverTimestamp} from "@firebase/database";

export async function createUserProfile (uid: string,
    data: {
        fullName: string;
        email: string;
        photoUrl: string | null;
    }
) {
    const userRef = doc(db, 'users', uid);

    await setDoc(userRef, {
        uid,
        fullName: data.fullName,
        email: data.email,
        photoUrl: data.photoUrl ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })
}

export async function getUserProfile (uid: string) {
    const userRef = doc(db, 'users', uid);

    const snapShot = await getDoc(userRef);
    if (!snapShot.exists()) return null;

    return snapShot;
}

export async function updateUserProfile (uid: string, data: Record<string, unknown>) {
    const userRef = doc(db, 'users', uid);

    await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
}

export async function createResumeDocument(userId: string, resumeId: string,
    data: {
        fileName: string;
        fileType: string;
        fileSize: number;
    },
) {
    const resumeRef = doc(
        db,
        "users",
        userId,
        "resumes",
        resumeId,
    );

    await setDoc(resumeRef, {
        userId,

        fileId: resumeId,

        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,

        status: "uploaded",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return resumeRef.id;
}