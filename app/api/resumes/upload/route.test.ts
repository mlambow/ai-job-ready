
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";
import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import { uploadResume } from "@/lib/appwrite/storage";
import { createResumeDocument } from "@/lib/firebase/admin-resumes";

vi.mock("@/lib/firebase/verify-token", () => ({
    verifyFirebaseToken: vi.fn(),
}));

vi.mock("@/lib/appwrite/storage", () => ({
    uploadResume: vi.fn(),
}));

vi.mock("@/lib/firebase/admin-resumes", () => ({
    createResumeDocument: vi.fn(),
}));

const PDF_TYPE = "application/pdf";
const DOCX_TYPE =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const mockVerifyToken = vi.mocked(verifyFirebaseToken);
const mockUploadResume = vi.mocked(uploadResume);
const mockCreateResumeDocument = vi.mocked(createResumeDocument);

function makeRequest(file?: File) {
    const formData = new FormData();

    if (file) {
        formData.append("file", file);
    }

    return new Request("http://localhost/api/resumes/upload", {
        method: "POST",
        body: formData,
    });
}

function makeFile(
    name = "resume.pdf",
    type = PDF_TYPE,
    size = 100,
) {
    return new File([new Uint8Array(size)], name, { type });
}

describe("POST /api/resumes/upload", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        mockVerifyToken.mockResolvedValue({
            uid: "test-user",
        } as never);

        mockUploadResume.mockResolvedValue({
            fileId: "file-123",
            fileName: "resume.pdf",
            mimeType: PDF_TYPE,
            size: 100,
        } as never);

        mockCreateResumeDocument.mockResolvedValue(undefined as never);

        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("uploads a valid PDF and creates its database record", async () => {
        const response = await POST(makeRequest(makeFile()));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.file.fileId).toBe("file-123");

        expect(mockVerifyToken).toHaveBeenCalledOnce();
        expect(mockUploadResume).toHaveBeenCalledOnce();
        expect(mockCreateResumeDocument).toHaveBeenCalledWith(
            "test-user",
            {
                fileId: "file-123",
                fileName: "resume.pdf",
                fileType: PDF_TYPE,
                fileSize: 100,
            },
        );
    });

    it("accepts a DOCX file", async () => {
        const file = makeFile("resume.docx", DOCX_TYPE);

        const response = await POST(makeRequest(file));

        expect(response.status).toBe(200);
        expect(mockUploadResume).toHaveBeenCalledOnce();

        const uploadedFile = mockUploadResume.mock.calls[0][0];

        expect(uploadedFile.name).toBe("resume.docx");
        expect(uploadedFile.type).toBe(DOCX_TYPE);
        expect(uploadedFile.size).toBe(file.size);
    });

    it("rejects a request without a file", async () => {
        const response = await POST(makeRequest());
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe("No resume file provided.");
        expect(mockUploadResume).not.toHaveBeenCalled();
        expect(mockCreateResumeDocument).not.toHaveBeenCalled();
    });

    it("rejects unsupported file types", async () => {
        const response = await POST(
            makeRequest(makeFile("resume.txt", "text/plain")),
        );
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe(
            "Only PDF and DOCX files are supported.",
        );
        expect(mockUploadResume).not.toHaveBeenCalled();
    });

    it("rejects files larger than 10 MB", async () => {
        const oversizedFile = makeFile(
            "large-resume.pdf",
            PDF_TYPE,
            MAX_FILE_SIZE + 1,
        );

        const response = await POST(makeRequest(oversizedFile));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe(
            "Resume must be smaller than 10 MB.",
        );
        expect(mockUploadResume).not.toHaveBeenCalled();
    });

    it("returns 500 if storage upload fails", async () => {
        mockUploadResume.mockRejectedValue(
            new Error("Storage unavailable"),
        );

        const response = await POST(makeRequest(makeFile()));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Unable to upload resume.");
        expect(mockCreateResumeDocument).not.toHaveBeenCalled();
    });

    it("returns 500 if database record creation fails", async () => {
        mockCreateResumeDocument.mockRejectedValue(
            new Error("Database unavailable"),
        );

        const response = await POST(makeRequest(makeFile()));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Unable to upload resume.");
        expect(mockUploadResume).toHaveBeenCalledOnce();
    });

    it("returns 500 when token verification fails", async () => {
        mockVerifyToken.mockRejectedValue(
            new Error("Invalid token"),
        );

        const response = await POST(makeRequest(makeFile()));

        expect(response.status).toBe(500);
        expect(mockUploadResume).not.toHaveBeenCalled();
    });
});
