
import {
    getResumes,
    getResumeVersionById,
    getResumeAnalysisById,
} from "@/lib/api/resumes";

import type {
    Resume,
    ResumeVersion,
    ServerResumeAnalysis,
} from "@/utils/types";

export interface AnalysisData {
    resumes: Resume[];
    currentResumeVersions: Record<string, ResumeVersion>;
    analyses: ServerResumeAnalysis[];
}

export async function fetchAnalysisById(
    resumeId: string,
    analysisId: string
): Promise<ServerResumeAnalysis> {
    return getResumeAnalysisById(resumeId, analysisId);
}

export async function fetchAnalysisData(): Promise<AnalysisData> {
    const resumes: Resume[] = await getResumes();

    const versionResults = await Promise.all(
        resumes.map(async (resume) => {
            try {
                const version = await getResumeVersionById(
                    resume.id,
                    resume.currentVersionId
                );

                return { resumeId: resume.id, version };
            } catch (error) {
                console.error(
                    `Failed to load version for resume ${resume.id}:`,
                    error
                );

                return { resumeId: resume.id, version: null };
            }
        })
    );

    const currentResumeVersions: Record<string, ResumeVersion> = {};

    for (const { resumeId, version } of versionResults) {
        if (version) {
            currentResumeVersions[resumeId] = version;
        }
    }

    const analysisResults = await Promise.all(
        Object.values(currentResumeVersions).map(async (version) => {
            if (!version.analysisId || !version.resumeId) {
                return null;
            }

            try {
                return await fetchAnalysisById(
                    version.resumeId,
                    version.analysisId
                );
            } catch (error) {
                console.error(
                    `Failed to load analysis ${version.analysisId}:`,
                    error
                );

                return null;
            }
        })
    );

    const analyses = analysisResults
        .filter(
            (analysis): analysis is ServerResumeAnalysis =>
                analysis !== null
        )
        .sort((a, b) => {
            const dateA = new Date(a.createdAt ?? 0).getTime();
            const dateB = new Date(b.createdAt ?? 0).getTime();

            return dateB - dateA;
        });

    return {
        resumes,
        currentResumeVersions,
        analyses,
    };
}

export async function fetchAnalyses(): Promise<ServerResumeAnalysis[]> {
    const data = await fetchAnalysisData();
    return data.analyses;
}
