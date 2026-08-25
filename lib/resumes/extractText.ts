import mammoth from "mammoth";
import pdf from 'pdf-parse-new'

export async function extractResumeText(file: Buffer, fileType: string) {
    if (fileType === "application/pdf") {
        return extractPdfText(file);
    }

    if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
        return extractDocxText(file);
    }

    throw new Error(
        "Unsupported resume file type.",
    );
}

async function extractPdfText(file: Buffer) {
    const result = await pdf(file);
    return result.text.trim();
}

async function extractDocxText(file: Buffer) {
    const result = await mammoth.extractRawText({buffer: file});
    return result.value.trim();
}