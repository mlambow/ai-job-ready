import {auth} from './client';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    sendEmailVerification,
    signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile
} from "@firebase/auth";
import {createUserProfile, getUserProfile} from "@/lib/firebase/firestore";

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

export async function signOutUser () {
    await signOut(auth)
}