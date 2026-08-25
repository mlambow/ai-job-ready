import {gemini} from "@/lib/gemini/client";
import {AIResumeAnalysisResponse, analysisSchema} from "@/utils/types";

export async function analyzeResumeWithAI(
    resumeText: string,
    jobTitle: string,
    companyName: string | null,
    jobDescription: string,
): Promise<AIResumeAnalysisResponse> {
    const prompt = `
You are an expert ATS resume analyzer and technical recruiter. Analyze the candidate's resume against the provided job opportunity.
Your goal is to provide an accurate and helpful analysis based only on the information provided.
JOB TITLE:${jobTitle}
COMPANY:${companyName ?? "Not provided"}
JOB DESCRIPTION:${jobDescription}
RESUME:${resumeText}
Analyze the resume and return:

1. atsScore:
A score from 0 to 100 representing how well the resume is optimized for Applicant Tracking Systems.

2. jobMatchScore:
A score from 0 to 100 representing how well the candidate matches the job requirements.

3. keywordAnalysis:
- matched: important keywords and skills from the job description found in the resume.
- missing: important keywords and skills from the job description missing from the resume.

4. strengths:
A list of the strongest aspects of the resume relevant to this job.

5. improvements:
A list of specific, actionable improvements that could help the candidate improve their chances of getting this job.

6. summary:
A concise overall assessment of the candidate's resume and job fit.

IMPORTANT RULES:
- Scores must be numbers between 0 and 100.
- Do not invent skills, experience, qualifications, or achievements.
- Base the analysis only on the resume and job description.
- Be specific and actionable.
- Do not include markdown formatting.
`;

    const response =
        await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,

            config: {
                responseMimeType: "application/json",

                responseJsonSchema: analysisSchema,
            },
        });

    if (!response.text) {
        throw new Error(
            "Gemini returned an empty response.",
        );
    }

    return JSON.parse(response.text) as AIResumeAnalysisResponse;
}