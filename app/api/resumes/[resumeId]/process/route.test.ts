
import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import { NextRequest } from "next/server";

import { POST } from "./route";

import { verifyFirebaseToken } from "@/lib/firebase/verify-token";
import {
    completeResumeVersionProcessing,
    failResumeVersionProcessing,
    getResumeById,
    getResumeVersionById,
    markResumeVersionProcessing,
} from "@/lib/firebase/admin-resumes";
import { downloadResumeFile } from "@/lib/appwrite/storage";
import { extractResumeText } from "@/lib/resumes/extractText";

vi.mock("@/lib/firebase/verify-token", () => ({
    verifyFirebaseToken: vi.fn(),
}));

vi.mock("@/lib/firebase/admin-resumes", () => ({
    completeResumeVersionProcessing: vi.fn(),
    failResumeVersionProcessing: vi.fn(),
    getResumeById: vi.fn(),
    getResumeVersionById: vi.fn(),
    markResumeVersionProcessing: vi.fn(),
}));

vi.mock("@/lib/appwrite/storage", () => ({
    downloadResumeFile: vi.fn(),
}));

vi.mock("@/lib/resumes/extractText", () => ({
    extractResumeText: vi.fn(),
}));

const mockVerifyToken = vi.mocked(verifyFirebaseToken);
const mockGetResume = vi.mocked(getResumeById);
const mockGetVersion = vi.mocked(getResumeVersionById);
const mockMarkProcessing = vi.mocked(markResumeVersionProcessing);
const mockCompleteProcessing = vi.mocked(
    completeResumeVersionProcessing,
);
const mockFailProcessing = vi.mocked(failResumeVersionProcessing);
const mockDownload = vi.mocked(downloadResumeFile);
const mockExtract = vi.mocked(extractResumeText);

const resumeId = "resume-123";
const versionId = "version-456";
const userId = "test-user";

const resume = {
    id: resumeId,
    currentVersionId: versionId,
};

const version = {
    fileId: "file-789",
    fileType: "application/pdf",
};

function makeRequest() {
    return new NextRequest(
        `http://localhost/api/resumes/${resumeId}/process`,
        { method: "POST" },
    );
}

function callRoute() {
    return POST(makeRequest(), {
        params: Promise.resolve({ resumeId }),
    });
}

describe("POST /api/resumes/[resumeId]/process", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        mockVerifyToken.mockResolvedValue({ uid: userId } as never);
        mockGetResume.mockResolvedValue(resume as never);
        mockGetVersion.mockResolvedValue(version as never);
        mockMarkProcessing.mockResolvedValue(undefined as never);
        mockCompleteProcessing.mockResolvedValue(undefined as never);
        mockFailProcessing.mockResolvedValue(undefined as never);
        mockDownload.mockResolvedValue(Buffer.from("PDF contents") as never);
        mockExtract.mockResolvedValue(
            "Experienced software developer with React skills",
        );

        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("processes a resume and saves its extracted text", async () => {
        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.message).toBe("Resume processed successfully.");
        expect(body.resumeId).toBe(resumeId);
        expect(body.versionId).toBe(versionId);

        expect(mockVerifyToken).toHaveBeenCalledOnce();
        expect(mockGetResume).toHaveBeenCalledWith(userId, resumeId);
        expect(mockGetVersion).toHaveBeenCalledWith(
            userId,
            resumeId,
            versionId,
        );
        expect(mockMarkProcessing).toHaveBeenCalledWith(
            userId,
            resumeId,
            versionId,
        );
        expect(mockDownload).toHaveBeenCalledWith("file-789");
        expect(mockExtract).toHaveBeenCalledWith(
            expect.any(Buffer),
            "application/pdf",
        );
        expect(mockCompleteProcessing).toHaveBeenCalledWith(
            userId,
            resumeId,
            versionId,
            "Experienced software developer with React skills",
        );
    });

    it("returns 404 when the resume does not exist", async () => {
        mockGetResume.mockResolvedValue(null as never);

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("Resume not found");
        expect(mockGetVersion).not.toHaveBeenCalled();
        expect(mockDownload).not.toHaveBeenCalled();
    });

    it("returns 404 when the current version does not exist", async () => {
        mockGetVersion.mockResolvedValue(null as never);

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("Version not found");
        expect(mockMarkProcessing).not.toHaveBeenCalled();
        expect(mockDownload).not.toHaveBeenCalled();
    });

    it("returns 404 when the stored file cannot be downloaded", async () => {
        mockDownload.mockResolvedValue(null as never);

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("File (resume to download) not found");
        expect(mockExtract).not.toHaveBeenCalled();
        expect(mockCompleteProcessing).not.toHaveBeenCalled();
    });

    it("returns an error when no text can be extracted", async () => {
        mockExtract.mockResolvedValue("");

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe(
            "Text from resume could not be extracted",
        );
        expect(mockCompleteProcessing).not.toHaveBeenCalled();
    });

    it("marks processing as failed when extraction throws", async () => {
        mockExtract.mockRejectedValue(new Error("Corrupted PDF"));

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Corrupted PDF");
        expect(mockFailProcessing).toHaveBeenCalledWith(
            userId,
            resumeId,
            versionId,
        );
        expect(mockCompleteProcessing).not.toHaveBeenCalled();
    });

    it("returns an error when authentication fails", async () => {
        mockVerifyToken.mockRejectedValue(
            new Error("Missing authorization token"),
        );

        const response = await callRoute();
        const body = await response.json();

        // Tests the current implementation.
        expect(response.status).toBe(500);
        expect(body.error).toBe("Missing authorization token");

        expect(mockGetResume).not.toHaveBeenCalled();
        expect(mockDownload).not.toHaveBeenCalled();
    });
});
