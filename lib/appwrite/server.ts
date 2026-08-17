import {Client, Storage} from "node-appwrite";

const endpoint =
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

const projectId =
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

const apiKey =
    process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
    throw new Error(
        "Missing Appwrite server environment variables",
    );
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

export const appwriteStorage =
    new Storage(client);