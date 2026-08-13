import {auth} from './client';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    sendEmailVerification,
    signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile
} from "@firebase/auth";

const googleProvider = new GoogleAuthProvider();

export async function signUpWithEmail (name: string, email: string, password: string) {
    const credentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
    await updateProfile(credentials.user, {
        displayName: name,
    });

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

    return credentials.user
}

export async function signOutUser () {
    await signOut(auth)
}