export type Resume = {
    id: string;
    userId: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    status: "uploaded" | "processing" | "completed" | "failed";
    createdAt: string | null;
    updatedAt: string | null;
};