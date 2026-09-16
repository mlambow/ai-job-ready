import {auth} from './client';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    sendEmailVerification,
    signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile, deleteUser, sendPasswordResetEmail
} from "@firebase/auth";
import {createUserProfile, getUserProfile} from "@/lib/firebase/firestore";
import {onAuthStateChanged} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail (fullName: string, email: string, password: string) {
    const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    await updateProfile(credentials.user, {
        displayName: fullName
    });

    await createUserProfile(credentials.user.uid, {
        fullName,
        email: credentials.user.email ?? email,
        photoUrl: credentials.user.photoURL,
    })

    await sendEmailVerification(credentials.user);

    return credentials.user
}

export async function signInWithEmail (email: string, password: string) {
    const credentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
    );
    return credentials.user
}

export async function signInWithGoogle () {
    const credentials = await signInWithPopup(auth, googleProvider)

    const user = credentials.user;

    const existingProfile = await getUserProfile(user.uid);
    if (!existingProfile) {
        await createUserProfile(user.uid, {
            fullName: user.displayName ?? '',
            email: user.email ?? '',
            photoUrl: user.photoURL,
        })
    }

    return user
}

export async function forgotPassword (email: string) {
    await sendPasswordResetEmail(auth, email)
}

export async function deleteUserAccount () {
    const user = auth.currentUser;

    if (!user) {
        return {
            status: "error",
            message: "No active user session found.",
        };
    }
    await deleteUser(user)

    return {
        message: 'User deleted successfully.',
        status: 'success',
    }
}

export async function signOutUser () {
    await signOut(auth)
}

export function waitForUser() {
    return new Promise<NonNullable<typeof auth.currentUser>>(
        (resolve, reject) => {
            const unsubscribe = onAuthStateChanged(
                auth,
                (user) => {
                    unsubscribe();

                    if (!user) {
                        reject(new Error("You must be signed in."));
                        return;
                    }

                    resolve(user);
                },
                reject,
            );
        },
    );
}