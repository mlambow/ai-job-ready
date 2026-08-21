export type Resume = {
    id: string;
    userId: string;
    currentVersionId: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: "uploaded" | "processing" | "completed" | "failed";
    createdAt: string | null;
    updatedAt: string | null;
};

export type ResumeVersion = {
    id: string;
    resumeId: string;
    userId: string;
    versionNumber: number;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: "uploaded" | "processing" | "completed" | "failed";
    createdAt: string | null;
    updatedAt: string | null;
};

export interface ServerResume {
    id: string;
    userId: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    currentVersionId: string;
    status: "uploaded" | "processing" | "completed" | "failed";
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ServerResumeVersion {
    id: string;
    resumeId: string;
    userId: string;
    versionNumber: number;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: "uploaded" | "processing" | "completed" | "failed";
    createdAt: string | null;
    updatedAt: string | null;
}