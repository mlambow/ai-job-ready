import {ID} from "node-appwrite";
import {InputFile} from "node-appwrite/file";

import { appwriteStorage } from "./server";

const BUCKET_ID = process.env.APPWRITE_BUCKET_ID!;

export async function uploadResume(file: File) {
    const fileId = ID.unique();

    const buffer = Buffer.from(
        await file.arrayBuffer(),
    );

    const uploadedFile =
        await appwriteStorage.createFile({
            bucketId: BUCKET_ID,
            fileId,
            file: InputFile.fromBuffer(
                buffer,
                file.name,
            ),
        });

    return {
        fileId: uploadedFile.$id,
        fileName: uploadedFile.name,
        size: uploadedFile.sizeOriginal,
        mimeType: uploadedFile.mimeType,
    };
}

export async function deleteResumeFile(fileId: string) {
    await appwriteStorage.deleteFile({
        bucketId: BUCKET_ID,
        fileId,
    });
}

export async function getResumeFile(fileId: string) {
    return appwriteStorage.getFileView({
        bucketId: BUCKET_ID,
        fileId,
    });
}