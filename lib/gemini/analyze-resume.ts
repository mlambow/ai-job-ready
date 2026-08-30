import {gemini} from "@/lib/gemini/client";
import {AIResumeAnalysisResponse, analysisSchema} from "@/utils/types";
import {AIResponseFormat} from "@/utils/constants";

export async function analyzeResumeWithAI(
    resumeText: string,
    jobTitle: string,
    companyName: string | null,
    jobDescription: string,
): Promise<AIResumeAnalysisResponse> {
    const prompt = `
You are an expert resume reviewer and ATS optimization specialist.

Analyze the candidate's resume against the provided job description.

Your analysis must be specific to the resume and job description. Do not give generic advice.

Score all numerical fields from 0 to 100.

For tips:

- "good" means the resume performs well in that area.
- "improve" means the area could be improved.
- "unsatisfactory" means the area is significantly weak or missing.

For missing skills and keywords, only include skills and keywords that are relevant to the provided job description.

For recommended metrics, suggest realistic measurable achievements that the candidate could add where appropriate. Do not invent false achievements. Phrase them as recommendations.

Resume:
${resumeText}

Job Description:
${jobDescription}

Job Title:
${jobTitle}

Company name:
${companyName}

${AIResponseFormat}

Return only valid JSON matching the required structure.
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