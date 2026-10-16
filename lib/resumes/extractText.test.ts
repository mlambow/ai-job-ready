
import { beforeEach, describe, expect, it, vi } from "vitest";
import mammoth from "mammoth";
import pdf from "pdf-parse-new";
import { extractResumeText } from "./extractText";

vi.mock("mammoth", () => ({
    default: {
        extractRawText: vi.fn(),
    },
}));

vi.mock("pdf-parse-new", () => ({
    default: vi.fn(),
}));

const mockPdf = vi.mocked(pdf);
const mockExtractRawText = vi.mocked(mammoth.extractRawText);

const PDF_TYPE = "application/pdf";

const DOCX_TYPE =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("extractResumeText", () => {
    const file = Buffer.from("test resume content");

    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("PDF extraction", () => {
        it("extracts and trims text from a PDF", async () => {
            mockPdf.mockResolvedValue({
                text: "  Software Developer with React experience  ",
            } as never);

            const result = await extractResumeText(file, PDF_TYPE);

            expect(result).toBe("Software Developer with React experience");
            expect(mockPdf).toHaveBeenCalledWith(file);
            expect(mockExtractRawText).not.toHaveBeenCalled();
        });

        it("returns an empty string when the PDF contains no text", async () => {
            mockPdf.mockResolvedValue({ text: "   " } as never);

            const result = await extractResumeText(file, PDF_TYPE);

            expect(result).toBe("");
        });

        it("propagates PDF parsing errors", async () => {
            mockPdf.mockRejectedValue(new Error("Invalid PDF"));

            await expect(
                extractResumeText(file, PDF_TYPE),
            ).rejects.toThrow("Invalid PDF");
        });
    });

    describe("DOCX extraction", () => {
        it("extracts and trims text from a DOCX file", async () => {
            mockExtractRawText.mockResolvedValue({
                value: "  Full-stack developer with Python experience  ",
                messages: [],
            } as never);

            const result = await extractResumeText(file, DOCX_TYPE);

            expect(result).toBe(
                "Full-stack developer with Python experience",
            );
            expect(mockExtractRawText).toHaveBeenCalledWith({
                buffer: file,
            });
            expect(mockPdf).not.toHaveBeenCalled();
        });

        it("returns an empty string when the DOCX contains no text", async () => {
            mockExtractRawText.mockResolvedValue({
                value: "   ",
                messages: [],
            } as never);

            const result = await extractResumeText(file, DOCX_TYPE);

            expect(result).toBe("");
        });

        it("propagates DOCX parsing errors", async () => {
            mockExtractRawText.mockRejectedValue(
                new Error("Invalid DOCX"),
            );

            await expect(
                extractResumeText(file, DOCX_TYPE),
            ).rejects.toThrow("Invalid DOCX");
        });
    });

    describe("file validation", () => {
        it("rejects unsupported file types", async () => {
            await expect(
                extractResumeText(file, "text/plain"),
            ).rejects.toThrow("Unsupported resume file type.");
        });

        it("does not call either parser for an unsupported file", async () => {
            await expect(
                extractResumeText(file, "image/png"),
            ).rejects.toThrow("Unsupported resume file type.");

            expect(mockPdf).not.toHaveBeenCalled();
            expect(mockExtractRawText).not.toHaveBeenCalled();
        });
    });
});
