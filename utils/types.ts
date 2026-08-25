import { Type } from '@google/genai'

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
    extractedText: string | null;
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
    extractedText?: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export type AnalysisStatus = "processing" | "completed" | "failed";

export interface KeywordAnalysis {
    matched: string[];
    missing: string[];
}

export interface ResumeAnalysis {
    id: string;
    userId: string;
    resumeId: string;
    versionId: string;
    jobTitle: string;
    companyName: string | null;
    jobDescription: string;
    status: AnalysisStatus;
    atsScore: number | null;
    jobMatchScore: number | null;
    keywordAnalysis: KeywordAnalysis | null;
    strengths: string[];
    improvements: string[];
    summary: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ServerResumeAnalysis {
    id: string;
    userId: string;
    resumeId: string;
    versionId: string;
    jobTitle: string;
    companyName: string | null;
    jobDescription: string;
    status: AnalysisStatus;
    atsScore: number | null;
    jobMatchScore: number | null;
    keywordAnalysis: {
        matched: string[];
        missing: string[];
    } | null;
    strengths: string[];
    improvements: string[];
    summary: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export type CompleteResumeAnalysisData = {
    atsScore: number;
    jobMatchScore: number;
    keywordAnalysis: {
        matched: string[];
        missing: string[];
    };
    strengths: string[];
    improvements: string[];
    summary: string;
};

export interface AIResumeAnalysisResponse {
    atsScore: number;
    jobMatchScore: number;
    keywordAnalysis: {
        matched: string[];
        missing: string[];
    };
    strengths: string[];
    improvements: string[];
    summary: string;
}

export const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        atsScore: {
            type: Type.NUMBER,
        },

        jobMatchScore: {
            type: Type.NUMBER,
        },

        keywordAnalysis: {
            type: Type.OBJECT,
            properties: {
                matched: {
                    type: Type.ARRAY,
                    items: {type: Type.STRING,},
                },

                missing: {
                    type: Type.ARRAY,
                    items: {type: Type.STRING,},
                },
            },
            required: ["matched", "missing",],
        },

        strengths: {
            type: Type.ARRAY,
            items: {type: Type.STRING,},
        },

        improvements: {
            type: Type.ARRAY,
            items: {type: Type.STRING,},
        },

        summary: {type: Type.STRING},
    },

    required: [
        "atsScore",
        "jobMatchScore",
        "keywordAnalysis",
        "strengths",
        "improvements",
        "summary",
    ],
};