export const resumeListTag = (userId: string) =>
    `resumes:${userId}`;

export const resumeTag = (userId: string, resumeId: string) =>
    `resume:${userId}:${resumeId}`;

export const resumeVersionsListTag = (userId: string, resumeId: string) =>
    `resume:${userId}:${resumeId}`;

export const resumeVersionTag = (
    userId: string,
    resumeId: string,
    versionId: string,
) =>
    `resume-version:${userId}:${resumeId}:${versionId}`;

export const resumeAnalysisTag = (
    userId: string,
    resumeId: string,
) =>
    `resume-analysis:${userId}:${resumeId}`;

export const resumeAnalysisByIdTag = (
    userId: string,
    resumeId: string,
    analysisId: string,
) =>
    `resume-analysis:${userId}:${resumeId}:${analysisId}`;