import { Type } from '@google/genai'

export type AnalysisStatus = "processing" | "completed" | "failed";
export type ResumeStatusType = "uploaded" | "processing" | "ready" | "failed";
export type FeedbackType = "good" | "improve" | "unsatisfactory";

export interface AITip {
    type: FeedbackType;
    tip: string;
}

export interface DetailedAITip {
    type: FeedbackType;
    explanation: string;
}

export interface AIResumeAnalysisResponse {
    overallScore: number;

    ATS: {
        score: number;
        tips: AITip[];
    };

    toneAndStyle: {
        score: number;
    };

    content: {
        score: number;
        tips: DetailedAITip[];
    };

    structure: {
        score: number;
    };

    skills: {
        score: number;
        matchedSkills: string[];
        missingSkills: string[];
        tips: DetailedAITip[];
    };

    experience: {
        analysis: string;
        recommendedMetrics: string[];
    };

    keywords: {
        missingKeywords: string[];
        tips: string[];
    };

    summary: {
        alignmentScore: number;
        tips: DetailedAITip[];
    };

    aiSuggestions: {
        improvedSummary: string;
    };
}

export interface ResumeAnalysis {
    id: string;

    userId: string;

    resumeId: string;

    versionId: string;

    jobTitle: string;

    companyName: string | null;

    jobDescription: string;

    analysisStatus: AnalysisStatus;

    overallScore: number | null;

    ATS: {
        score: number;
        tips: AITip[];
    } | null;

    toneAndStyle: {
        score: number;
    } | null;

    content: {
        score: number;
        tips: DetailedAITip[];
    } | null;

    structure: {
        score: number;
    } | null;

    skills: {
        score: number;
        matchedSkills: string[];
        missingSkills: string[];
        tips: DetailedAITip[];
    } | null;

    experience: {
        analysis: string;
        recommendedMetrics: string[];
    } | null;

    keywords: {
        missingKeywords: string[];
        tips: string[];
    } | null;

    summary: {
        alignmentScore: number;
        tips: DetailedAITip[];
    } | null;

    aiSuggestions: {
        improvedSummary: string;
    } | null;

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
    analysisStatus: AnalysisStatus;
    overallScore: number | null;

    ATS: {
        score: number;
        tips: AITip[];
    } | null;

    toneAndStyle: {
        score: number;
    } | null;

    content: {
        score: number;
        tips: DetailedAITip[];
    } | null;

    structure: {
        score: number;
    } | null;

    skills: {
        score: number;
        matchedSkills: string[];
        missingSkills: string[];
        tips: DetailedAITip[];
    } | null;

    experience: {
        analysis: string;
        recommendedMetrics: string[];
    } | null;

    keywords: {
        missingKeywords: string[];
        tips: string[];
    } | null;

    summary: {
        alignmentScore: number;
        tips: DetailedAITip[];
    } | null;

    aiSuggestions: {
        improvedSummary: string;
    } | null;

    createdAt: string | null;
    updatedAt: string | null;
}

export type CompleteResumeAnalysisData = AIResumeAnalysisResponse;

export type Resume = {
    id: string;
    userId: string;
    currentVersionId: string;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    resumeStatus: ResumeStatusType;
    analysisStatus: AnalysisStatus | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type ResumeVersion = {
    id: string;
    resumeId: string;
    analysisId: string | null;
    userId: string;
    versionNumber: number;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    resumeStatus: ResumeStatusType;
    analysisStatus: AnalysisStatus | null;
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
    resumeStatus: ResumeStatusType;
    analysisStatus: AnalysisStatus | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export interface ServerResumeVersion {
    id: string;
    resumeId: string;
    analysisId: string | null;
    userId: string;
    versionNumber: number;
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    resumeStatus: ResumeStatusType;
    analysisStatus: AnalysisStatus | null;
    extractedText?: string | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export const analysisSchema = {
    type: Type.OBJECT,

    properties: {
        overallScore: {
            type: Type.NUMBER,
        },

        ATS: {
            type: Type.OBJECT,

            properties: {
                score: {
                    type: Type.NUMBER,
                },

                tips: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.OBJECT,

                        properties: {
                            type: {
                                type: Type.STRING,
                            },

                            tip: {
                                type: Type.STRING,
                            },
                        },

                        required: [
                            "type",
                            "tip",
                        ],
                    },
                },
            },

            required: [
                "score",
                "tips",
            ],
        },

        toneAndStyle: {
            type: Type.OBJECT,

            properties: {
                score: {
                    type: Type.NUMBER,
                },
            },

            required: [
                "score",
            ],
        },

        content: {
            type: Type.OBJECT,

            properties: {
                score: {
                    type: Type.NUMBER,
                },

                tips: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.OBJECT,

                        properties: {
                            type: {
                                type: Type.STRING,
                            },

                            explanation: {
                                type: Type.STRING,
                            },
                        },

                        required: [
                            "type",
                            "explanation",
                        ],
                    },
                },
            },

            required: [
                "score",
                "tips",
            ],
        },

        structure: {
            type: Type.OBJECT,

            properties: {
                score: {
                    type: Type.NUMBER,
                },
            },

            required: [
                "score",
            ],
        },

        skills: {
            type: Type.OBJECT,

            properties: {
                score: {
                    type: Type.NUMBER,
                },

                matchedSkills: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.STRING,
                    },
                },

                missingSkills: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.STRING,
                    },
                },

                tips: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.OBJECT,

                        properties: {
                            type: {
                                type: Type.STRING,
                            },

                            explanation: {
                                type: Type.STRING,
                            },
                        },

                        required: [
                            "type",
                            "explanation",
                        ],
                    },
                },
            },

            required: [
                "score",
                "matchedSkills",
                "missingSkills",
                "tips",
            ],
        },

        experience: {
            type: Type.OBJECT,

            properties: {
                analysis: {
                    type: Type.STRING,
                },

                recommendedMetrics: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.STRING,
                    },
                },
            },

            required: [
                "analysis",
                "recommendedMetrics",
            ],
        },

        keywords: {
            type: Type.OBJECT,

            properties: {
                missingKeywords: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.STRING,
                    },
                },

                tips: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.STRING,
                    },
                },
            },

            required: [
                "missingKeywords",
                "tips",
            ],
        },

        summary: {
            type: Type.OBJECT,

            properties: {
                alignmentScore: {
                    type: Type.NUMBER,
                },

                tips: {
                    type: Type.ARRAY,

                    items: {
                        type: Type.OBJECT,

                        properties: {
                            type: {
                                type: Type.STRING,
                            },

                            explanation: {
                                type: Type.STRING,
                            },
                        },

                        required: [
                            "type",
                            "explanation",
                        ],
                    },
                },
            },

            required: [
                "alignmentScore",
                "tips",
            ],
        },

        aiSuggestions: {
            type: Type.OBJECT,

            properties: {
                improvedSummary: {
                    type: Type.STRING,
                },
            },

            required: [
                "improvedSummary",
            ],
        },
    },

    required: [
        "overallScore",
        "ATS",
        "toneAndStyle",
        "content",
        "structure",
        "skills",
        "experience",
        "keywords",
        "summary",
        "aiSuggestions",
    ],
};