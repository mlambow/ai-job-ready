
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
    AnalysisRetryError,
    claimAnalysisRetry,
    completeAnalysis,
    failAnalysis,
} from "@/lib/firebase/admin-analysis";
import { getResumeVersionById } from "@/lib/firebase/admin-resumes";
import { analyzeResumeWithAI } from "@/lib/gemini/analyze-resume";

vi.mock("@/lib/firebase/verify-token", () => ({
    verifyFirebaseToken: vi.fn(),
}));

vi.mock("@/lib/firebase/admin-analysis", () => ({
    AnalysisRetryError: class AnalysisRetryError extends Error {
        statusCode: number;

        constructor(message: string, statusCode: number) {
            super(message);
            this.name = "AnalysisRetryError";
            this.statusCode = statusCode;
        }
    },
    claimAnalysisRetry: vi.fn(),
    completeAnalysis: vi.fn(),
    failAnalysis: vi.fn(),
}));

vi.mock("@/lib/firebase/admin-resumes", () => ({
    getResumeVersionById: vi.fn(),
}));

vi.mock("@/lib/gemini/analyze-resume", () => ({
    analyzeResumeWithAI: vi.fn(),
}));

const mockVerifyToken = vi.mocked(verifyFirebaseToken);
const mockClaimRetry = vi.mocked(claimAnalysisRetry);
const mockCompleteAnalysis = vi.mocked(completeAnalysis);
const mockFailAnalysis = vi.mocked(failAnalysis);
const mockGetVersion = vi.mocked(getResumeVersionById);
const mockAnalyze = vi.mocked(analyzeResumeWithAI);

const resumeId = "resume-123";
const analysisId = "analysis-456";
const versionId = "version-789";
const userId = "test-user";

const retryData = {
    versionId,
    jobTitle: "Frontend Developer",
    companyName: "Tech Company",
    jobDescription: "Looking for a React developer.",
};

const version = {
    extractedText: "Experienced developer with React and TypeScript skills.",
};

const aiAnalysis = {
    overallScore: 85,
    ATS: {
        score: 90,
        tips: [],
    },
};

function makeRequest() {
    return new NextRequest(
        `http://localhost/api/resumes/${resumeId}/analysis/${analysisId}/retry`,
        { method: "POST" },
    );
}

function callRoute() {
    return POST(makeRequest(), {
        params: Promise.resolve({
            resumeId,
            analysisId,
        }),
    });
}

describe("POST /api/resumes/[resumeId]/analysis/[analysisId]/retry", () => {
    beforeEach(() => {
        vi.resetAllMocks();

        mockVerifyToken.mockResolvedValue({ uid: userId } as never);
        mockClaimRetry.mockResolvedValue(retryData as never);
        mockGetVersion.mockResolvedValue(version as never);
        mockAnalyze.mockResolvedValue(aiAnalysis as never);
        mockCompleteAnalysis.mockResolvedValue(undefined as never);
        mockFailAnalysis.mockResolvedValue(undefined as never);

        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("successfully retries an analysis and reuses the existing analysis ID", async () => {
        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.message).toBe(
            "Resume analysis completed successfully.",
        );
        expect(body.analysisId).toBe(analysisId);
        expect(body.status).toBe("completed");

        expect(mockVerifyToken).toHaveBeenCalledOnce();

        expect(mockClaimRetry).toHaveBeenCalledWith(
            userId,
            resumeId,
            analysisId,
        );

        expect(mockGetVersion).toHaveBeenCalledWith(
            userId,
            resumeId,
            versionId,
        );

        expect(mockAnalyze).toHaveBeenCalledWith(
            version.extractedText,
            retryData.jobTitle,
            retryData.companyName,
            retryData.jobDescription,
        );

        expect(mockCompleteAnalysis).toHaveBeenCalledWith(
            userId,
            resumeId,
            analysisId,
            aiAnalysis,
        );

        expect(mockFailAnalysis).not.toHaveBeenCalled();
    });

    it("returns 401 when authentication fails", async () => {
        mockVerifyToken.mockRejectedValue(
            new Error("Missing authorization token"),
        );

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.error).toBe("Missing authorization token");

        expect(mockClaimRetry).not.toHaveBeenCalled();
        expect(mockGetVersion).not.toHaveBeenCalled();
    });

    it("returns 404 when the analysis does not exist", async () => {
        mockClaimRetry.mockRejectedValue(
            new AnalysisRetryError("Analysis not found.", 404),
        );

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe("Analysis not found.");

        expect(mockGetVersion).not.toHaveBeenCalled();
        expect(mockAnalyze).not.toHaveBeenCalled();
        expect(mockFailAnalysis).not.toHaveBeenCalled();
    });

    it("returns 409 when the analysis is not in a failed state", async () => {
        mockClaimRetry.mockRejectedValue(
            new AnalysisRetryError(
                "Only failed analyses can be retried.",
                409,
            ),
        );

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.error).toBe(
            "Only failed analyses can be retried.",
        );

        expect(mockGetVersion).not.toHaveBeenCalled();
        expect(mockAnalyze).not.toHaveBeenCalled();
        expect(mockFailAnalysis).not.toHaveBeenCalled();
    });

    it("returns 404 and marks the retry failed when the linked version is missing", async () => {
        mockGetVersion.mockResolvedValue(null as never);

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.error).toBe(
            "The linked resume version or its extracted text could not be found.",
        );

        expect(mockFailAnalysis).toHaveBeenCalledWith(
            userId,
            resumeId,
            analysisId,
        );

        expect(mockAnalyze).not.toHaveBeenCalled();
        expect(mockCompleteAnalysis).not.toHaveBeenCalled();
    });

    it("returns 404 and marks the retry failed when extracted text is missing", async () => {
        mockGetVersion.mockResolvedValue({
            extractedText: null,
        } as never);

        const response = await callRoute();

        expect(response.status).toBe(404);

        expect(mockFailAnalysis).toHaveBeenCalledWith(
            userId,
            resumeId,
            analysisId,
        );

        expect(mockAnalyze).not.toHaveBeenCalled();
        expect(mockCompleteAnalysis).not.toHaveBeenCalled();
    });

    it("marks the analysis as failed when Gemini throws an error", async () => {
        mockAnalyze.mockRejectedValue(
            new Error("Gemini service is unavailable."),
        );

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Gemini service is unavailable.");

        expect(mockFailAnalysis).toHaveBeenCalledWith(
            userId,
            resumeId,
            analysisId,
        );

        expect(mockCompleteAnalysis).not.toHaveBeenCalled();
    });

    it("does not mark the analysis as failed when claiming the retry fails unexpectedly", async () => {
        mockClaimRetry.mockRejectedValue(
            new Error("Firestore transaction failed."),
        );

        const response = await callRoute();
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe("Firestore transaction failed.");

        expect(mockFailAnalysis).not.toHaveBeenCalled();
        expect(mockGetVersion).not.toHaveBeenCalled();
    });
});
