
import {
    getResumes,
    getResumeVersionById,
    getResumeVersions,
    getResumeAnalyses, getResumeAnalysisById,
} from "@/lib/api/resumes";

import type {
    Resume,
    ResumeVersion,
    ServerResumeAnalysis,
    ServerResumeVersion,
} from "@/utils/types";

export interface AnalysisData {
    resumes: Resume[];
    currentResumeVersions: Record<string, ResumeVersion>;
    resumeVersions: Record<string, ServerResumeVersion[]>;
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

    const [currentVersionResults, allVersionResults, analysisResults] =
        await Promise.all([
            Promise.all(
                resumes.map(async (resume) => {
                    try {
                        const version = await getResumeVersionById(
                            resume.id,
                            resume.currentVersionId
                        );
                        return { resumeId: resume.id, version };
                    } catch (error) {
                        console.error(
                            `Failed to load current version for ${resume.id}:`,
                            error
                        );
                        return { resumeId: resume.id, version: null };
                    }
                })
            ),

            Promise.all(
                resumes.map(async (resume) => {
                    try {
                        const versions: ServerResumeVersion[] =
                            await getResumeVersions(resume.id);

                        return { resumeId: resume.id, versions };
                    } catch (error) {
                        console.error(
                            `Failed to load versions for ${resume.id}:`,
                            error
                        );
                        return { resumeId: resume.id, versions: [] };
                    }
                })
            ),

            Promise.all(
                resumes.map(async (resume) => {
                    try {
                        return await getResumeAnalyses(resume.id);
                    } catch (error) {
                        console.error(
                            `Failed to load analyses for ${resume.id}:`,
                            error
                        );
                        return [];
                    }
                })
            ),
        ]);

    const currentResumeVersions: Record<string, ResumeVersion> = {};

    for (const { resumeId, version } of currentVersionResults) {
        if (version) {
            currentResumeVersions[resumeId] = version;
        }
    }

    const resumeVersions: Record<string, ServerResumeVersion[]> = {};

    for (const { resumeId, versions } of allVersionResults) {
        resumeVersions[resumeId] = versions;
    }

    const analyses = analysisResults
        .flat()
        .sort(
            (a, b) =>
                new Date(b.createdAt ?? 0).getTime() -
                new Date(a.createdAt ?? 0).getTime()
        );

    return {
        resumes,
        currentResumeVersions,
        resumeVersions,
        analyses,
    };
}

export async function fetchAnalyses(): Promise<ServerResumeAnalysis[]> {
    const data = await fetchAnalysisData();
    return data.analyses;
}
